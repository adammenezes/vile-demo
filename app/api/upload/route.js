import { NextResponse } from 'next/server';
import { indexDocument } from '@/app/lib/rag-engine';

// pdfjs-dist (used by pdf-parse) calls browser APIs unavailable in Node.js.
// Stub them out so text extraction works without a headless browser.
if (typeof globalThis.DOMMatrix === 'undefined') {
  class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
      this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
      this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
      this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
      this.is2D = true; this.isIdentity = true;
    }
    // All transform methods return a new identity matrix (good enough for text extraction)
    multiply()          { return new DOMMatrix(); }
    translate()         { return new DOMMatrix(); }
    scale()             { return new DOMMatrix(); }
    rotate()            { return new DOMMatrix(); }
    rotateAxisAngle()   { return new DOMMatrix(); }
    rotateFromVector()  { return new DOMMatrix(); }
    skewX()             { return new DOMMatrix(); }
    skewY()             { return new DOMMatrix(); }
    flipX()             { return new DOMMatrix(); }
    flipY()             { return new DOMMatrix(); }
    inverse()           { return new DOMMatrix(); }
    transformPoint(p)   { return p || { x: 0, y: 0, z: 0, w: 1 }; }
    toFloat32Array()    { return new Float32Array(16); }
    toFloat64Array()    { return new Float64Array(16); }
    toString()          { return 'matrix(1, 0, 0, 1, 0, 0)'; }
    static fromMatrix() { return new DOMMatrix(); }
    static fromFloat32Array() { return new DOMMatrix(); }
    static fromFloat64Array() { return new DOMMatrix(); }
  }
  globalThis.DOMMatrix = DOMMatrix;
}

if (typeof globalThis.DOMPoint === 'undefined') {
  globalThis.DOMPoint = class DOMPoint {
    constructor(x = 0, y = 0, z = 0, w = 1) { this.x = x; this.y = y; this.z = z; this.w = w; }
    static fromPoint(p) { return new globalThis.DOMPoint(p?.x, p?.y, p?.z, p?.w); }
    matrixTransform() { return new globalThis.DOMPoint(); }
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
