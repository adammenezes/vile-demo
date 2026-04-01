"use client";
import { useChat } from '@ai-sdk/react';
import { Send, Bot, User, FileText, CheckCircle2, Sparkles, Brain, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRole } from '../../../components/RoleProvider';
import { useContentEngine } from '../../../context/ContentEngineContext';

const QUICK_ACTIONS = [
  { label: 'Generate Quiz', icon: Sparkles, prompt: 'Generate a 5-question multiple-choice quiz with answer key based on the indexed course materials. Format each question clearly with options A–D.' },
  { label: 'Study Guide', icon: BookOpen, prompt: 'Create a concise study guide covering all key concepts from the current indexed materials. Use clear headers and bullet points.' },
  { label: 'Practice Scenarios', icon: Brain, prompt: 'Write 3 realistic email writing practice scenarios for students, based strictly on the course content. Include a brief rubric for each.' },
];

export default function AiAssistant() {
  const { role } = useRole();
  const { indexedDocs, totalChunks } = useContentEngine();
  const isTeacher = role === 'teacher';

  const [activeSourceIds, setActiveSourceIds] = useState([]);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, data } = useChat({
    api: '/api/chat',
    body: { role },
    initialMessages: [
      {
        id: 'init',
        role: 'assistant',
        content: isTeacher
          ? `Welcome back, Professor Sullivan! I have ${indexedDocs.length} document(s) loaded — ${totalChunks} total chunks indexed. Use the quick actions to generate content, or ask a question to verify my knowledge grounding.`
          : `Hello! I'm the AI Study Assistant for COM 301. I'm grounded in ${indexedDocs.length} document(s) uploaded by Professor Sullivan. Ask me anything about the course materials!`
      }
    ]
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update active sources from the streamed data whenever a response completes
  useEffect(() => {
    if (!isLoading && data && data.length > 0) {
      const latest = [...data].reverse().find(d => d?.sourceDocIds);
      if (latest) setActiveSourceIds(latest.sourceDocIds);
    }
    if (isLoading) setActiveSourceIds([]);
  }, [isLoading, data]);

  const userBubbleColor = isTeacher ? 'rgba(245, 158, 11, 0.15)' : 'var(--primary)';
  const userBubbleBorder = isTeacher ? '1px solid rgba(245, 158, 11, 0.3)' : 'none';
  const userAvatarColor = isTeacher ? '#d97706' : 'var(--primary)';
  const sendBtnColor = isTeacher ? '#d97706' : 'var(--primary)';

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 6rem)', animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Main Chat Column ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Brain color="var(--primary)" size={28} />
            AI Study Assistant
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '0.25rem', fontSize: '0.85rem' }}>
            {isTeacher
              ? 'Teacher Mode · Verify RAG grounding · Generate course content · Test student experience'
              : `Grounded in ${indexedDocs.length} document(s) from Prof. Sullivan · Answers strictly from indexed course materials`}
          </p>
        </div>

        {/* Teacher Quick Actions */}
        {isTeacher && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => append({ role: 'user', content: action.prompt })}
                disabled={isLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  opacity: isLoading ? 0.5 : 1, transition: 'all 0.2s'
                }}
              >
                <action.icon size={13} /> {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Chat Panel */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', gap: '1rem', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: m.role === 'user' ? userAvatarColor : 'rgba(255,255,255,0.08)',
                  color: 'white', flexShrink: 0
                }}>
                  {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div style={{
                  background: m.role === 'user' ? userBubbleColor : 'rgba(255,255,255,0.05)',
                  padding: '1rem 1.25rem', borderRadius: '12px', maxWidth: '85%',
                  fontSize: '0.95rem', lineHeight: 1.7,
                  border: m.role === 'user' ? userBubbleBorder : '1px solid var(--card-border)',
                  borderTopRightRadius: m.role === 'user' ? 0 : '12px',
                  borderTopLeftRadius: m.role === 'user' ? '12px' : 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Searching indicator */}
            {isLoading && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
                  <Bot size={20} color="var(--primary)" />
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.04)', padding: '0.9rem 1.25rem',
                  borderRadius: '12px', borderTopLeftRadius: 0,
                  border: '1px solid var(--card-border)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  color: 'var(--muted-foreground)', fontSize: '0.88rem'
                }}>
                  <Loader2 size={15} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                  Searching knowledge base...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
              <input
                value={input}
                onChange={handleInputChange}
                className="input-field"
                placeholder={isTeacher
                  ? 'Ask a verification question, or request quiz / study guide generation...'
                  : 'Ask about course materials, assignments, policies...'}
                style={{ padding: '1rem 4rem 1rem 1.25rem', fontSize: '0.95rem', borderRadius: '8px' }}
              />
              <button
                type="submit"
                disabled={isLoading || !input}
                style={{
                  position: 'absolute', right: '0.5rem', top: '0.5rem', bottom: '0.5rem',
                  padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '6px', background: sendBtnColor, border: 'none', cursor: 'pointer',
                  opacity: isLoading || !input ? 0.5 : 1, transition: 'opacity 0.2s', color: 'white'
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ width: '268px', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>

        {/* Knowledge Base */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={13} /> Knowledge Base
          </h3>

          {indexedDocs.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>No documents indexed yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {indexedDocs.map(doc => {
                const isActive = activeSourceIds.includes(doc.id);
                return (
                  <div key={doc.id} style={{
                    padding: '0.75rem', borderRadius: '8px',
                    border: `1px solid ${isActive ? 'rgba(59,130,246,0.5)' : 'var(--card-border)'}`,
                    background: isActive ? 'rgba(59,130,246,0.07)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.35s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <FileText size={13} color={isActive ? 'var(--primary)' : 'var(--muted-foreground)'} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 600, color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)', lineHeight: 1.3 }}>{doc.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>{doc.chunks} chunks</div>
                      </div>
                    </div>
                    {isActive && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                        <CheckCircle2 size={11} /> Referenced in last response
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)', fontSize: '0.7rem', color: 'var(--muted-foreground)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{indexedDocs.length} docs indexed</span>
            <span>{totalChunks} chunks</span>
          </div>
        </div>

        {/* Teacher Info Panel */}
        {isTeacher && (
          <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#f59e0b', marginBottom: '0.5rem' }}>Teacher Mode</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: 1.55 }}>
              Verify the AI's grounding. Use quick actions to generate course content, or ask questions to stress-test the knowledge boundaries.
            </p>
            <a href="modules" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.75rem', fontSize: '0.74rem', color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>
              Manage Documents <ChevronRight size={12} />
            </a>
          </div>
        )}

        {/* Student Info Panel */}
        {!isTeacher && (
          <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--primary)', marginBottom: '0.5rem' }}>Study Tip</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: 1.55 }}>
              This AI only knows what Prof. Sullivan has uploaded. Ask specific questions about course policies, assignments, or lecture content for best results.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
