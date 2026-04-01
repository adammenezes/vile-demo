import { Pinecone } from '@pinecone-database/pinecone';

const GEMINI_EMBED_MODEL = 'gemini-embedding-001';
const GEMINI_EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBED_MODEL}:embedContent`;

/**
 * Call the Google Gemini embedding API directly.
 * Returns an array of float arrays, one per input string.
 */
async function fetchEmbeddings(texts) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set.');

  const results = await Promise.all(
    texts.map(async (text) => {
      const res = await fetch(`${GEMINI_EMBED_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${GEMINI_EMBED_MODEL}`,
          content: { parts: [{ text }] },
          outputDimensionality: 2048,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Embedding API error ${res.status}: ${err}`);
      }

      const data = await res.json();
      return data.embedding.values;
    })
  );

  return results;
}

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
  const [embedding] = await fetchEmbeddings([text]);
  return embedding;
}

/**
 * Generates multiple embeddings for document ingestion.
 */
export async function getDocumentEmbeddings(chunks) {
  return fetchEmbeddings(chunks);
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
