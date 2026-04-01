import { Pinecone } from '@pinecone-database/pinecone';

const EMBED_MODEL = 'gemini-embedding-001';
const EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent`;

async function fetchEmbeddings(texts) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set.');

  const results = await Promise.all(
    texts.map(async (text) => {
      const res = await fetch(`${EMBED_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${EMBED_MODEL}`,
          content: { parts: [{ text }] },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Embedding API error ${res.status}: ${err}`);
      }

      const data = await res.json();

      // ===== DIAGNOSTIC: log raw structure =====
      console.log('[RAG] Raw embedding API response keys:', Object.keys(data));
      if (data.embedding) {
        console.log('[RAG] data.embedding keys:', Object.keys(data.embedding));
        console.log('[RAG] values length:', data.embedding?.values?.length);
      } else {
        console.log('[RAG] FULL RESPONSE (no .embedding key):', JSON.stringify(data).slice(0, 300));
      }
      // =========================================

      const values = data?.embedding?.values ?? data?.embeddings?.[0]?.values ?? null;
      if (!values) throw new Error(`Could not extract embedding values from response: ${JSON.stringify(data).slice(0, 200)}`);
      return values;
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
  const chunks = chunkText(text).filter(c => c.trim().length > 0);
  console.log('[RAG] text length:', text.length, '| chunks:', chunks.length);
  if (chunks.length === 0) throw new Error('No usable text content could be extracted from the document.');

  const embeddings = await getDocumentEmbeddings(chunks);
  console.log('[RAG] embeddings received:', embeddings.length, '| first dim:', embeddings[0]?.length);

  const vectors = chunks.map((chunk, i) => ({
    id: `${docId}-chunk-${i}`,
    values: embeddings[i],
    metadata: { text: chunk, docId },
  })).filter(v => Array.isArray(v.values) && v.values.length > 0);

  console.log('[RAG] vectors to upsert:', vectors.length);
  if (vectors.length === 0) throw new Error('Embeddings were empty — no vectors to upsert.');

  const pineconeIndex = getIndex();

  // Pinecone SDK v7 serverless: upsert takes { records: [...] }
  await pineconeIndex.upsert({ records: vectors });
  console.log('[RAG] Upsert complete:', vectors.length, 'vectors stored.');
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

  // Pinecone SDK v7 serverless indexes use searchRecords() with a query vector
  const queryResponse = await pineconeIndex.query({
    vector: queryEmbedding,
    topK: 5,
    includeMetadata: true,
  });

  const matches = queryResponse.matches?.filter(m => m.score > 0.3) ?? [];

  const context = matches
    .map((match) => match.metadata?.text)
    .filter(Boolean)
    .join('\n\n---\n\n');

  const sourceDocIds = [...new Set(matches.map((m) => m.metadata?.docId).filter(Boolean))];

  return { context, sourceDocIds };
}
