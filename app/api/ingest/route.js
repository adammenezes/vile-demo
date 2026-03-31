import { indexDocument } from '@/app/lib/rag-engine';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { docId, text } = await req.json();

    if (!docId || !text) {
      return NextResponse.json({ error: 'Missing document ID or text' }, { status: 400 });
    }

    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
      // In a real staging environment, we'd throw. 
      // For the demo, we log this clearly so the user knows they need to fill .env.local
      console.warn('RAG Ingestion: Skipping Pinecone because API keys are missing in .env.local');
      return NextResponse.json({
        success: true,
        mocked: true,
        message: 'Simulation: API keys missing. In production, this would index to Pinecone.'
      });
    }

    const { chunkCount } = await indexDocument(docId, text);

    return NextResponse.json({
      success: true,
      chunkCount
    });
  } catch (error) {
    console.error('Ingestion Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
