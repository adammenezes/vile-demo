"use client";
import { useChat } from '@ai-sdk/react';
import { useRole } from '../../../components/RoleProvider';
import { useContentEngine } from '../../../context/ContentEngineContext';
import { useRef, useState, useEffect } from 'react';
import {
  Plus, FileText, CheckCircle2, Loader2, Trash2, Send, Bot, User,
  Sparkles, BookOpen, Brain, TrendingUp, UploadCloud, AlertCircle
} from 'lucide-react';

const STUDIO_ACTIONS = [
  { label: 'Study Guide', icon: BookOpen, color: '#3b82f6', prompt: 'Create a comprehensive study guide covering every key concept from all indexed course materials. Use clear section headers and bullet points.' },
  { label: 'Generate Quiz', icon: Sparkles, color: '#f59e0b', prompt: 'Generate a 5-question multiple-choice quiz with answer key based on all indexed course materials. Number each question and label the options A–D.' },
  { label: 'Practice Scenarios', icon: Brain, color: '#10b981', prompt: 'Write 3 realistic professional communication practice scenarios based on the course content. Include a grading rubric for each scenario.' },
  { label: 'Weekly Recap', icon: TrendingUp, color: '#a855f7', prompt: 'Write a weekly recap summarizing the key takeaways from the indexed course materials in an engaging tone.' },
];

