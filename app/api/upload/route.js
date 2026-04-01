import { NextResponse } from 'next/server';
import { indexDocument } from '@/app/lib/rag-engine';

// pdfjs-dist (used internally by pdf-parse) requires browser APIs not present in Node.js
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
      this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
      this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
      this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
      this.is2D = true; this.isIdentity = true;
    }
    multiply() { return new globalThis.DOMMatrix(); }
    translate() { return new globalThis.DOMMatrix(); }
    scale() { return new globalThis.DOMMatrix(); }
    rotate() { return new globalThis.DOMMatrix(); }
    inverse() { return new globalThis.DOMMatrix(); }
    transformPoint(p) { return p || { x: 0, y: 0 }; }
  };
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
      const pdfParse = (await import('pdf-parse')).default;
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
