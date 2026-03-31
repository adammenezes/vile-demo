"use client";
import { useRole } from '../../../components/RoleProvider';
import { useContentEngine } from '../../../context/ContentEngineContext';
import { UploadCloud, FileText, CheckCircle2, MoreVertical, Loader2, Database } from "lucide-react";
import { useState } from "react";

const NEW_DOC_TEMPLATE = {
  id: 'conflict-resolution',
  name: "Conflict_Resolution_Framework.pdf",
  size: "1.8 MB",
  date: "Sep 02",
  topics: ["Acknowledgment", "Root Cause", "Negotiation", "Agreement Framework"],
  chunks: 22,
};

export default function CourseModules() {
  const { role } = useRole();
  const { docs, addDoc } = useContentEngine();
  const isTeacher = role === 'teacher';

  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const alreadyAdded = docs.some(d => d.id === 'conflict-resolution');

  const handleSimulateUpload = (e) => {
    e.preventDefault();
    if (!isTeacher || isUploading || alreadyAdded) return;
    setIsUploading(true);
    setUploadProgress(0);

    const steps = [20, 45, 70, 90, 100];
    steps.forEach((val, i) => {
      setTimeout(() => {
        setUploadProgress(val);
        if (val === 100) {
          addDoc(NEW_DOC_TEMPLATE);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 600);
        }
      }, (i + 1) * 350);
    });
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

          <div
            onClick={handleSimulateUpload}
            onDragOver={(e) => { e.preventDefault(); if (!alreadyAdded) setIsHovering(true); }}
            onDragLeave={() => setIsHovering(false)}
            onMouseEnter={() => { if (!alreadyAdded && !isUploading) setIsHovering(true); }}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              border: `2px dashed ${isHovering ? 'var(--primary)' : 'var(--card-border)'}`,
              backgroundColor: isHovering ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.02)',
              borderRadius: 'var(--radius)', padding: '3rem 2rem', textAlign: 'center',
              cursor: alreadyAdded ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: alreadyAdded ? 0.55 : 1
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', marginBottom: '1rem' }}>
              {isUploading ? <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} /> : <UploadCloud size={28} />}
            </div>

            {isUploading ? (
              <div>
                <h3 style={{ fontWeight: 500, fontSize: '1.05rem', marginBottom: '0.75rem' }}>
                  Parsing & Chunking Document...
                </h3>
                <div style={{ width: '60%', margin: '0 auto', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--primary)', borderRadius: '100px', transition: 'width 0.3s ease' }} />
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginTop: '0.6rem' }}>
                  {uploadProgress}% — Generating embeddings...
                </p>
              </div>
            ) : alreadyAdded ? (
              <div>
                <h3 style={{ fontWeight: 500, fontSize: '1.05rem', marginBottom: '0.4rem', color: 'var(--muted-foreground)' }}>
                  Demo document already indexed
                </h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.82rem' }}>
                  Remove it from the Content Engine to re-upload.
                </p>
              </div>
            ) : (
              <>
                <h3 style={{ fontWeight: 500, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                  Click or drag a PDF to index
                </h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
                  Documents uploaded here become the strict knowledge base for the Course AI Assistant.
                </p>
                <p style={{ color: 'var(--primary)', fontSize: '0.78rem', marginTop: '0.5rem', fontWeight: 500 }}>
                  Demo: click to upload "Conflict_Resolution_Framework.pdf"
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