export default function AiAssistant() {
  const { role } = useRole();
  const { docs, indexedDocs, totalChunks, registerDoc, removeDoc } = useContentEngine();
  const isTeacher = role === 'teacher';

  // Upload state
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);

  // Source citation state
  const [activeSourceIds, setActiveSourceIds] = useState([]);

  // Studio state
  const [studioOutput, setStudioOutput] = useState('');

  const messagesEndRef = useRef(null);

  // Main chat
  const { messages, input, handleInputChange, handleSubmit, isLoading, append, data } = useChat({
    api: '/api/chat',
    body: { role },
    initialMessages: [
      {
        id: 'init',
        role: 'assistant',
        content: isTeacher
          ? `Welcome back, Professor Sullivan! ${indexedDocs.length} source(s) loaded — ${totalChunks} chunks indexed. Add sources using the panel on the left, or use the Studio to generate course materials.`
          : `Hello! I'm grounded in ${indexedDocs.length} source(s) uploaded by Prof. Sullivan. Ask me anything about the course materials.`
      }
    ]
  });

  // Studio chat — separate instance for content generation
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
    <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 6rem)', animation: 'fadeIn 0.5s ease-out', overflow: 'hidden' }}>

      {/* ── Sources Panel ── */}
      <div style={{ width: '248px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>

          {/* Header */}
          <div style={{ padding: '1rem 1.1rem', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>Sources</span>
            {isTeacher && (
              <button
                onClick={() => { setShowUploadZone(v => !v); setUploadError(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.28rem 0.6rem', borderRadius: '6px', fontSize: '0.73rem', fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer' }}
              >
                <Plus size={12} /> Add
              </button>
            )}
          </div>

          {/* Inline upload zone */}
          {isTeacher && showUploadZone && (
            <div style={{ padding: '0.65rem', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
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
                  border: `1.5px dashed ${isHovering ? 'var(--primary)' : uploadError ? '#ef4444' : 'var(--card-border)'}`,
                  borderRadius: '8px', padding: '1rem 0.75rem', textAlign: 'center',
                  cursor: isUploading ? 'default' : 'pointer',
                  background: isHovering ? 'rgba(59,130,246,0.05)' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                {isUploading ? (
                  <div>
                    <Loader2 size={18} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', marginBottom: '0.4rem' }} />
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadingFileName}</div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '100px', height: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--primary)', borderRadius: '100px', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', marginTop: '0.3rem' }}>{uploadProgress}%</div>
                  </div>
                ) : uploadError ? (
                  <div>
                    <AlertCircle size={16} color="#ef4444" style={{ marginBottom: '0.3rem' }} />
                    <div style={{ fontSize: '0.72rem', color: '#ef4444', marginBottom: '0.2rem' }}>Upload failed</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--muted-foreground)' }}>{uploadError}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--primary)', marginTop: '0.3rem' }}>Click to retry</div>
                  </div>
                ) : (
                  <div>
                    <UploadCloud size={18} color="var(--muted-foreground)" style={{ marginBottom: '0.35rem' }} />
                    <div style={{ fontSize: '0.73rem', color: 'var(--muted-foreground)' }}>Click or drop file</div>
                    <div style={{ fontSize: '0.63rem', color: 'var(--muted-foreground)', marginTop: '0.2rem', opacity: 0.7 }}>PDF · TXT · MD</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Source list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.65rem' }}>
            {docs.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', fontStyle: 'italic', textAlign: 'center', paddingTop: '1.25rem' }}>
                No sources added yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {docs.map(doc => {
                  const isActive = activeSourceIds.includes(doc.id);
                  return (
                    <div key={doc.id} style={{
                      padding: '0.6rem 0.7rem', borderRadius: '8px',
                      border: `1px solid ${isActive ? 'rgba(59,130,246,0.5)' : 'var(--card-border)'}`,
                      background: isActive ? 'rgba(59,130,246,0.07)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.3s ease',
                      display: 'flex', alignItems: 'flex-start', gap: '0.5rem'
                    }}>
                      <FileText size={12} color={isActive ? 'var(--primary)' : 'var(--muted-foreground)'} style={{ marginTop: '3px', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--muted-foreground)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {doc.status === 'indexing' ? (
                            <><Loader2 size={9} style={{ animation: 'spin 1s linear infinite' }} /> Indexing...</>
                          ) : (
                            <><CheckCircle2 size={9} color="#10b981" /> {doc.chunks} chunks</>
                          )}
                        </div>
                        {isActive && (
                          <div style={{ fontSize: '0.63rem', color: 'var(--primary)', marginTop: '3px', fontWeight: 600 }}>
                            Referenced
                          </div>
                        )}
                      </div>
                      {isTeacher && (
                        <button
                          onClick={() => removeDoc(doc.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '1px', display: 'flex', flexShrink: 0, transition: 'color 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseOut={e => e.currentTarget.style.color = 'var(--muted-foreground)'}
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

          {/* Footer */}
          <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--muted-foreground)', flexShrink: 0 }}>
            <span>{indexedDocs.length} sources</span>
            <span>{totalChunks} chunks</span>
          </div>
        </div>
      </div>

      {/* ── Chat Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>

          {/* Header */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>AI Study Assistant</div>
            <div style={{ fontSize: '0.73rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>
              {isTeacher
                ? 'Teacher Mode · Verify grounding · Test student experience'
                : `Grounded in ${indexedDocs.length} source(s) from Prof. Sullivan`}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', gap: '0.75rem', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: m.role === 'user'
                    ? (isTeacher ? 'rgba(217,119,6,0.85)' : 'var(--primary)')
                    : 'rgba(255,255,255,0.08)',
                  color: 'white'
                }}>
                  {m.role === 'user' ? <User size={17} /> : <Bot size={17} />}
                </div>
                <div style={{
                  background: m.role === 'user'
                    ? (isTeacher ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.13)')
                    : 'rgba(255,255,255,0.05)',
                  padding: '0.85rem 1.1rem', borderRadius: '10px', maxWidth: '82%',
                  fontSize: '0.9rem', lineHeight: 1.65, whiteSpace: 'pre-wrap',
                  border: m.role === 'user'
                    ? `1px solid ${isTeacher ? 'rgba(245,158,11,0.25)' : 'rgba(59,130,246,0.2)'}`
                    : '1px solid var(--card-border)',
                  borderTopRightRadius: m.role === 'user' ? 0 : '10px',
                  borderTopLeftRadius: m.role === 'user' ? '10px' : 0,
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
                  <Bot size={17} color="var(--primary)" />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem 1rem', borderRadius: '10px', borderTopLeftRadius: 0, border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
                  <Loader2 size={14} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                  Searching sources...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '0.6rem', position: 'relative' }}>
              <input
                value={input}
                onChange={handleInputChange}
                className="input-field"
                placeholder={isTeacher ? 'Ask a question to verify grounding...' : 'Ask about course materials...'}
                style={{ padding: '0.85rem 3.5rem 0.85rem 1.1rem', fontSize: '0.9rem', borderRadius: '8px' }}
              />
              <button
                type="submit"
                disabled={isLoading || !input}
                style={{
                  position: 'absolute', right: '0.4rem', top: '0.4rem', bottom: '0.4rem',
                  padding: '0 0.9rem', display: 'flex', alignItems: 'center',
                  borderRadius: '6px', background: isTeacher ? '#d97706' : 'var(--primary)',
                  border: 'none', cursor: 'pointer',
                  opacity: isLoading || !input ? 0.5 : 1, transition: 'opacity 0.2s', color: 'white'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Studio Panel ── */}
      <div style={{ width: '248px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>

          {/* Header */}
          <div style={{ padding: '1rem 1.1rem', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>Studio</span>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '0.3rem', lineHeight: 1.45 }}>
              Generate content from your sources.
            </p>
          </div>

          {/* Actions */}
          <div style={{ padding: '0.65rem', borderBottom: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}>
            {STUDIO_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => { setStudioOutput(''); studioAppend({ role: 'user', content: action.prompt }); }}
                disabled={studioLoading || indexedDocs.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.5rem 0.8rem', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 600,
                  cursor: studioLoading || indexedDocs.length === 0 ? 'not-allowed' : 'pointer',
                  background: `${action.color}18`,
                  color: action.color,
                  border: `1px solid ${action.color}33`,
                  opacity: studioLoading || indexedDocs.length === 0 ? 0.5 : 1,
                  transition: 'all 0.2s', textAlign: 'left', width: '100%'
                }}
              >
                <action.icon size={12} /> {action.label}
              </button>
            ))}
          </div>

          {/* Output */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
            {studioLoading && !studioOutput && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>
                <Loader2 size={13} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                Generating...
              </div>
            )}
            {(studioOutput || (studioLoading && studioMessages.length > 0)) ? (
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.78rem', lineHeight: 1.65, color: 'var(--foreground)', fontFamily: 'inherit', margin: 0 }}>
                {studioMessages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || studioOutput}
              </pre>
            ) : !studioLoading && (
              <p style={{ fontSize: '0.76rem', color: 'var(--muted-foreground)', fontStyle: 'italic', lineHeight: 1.5 }}>
                Select an action above to generate content from your indexed sources.
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
