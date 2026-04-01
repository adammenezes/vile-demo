"use client";
import { useRole } from '../../../components/RoleProvider';
import { useContentEngine } from '../../../context/ContentEngineContext';
import { UploadCloud, FileText, CheckCircle2, MoreVertical, Loader2, Database, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";

export default function CourseModules() {
  const { role } = useRole();
  const { docs, registerDoc } = useContentEngine();
  const isTeacher = role === 'teacher';

  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (file) => {
    if (!file || !isTeacher || isUploading) return;

    setUploadError('');
    setIsUploading(true);
    setUploadProgress(10);
    setUploadingFileName(file.name);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 12, 85));
    }, 400);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', { method: 'POST', body: formData });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const errBody = contentType.includes('application/json')
          ? (await response.json()).error
          : await response.text();
        throw new Error(errBody || `Upload failed (${response.status})`);
      }

      const result = await response.json();
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

      registerDoc({ id: result.docId, name: result.name, size: result.size, date: dateStr, chunks: result.chunkCount });

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadingFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 700);

    } catch (error) {
      clearInterval(progressInterval);
      setUploadError(error.message);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingFileName('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div style={{ maxWidth: '900px', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Course Modules</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>Week 1: Fundamentals of Professional Communication</p>
        </div>
        {isTeacher && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            EDITING CAPABILITIES ACTIVE
          </div>
        )}
      </div>

      {/* ── Teacher Upload Zone ── */}
      {isTeacher && (
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--foreground)' }}>
              Upload to RAG Knowledge Base
            </h2>
            <a href="content-engine" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#f59e0b', textDecoration: 'none', fontWeight: 600, padding: '0.3rem 0.7rem', borderRadius: '6px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Database size={13} /> Manage Content Engine
            </a>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
          />

          <div
            onClick={() => { if (!isUploading) fileInputRef.current?.click(); }}
            onDragOver={e => { e.preventDefault(); if (!isUploading) setIsHovering(true); }}
            onDragLeave={() => setIsHovering(false)}
            onDrop={handleDrop}
            onMouseEnter={() => { if (!isUploading) setIsHovering(true); }}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              border: `2px dashed ${isHovering ? 'var(--primary)' : uploadError ? '#ef4444' : 'var(--card-border)'}`,
              backgroundColor: isHovering ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.02)',
              borderRadius: 'var(--radius)', padding: '3rem 2rem', textAlign: 'center',
              cursor: isUploading ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: uploadError ? 'rgba(239,68,68,0.1)' : 'rgba(59, 130, 246, 0.1)', color: uploadError ? '#ef4444' : 'var(--primary)', marginBottom: '1rem' }}>
              {isUploading ? (
                <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
              ) : uploadError ? (
                <AlertCircle size={28} />
              ) : (
                <UploadCloud size={28} />
              )}
            </div>

            {isUploading ? (
              <div>
                <h3 style={{ fontWeight: 500, fontSize: '1.05rem', marginBottom: '0.4rem' }}>
                  {uploadProgress < 90 ? 'Parsing & chunking document...' : 'Generating embeddings...'}
                </h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                  {uploadingFileName}
                </p>
                <div style={{ width: '60%', margin: '0 auto', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--primary)', borderRadius: '100px', transition: 'width 0.3s ease' }} />
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginTop: '0.6rem' }}>{uploadProgress}%</p>
              </div>
            ) : uploadError ? (
              <div>
                <h3 style={{ fontWeight: 500, fontSize: '1.05rem', marginBottom: '0.4rem', color: '#ef4444' }}>Upload failed</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{uploadError}</p>
                <p style={{ color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 500 }}>Click to try again</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontWeight: 500, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                  Click or drag a file to index
                </h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
                  Documents uploaded here become the knowledge base for the Course AI Assistant.
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem', marginTop: '0.4rem' }}>
                  Supported formats: PDF, TXT, MD
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Published Materials ── */}
      <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>Published Materials</h2>
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {docs.map((f, i) => (
          <div
            key={f.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: i === docs.length - 1 ? 'none' : '1px solid var(--card-border)',
              background: 'rgba(255,255,255,0.01)', transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px' }}>
                <FileText color="var(--primary)" size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '2px' }}>{f.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                  Added {f.date} · {f.chunks} chunks
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {isTeacher && (
                f.status === 'indexing' ? (
                  <div style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Indexing
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> Indexed
                  </div>
                )
              )}
              <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{f.size}</span>
              {isTeacher && <MoreVertical size={18} color="var(--muted-foreground)" style={{ cursor: 'pointer' }} />}
            </div>
          </div>
        ))}

        {docs.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
            No materials published yet.
          </div>
        )}
      </div>
    </div>
  );
}
