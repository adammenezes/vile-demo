import { NextResponse } from 'next/server';
import { indexDocument } from '@/app/lib/rag-engine';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text = '';
    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isTXT = file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md');

    if (isPDF) {
      const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (isTXT) {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'Could not extract any text from the document.' }, { status: 400 });
    }

    const docId = file.name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
      return NextResponse.json({
        success: true,
        mocked: true,
        docId,
        name: file.name,
        size: sizeMB,
        chunkCount: Math.ceil(text.length / 1000),
      });
    }

    const { chunkCount } = await indexDocument(docId, text);

    return NextResponse.json({ success: true, docId, name: file.name, size: sizeMB, chunkCount });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
