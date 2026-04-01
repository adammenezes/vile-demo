import { NextResponse } from 'next/server';
import { indexDocument } from '@/app/lib/rag-engine';

// pdfjs-dist checks for DOMMatrix at import time even when only extracting text.
// Provide a minimal stub so the module loads without error.
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() { this.a=1;this.b=0;this.c=0;this.d=1;this.e=0;this.f=0; }
    static fromMatrix() { return new globalThis.DOMMatrix(); }
    static fromFloat32Array() { return new globalThis.DOMMatrix(); }
    static fromFloat64Array() { return new globalThis.DOMMatrix(); }
  };
}

/**
 * Extract plain text from a PDF buffer using pdfjs-dist's text-content API.
 * This deliberately avoids the rendering pipeline (Canvas/SVG/DOMMatrix operations)
 * so it works in Node.js without a browser environment.
 */
async function extractPdfText(buffer) {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // Disable the worker — not available in Node.js
  GlobalWorkerOptions.workerSrc = '';

  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  });

  const pdfDoc = await loadingTask.promise;
  const pageTexts = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter(item => item.str)
      .map(item => item.str)
      .join(' ');
    pageTexts.push(pageText);
    page.cleanup();
  }

  await pdfDoc.destroy();
  return pageTexts.join('\n');
}

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
      text = await extractPdfText(buffer);
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
