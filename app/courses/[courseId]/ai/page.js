"use client";
import { useChat } from '@ai-sdk/react';
import { useRole } from '../../../components/RoleProvider';
import { useContentEngine } from '../../../context/ContentEngineContext';
import { useRef, useState, useEffect } from 'react';
import {
  Plus, FileText, CheckCircle2, Loader2, Trash2, Send, Bot, User,
  Sparkles, BookOpen, Brain, TrendingUp, UploadCloud, AlertCircle, Zap, X
} from 'lucide-react';

const STUDIO_ACTIONS = [
  { label: 'Study Guide', icon: BookOpen, color: '#6366f1', glow: 'rgba(99,102,241,0.3)', prompt: 'Create a comprehensive study guide covering every key concept from all indexed course materials. Use clear section headers and bullet points.' },
  { label: 'Generate Quiz', icon: Sparkles, color: '#f59e0b', glow: 'rgba(245,158,11,0.3)', prompt: 'Generate a 5-question multiple-choice quiz with answer key based on all indexed course materials. Number each question and label the options A–D.' },
  { label: 'Practice Scenarios', icon: Brain, color: '#10b981', glow: 'rgba(16,185,129,0.3)', prompt: 'Write 3 realistic professional communication practice scenarios based on the course content. Include a grading rubric for each scenario.' },
  { label: 'Weekly Recap', icon: TrendingUp, color: '#a855f7', glow: 'rgba(168,85,247,0.3)', prompt: 'Write a weekly recap summarizing the key takeaways from the indexed course materials in an engaging tone.' },
];

