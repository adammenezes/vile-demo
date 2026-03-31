import { Pinecone } from '@pinecone-database/pinecone';
import { google } from '@ai-sdk/google';
import { embed, embedMany } from 'ai';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.index(process.env.PINECONE_INDEX);

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

  await index.upsert(vectors);
  return { chunkCount: chunks.length };
}

/**
 * Performs similarity search in Pinecone and returns text context.
 */
export async function getRelevantContext(queryText) {
  const queryEmbedding = await getQueryEmbedding(queryText);

  const queryResponse = await index.query({
    vector: queryEmbedding,
    topK: 3,
    includeMetadata: true,
  });

  return queryResponse.matches
    .map((match) => match.metadata.text)
    .join('\n\n---\n\n');
}
