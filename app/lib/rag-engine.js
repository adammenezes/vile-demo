import { Pinecone } from '@pinecone-database/pinecone';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { embed, embedMany } from 'ai';

// text-embedding-004 is only available on the v1 API, not v1beta (the SDK default)
const google = createGoogleGenerativeAI({ apiVersion: 'v1' });

let pc = null;
let index = null;

function getIndex() {
  if (index) return index;
  
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
    throw new Error('Pinecone API Key and Index name must be defined in environment.');
  }

  if (!pc) {
    pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }

  index = pc.index(process.env.PINECONE_INDEX);
  return index;
}

/**
 * Splits text into semantic chunks for better retrieval.
 */
export function chunkText(text, size = 1000) {
  // Simplistic chunking by splitting into paragraphs/blocks
  // In a production app, we would use more robust recursive character splitters.
  const paragraphs = text.split(/\n\s*\n/);
  let chunks = [];
  let currentChunk = "";

  for (const p of paragraphs) {
    if ((currentChunk + p).length > size) {
      chunks.push(currentChunk.trim());
      currentChunk = p;
    } else {
      currentChunk += "\n\n" + p;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

/**
 * Generates a single embedding for a query.
 */
export async function getQueryEmbedding(text) {
  const { embedding } = await embed({
    model: google.embedding('text-embedding-004'),
    value: text,
  });
  return embedding;
}

/**
 * Generates multiple embeddings for document ingestion.
 */
export async function getDocumentEmbeddings(chunks) {
  const { embeddings } = await embedMany({
    model: google.embedding('text-embedding-004'),
    values: chunks,
  });
  return embeddings;
}

/**
 * Upserts embedded chunks to Pinecone.
 */
export async function indexDocument(docId, text) {
  const chunks = chunkText(text);
  const embeddings = await getDocumentEmbeddings(chunks);

  const vectors = chunks.map((chunk, i) => ({
    id: `${docId}-chunk-${i}`,
    values: embeddings[i],
    metadata: {
      text: chunk,
      docId: docId,
    },
  }));

  const pineconeIndex = getIndex();
  await pineconeIndex.upsert(vectors);
  return { chunkCount: chunks.length };
}

/**
 * Performs similarity search in Pinecone and returns text context + source doc IDs.
 */
export async function getRelevantContext(queryText) {
  const { context } = await getRelevantContextWithSources(queryText);
  return context;
}

export async function getRelevantContextWithSources(queryText) {
  const queryEmbedding = await getQueryEmbedding(queryText);

  const pineconeIndex = getIndex();
  const queryResponse = await pineconeIndex.query({
    vector: queryEmbedding,
    topK: 5,
    includeMetadata: true,
  });

  const matches = queryResponse.matches.filter(m => m.score > 0.5);

  const context = matches
    .map((match) => match.metadata.text)
    .join('\n\n---\n\n');

  const sourceDocIds = [...new Set(matches.map((m) => m.metadata.docId).filter(Boolean))];

  return { context, sourceDocIds };
}