export default function AiAssistant() {
  const { role } = useRole();
  const { docs, indexedDocs, totalChunks, registerDoc, removeDoc } = useContentEngine();
  const isTeacher = role === 'teacher';

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [activeSourceIds, setActiveSourceIds] = useState([]);
  const [studioOutput, setStudioOutput] = useState('');

  const messagesEndRef = useRef(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, data } = useChat({
    api: '/api/chat',
    body: { role },
    initialMessages: [{
      id: 'init', role: 'assistant',
      content: isTeacher
        ? `Welcome back, Professor Sullivan! ${indexedDocs.length} source(s) loaded — ${totalChunks} chunks indexed. Add sources using the panel on the left, or use the Studio to generate course materials.`
        : `Hello! I'm grounded in ${indexedDocs.length} source(s) uploaded by Prof. Sullivan. Ask me anything about the course materials.`
    }]
  });

  const { append: studioAppend, isLoading: studioLoading, messages: studioMessages } = useChat({
    api: '/api/chat',
    body: { role: 'teacher' },
    onFinish: (message) => setStudioOutput(message.content),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading && data?.length > 0) {
      const latest = [...data].reverse().find(d => d?.sourceDocIds);
      if (latest) setActiveSourceIds(latest.sourceDocIds);
    }
    if (isLoading) setActiveSourceIds([]);
  }, [isLoading, data]);

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
        const ct = response.headers.get('content-type') || '';
        const errBody = ct.includes('application/json') ? (await response.json()).error : await response.text();
        throw new Error(errBody || `Upload failed (${response.status})`);
      }

      const result = await response.json();
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      registerDoc({ id: result.docId, name: result.name, size: result.size, date: dateStr, chunks: result.chunkCount });

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadingFileName('');
        setShowUploadZone(false);
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

  return (
    <div className="ai-page-wrapper" style={{
      display: 'flex', gap: '1rem',
      height: 'calc(100vh - 5rem)',
      animation: 'fadeIn 0.5s ease-out',
      overflow: 'hidden',
    }}>

      {/* ══════════════════ SOURCES PANEL ══════════════════ */}
      <div className="ai-sources-panel" style={{ width: '252px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'rgba(8,8,24,0.8)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Panel Header */}
          <div style={{
            padding: '0.9rem 1rem', flexShrink: 0,
            borderBottom: '1px solid var(--card-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(99,102,241,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FileText size={13} color="#a5b4fc" />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
                Sources
              </span>
            </div>
            {isTeacher && (
              <button
                onClick={() => { setShowUploadZone(v => !v); setUploadError(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.25rem 0.55rem', borderRadius: '6px',
                  fontSize: '0.7rem', fontWeight: 700,
                  background: showUploadZone ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.25)',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = showUploadZone ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)'}
              >
                {showUploadZone ? <X size={11} /> : <Plus size={11} />}
                {showUploadZone ? 'Close' : 'Add'}
              </button>
            )}
          </div>

          {/* Upload Zone */}
          {isTeacher && showUploadZone && (
            <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--card-border)', flexShrink: 0, animation: 'fadeIn 0.2s ease-out' }}>
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
                onDrop={e => { e.preventDefault(); setIsHovering(false); const f = e.dataTransfer.files?.[0]; if (f) handleFileUpload(f); }}
                style={{
                  border: `1.5px dashed ${isHovering ? '#6366f1' : uploadError ? '#f43f5e' : 'rgba(99,102,241,0.3)'}`,
                  borderRadius: '10px',
                  padding: '1.1rem 0.75rem',
                  textAlign: 'center',
                  cursor: isUploading ? 'default' : 'pointer',
                  background: isHovering ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.02)',
                  transition: 'all 0.2s ease',
                  boxShadow: isHovering ? '0 0 20px rgba(99,102,241,0.15)' : 'none',
                }}
              >
                {isUploading ? (
                  <div>
                    <Loader2 size={20} color="#a5b4fc" style={{ animation: 'spin 1s linear infinite', marginBottom: '0.4rem' }} />
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {uploadingFileName}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '100px', height: '5px', overflow: 'hidden' }}>
                      <div className="progress-shimmer" style={{ height: '100%', width: `${uploadProgress}%`, borderRadius: '100px', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', marginTop: '0.35rem' }}>{uploadProgress}%</div>
                  </div>
                ) : uploadError ? (
                  <div>
                    <AlertCircle size={18} color="#f43f5e" style={{ marginBottom: '0.3rem' }} />
                    <div style={{ fontSize: '0.72rem', color: '#f43f5e', fontWeight: 600, marginBottom: '0.2rem' }}>Upload failed</div>
                    <div style={{ fontSize: '0.64rem', color: 'var(--muted-foreground)', lineHeight: 1.4, marginBottom: '0.4rem' }}>{uploadError}</div>
                    <div style={{ fontSize: '0.65rem', color: '#a5b4fc', fontWeight: 600 }}>Click to retry</div>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={20} color={isHovering ? '#a5b4fc' : 'var(--muted-foreground)'} style={{ marginBottom: '0.4rem', transition: 'color 0.2s' }} />
                    <div style={{ fontSize: '0.75rem', color: isHovering ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: 500, transition: 'color 0.2s' }}>
                      Click or drop file
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', marginTop: '0.2rem', opacity: 0.7 }}>PDF · TXT · MD</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Source List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem' }}>
            {docs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <FileText size={28} color="rgba(99,102,241,0.2)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  No sources added yet.{isTeacher ? ' Click + Add to upload.' : ''}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {docs.map(doc => {
                  const isActive = activeSourceIds.includes(doc.id);
                  return (
                    <div key={doc.id} style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '10px',
                      border: `1px solid ${isActive ? 'rgba(99,102,241,0.45)' : 'var(--card-border)'}`,
                      background: isActive ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.3s ease',
                      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                      boxShadow: isActive ? '0 0 16px rgba(99,102,241,0.15)' : 'none',
                    }}>
                      <FileText size={12} color={isActive ? '#a5b4fc' : 'var(--muted-foreground)'} style={{ marginTop: '3px', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: '0.63rem', color: 'var(--muted-foreground)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {doc.status === 'indexing' ? (
                            <><Loader2 size={9} style={{ animation: 'spin 1s linear infinite' }} /> Indexing...</>
                          ) : (
                            <><CheckCircle2 size={9} color="#10b981" /> {doc.chunks} chunks</>
                          )}
                        </div>
                        {isActive && (
                          <div style={{ fontSize: '0.62rem', color: '#a5b4fc', marginTop: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Zap size={9} /> Referenced
                          </div>
                        )}
                      </div>
                      {isTeacher && (
                        <button
                          onClick={() => removeDoc(doc.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px', flexShrink: 0, transition: 'color 0.15s', fontFamily: 'inherit' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div style={{
            padding: '0.6rem 1rem', borderTop: '1px solid var(--card-border)',
            display: 'flex', justifyContent: 'space-between',
            fontSize: '0.62rem', color: 'var(--muted-foreground)', flexShrink: 0,
            background: 'rgba(0,0,0,0.2)',
          }}>
            <span>{indexedDocs.length} sources</span>
            <span>{totalChunks} chunks</span>
          </div>
        </div>
      </div>

      {/* ══════════════════ CHAT PANEL ══════════════════ */}
      <div className="ai-chat-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: `1px solid ${isTeacher ? 'rgba(245,158,11,0.2)' : 'var(--card-border)'}`,
          borderRadius: 'var(--radius)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(6,6,18,0.8)',
          boxShadow: isTeacher ? '0 4px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.08)' : 'var(--shadow-card)',
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '1rem 1.5rem', flexShrink: 0,
            borderBottom: `1px solid ${isTeacher ? 'rgba(245,158,11,0.15)' : 'var(--card-border)'}`,
            background: isTeacher ? 'rgba(245,158,11,0.04)' : 'rgba(99,102,241,0.04)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isTeacher
                ? 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(251,146,60,0.2))'
                : 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))',
              border: `1px solid ${isTeacher ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}`,
              boxShadow: isTeacher ? '0 0 12px rgba(245,158,11,0.2)' : '0 0 12px rgba(99,102,241,0.2)',
            }}>
              <Bot size={18} color={isTeacher ? '#fcd34d' : '#a5b4fc'} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                AI Study Assistant
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
                {isTeacher ? 'Teacher Mode · Verifying grounding' : `Grounded in ${indexedDocs.length} source(s)`}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.map((m, idx) => (
              <div
                key={m.id}
                style={{
                  display: 'flex', gap: '0.75rem',
                  flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                  animation: `slideInUp 0.3s ease-out both`,
                  animationDelay: `${idx * 0.03}s`,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: m.role === 'user'
                    ? (isTeacher ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)')
                    : 'rgba(255,255,255,0.07)',
                  border: m.role === 'assistant' ? '1px solid rgba(99,102,241,0.2)' : 'none',
                  boxShadow: m.role === 'user'
                    ? (isTeacher ? '0 0 12px rgba(245,158,11,0.35)' : '0 0 12px rgba(99,102,241,0.35)')
                    : 'none',
                }}>
                  {m.role === 'user' ? <User size={15} color="white" /> : <Bot size={15} color="#a5b4fc" />}
                </div>
                {/* Bubble */}
                <div style={{
                  background: m.role === 'user'
                    ? (isTeacher ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)')
                    : 'rgba(255,255,255,0.04)',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  fontSize: '0.875rem', lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  border: m.role === 'user'
                    ? `1px solid ${isTeacher ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)'}`
                    : '1px solid rgba(255,255,255,0.07)',
                  borderTopRightRadius: m.role === 'user' ? '3px' : '12px',
                  borderTopLeftRadius: m.role === 'user' ? '12px' : '3px',
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: 'flex', gap: '0.75rem', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(99,102,241,0.2)', flexShrink: 0,
                }}>
                  <Bot size={15} color="#a5b4fc" />
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.04)', padding: '0.75rem 1rem',
                  borderRadius: '12px', borderTopLeftRadius: '3px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: 'var(--muted-foreground)', fontSize: '0.8rem',
                }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                  Searching sources...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSubmit} style={{
            padding: '0.85rem 1.25rem',
            borderTop: `1px solid ${isTeacher ? 'rgba(245,158,11,0.12)' : 'var(--card-border)'}`,
            background: 'rgba(0,0,0,0.3)', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
              <input
                value={input}
                onChange={handleInputChange}
                className="input-field"
                placeholder={isTeacher ? 'Ask a question to verify grounding...' : 'Ask about course materials...'}
                style={{ padding: '0.8rem 3.5rem 0.8rem 1rem', fontSize: '0.875rem', borderRadius: '10px' }}
              />
              <button
                type="submit"
                disabled={isLoading || !input}
                style={{
                  position: 'absolute', right: '0.4rem', top: '0.4rem', bottom: '0.4rem',
                  padding: '0 0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '7px',
                  background: isTeacher
                    ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                    : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  border: 'none', cursor: 'pointer',
                  opacity: isLoading || !input ? 0.4 : 1,
                  transition: 'all 0.2s ease', color: 'white',
                  boxShadow: isTeacher ? '0 0 12px rgba(245,158,11,0.3)' : '0 0 12px rgba(99,102,241,0.3)',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { if (!isLoading && input) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none'; }}
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ══════════════════ STUDIO PANEL ══════════════════ */}
      <div className="ai-studio-panel" style={{ width: '252px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'rgba(8,8,24,0.8)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Studio header */}
          <div style={{
            padding: '0.9rem 1rem', flexShrink: 0,
            borderBottom: '1px solid var(--card-border)',
            background: 'rgba(168,85,247,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
              <Sparkles size={13} color="#c084fc" />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
                Studio
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', lineHeight: 1.4, marginTop: '0.25rem' }}>
              Generate content from your sources.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ padding: '0.65rem', borderBottom: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}>
            {STUDIO_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => { setStudioOutput(''); studioAppend({ role: 'user', content: action.prompt }); }}
                disabled={studioLoading || indexedDocs.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.55rem 0.85rem', borderRadius: '8px',
                  fontSize: '0.78rem', fontWeight: 600,
                  cursor: studioLoading || indexedDocs.length === 0 ? 'not-allowed' : 'pointer',
                  background: `${action.color}14`,
                  color: action.color,
                  border: `1px solid ${action.color}30`,
                  opacity: studioLoading || indexedDocs.length === 0 ? 0.45 : 1,
                  transition: 'all 0.2s ease', textAlign: 'left', width: '100%',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  if (!studioLoading && indexedDocs.length > 0) {
                    e.currentTarget.style.background = `${action.color}25`;
                    e.currentTarget.style.borderColor = `${action.color}60`;
                    e.currentTarget.style.boxShadow = `0 0 12px ${action.glow}`;
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${action.color}14`;
                  e.currentTarget.style.borderColor = `${action.color}30`;
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <action.icon size={13} /> {action.label}
              </button>
            ))}
          </div>

          {/* Studio output */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.8rem' }}>
            {studioLoading && !studioOutput && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.78rem', padding: '0.25rem 0' }}>
                <Loader2 size={13} color="#c084fc" style={{ animation: 'spin 1s linear infinite' }} />
                Generating...
              </div>
            )}
            {(studioOutput || (studioLoading && studioMessages.length > 0)) ? (
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.76rem', lineHeight: 1.7, color: 'var(--foreground)', fontFamily: 'inherit', margin: 0 }}>
                {studioMessages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || studioOutput}
              </pre>
            ) : !studioLoading && (
              <p style={{ fontSize: '0.74rem', color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.6, textAlign: 'center', padding: '1rem 0' }}>
                Select an action above to generate content from your indexed sources.
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
