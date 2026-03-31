"use client";
import { useChat } from '@ai-sdk/react';
import { useRole } from '../../../components/RoleProvider';
import { useContentEngine } from '../../../context/ContentEngineContext';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Database, FileText, CheckCircle2, Clock, Sparkles, BookOpen,
  Brain, TrendingUp, AlertTriangle, Send, Loader2, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';

const PERFORMANCE_DATA = [
  { question: '"What is the correct email greeting format?"', count: 31, doc: 'Lecture_01_Email_Etiquette.pdf' },
  { question: '"What is the late submission penalty?"', count: 24, doc: 'Syllabus_Fall_2026.pdf' },
  { question: '"How is the final presentation graded?"', count: 19, doc: 'Syllabus_Fall_2026.pdf' },
  { question: '"How do I write a professional sign-off?"', count: 14, doc: 'Lecture_01_Email_Etiquette.pdf' },
];

const GENERATOR_ACTIONS = [
  { label: 'Generate Quiz', icon: Sparkles, color: '#f59e0b', prompt: 'Generate a 5-question multiple-choice quiz with answer key based on all indexed course materials. Number each question and label the options A–D.' },
  { label: 'Study Guide', icon: BookOpen, color: '#3b82f6', prompt: 'Create a comprehensive study guide covering every key concept from all indexed course materials. Use clear section headers and bullet points.' },
  { label: 'Practice Scenarios', icon: Brain, color: '#10b981', prompt: 'Write 3 realistic professional communication practice scenarios based on the course content. Include a grading rubric for each scenario.' },
  { label: 'Weekly Recap', icon: TrendingUp, color: '#a855f7', prompt: 'Write a weekly recap email that Professor Sullivan could send to students, summarizing the key takeaways from the indexed course materials in an engaging tone.' },
];

export default function ContentEnginePage() {
  const { role } = useRole();
  const router = useRouter();
  const { docs, indexedDocs, totalChunks, removeDoc, buildSystemPrompt } = useContentEngine();
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');

  // Redirect students — this page is teacher-only
  useEffect(() => {
    if (role === 'student') router.push('../');
  }, [role]);

  const systemPrompt = useMemo(() => buildSystemPrompt(), [indexedDocs]);

  const { append, isLoading, messages } = useChat({
    api: '/api/chat',
    body: { systemPrompt, role: 'teacher' },
    onFinish: (message) => {
      setGeneratedContent(message.content);
    }
  });

  const handleGenerate = (prompt) => {
    setGeneratedContent('');
    append({ role: 'user', content: prompt });
  };

  const knowledgeGaps = [
    !docs.find(d => d.id === 'conflict-resolution') && { topic: 'Conflict Resolution', note: 'No document indexed — AI cannot answer related student questions.' },
    !docs.find(d => d.id === 'syllabus') && { topic: 'Course Syllabus', note: 'Grading and policy questions will go unanswered.' },
  ].filter(Boolean);

  if (role === 'student') return null;

  return (
    <div style={{ maxWidth: '960px', animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <Database color="#f59e0b" size={26} /> AI Content Engine
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
            Manage your course knowledge base and generate AI-powered teaching materials.
          </p>
        </div>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          TEACHER ONLY
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Documents Indexed', value: indexedDocs.length, sub: `${docs.filter(d => d.status === 'indexing').length} processing`, color: '#3b82f6' },
          { label: 'Total Chunks', value: totalChunks, sub: 'available for retrieval', color: '#10b981' },
          { label: 'Student Queries', value: '88', sub: 'this week (simulated)', color: '#a855f7' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)', marginTop: '0.4rem' }}>{stat.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* ── Indexed Documents ── */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} color="var(--primary)" /> Indexed Knowledge Base
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {docs.map(doc => (
              <div key={doc.id}>
                <div
                  style={{
                    padding: '0.9rem 1rem', borderRadius: '8px',
                    border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.02)',
                    transition: 'background 0.2s', cursor: 'pointer'
                  }}
                  onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                      <FileText size={15} color={doc.status === 'indexed' ? 'var(--primary)' : '#f59e0b'} style={{ flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '1px' }}>{doc.chunks} chunks · Added {doc.date}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      {doc.status === 'indexing' ? (
                        <span style={{ fontSize: '0.68rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Indexing
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <CheckCircle2 size={11} /> Indexed
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeDoc(doc.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '2px', display: 'flex', alignItems: 'center', borderRadius: '4px', transition: 'color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--muted-foreground)'}
                      >
                        <Trash2 size={13} />
                      </button>
                      {expandedDoc === doc.id ? <ChevronUp size={14} color="var(--muted-foreground)" /> : <ChevronDown size={14} color="var(--muted-foreground)" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Topics */}
                {expandedDoc === doc.id && (
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.05)', borderRadius: '0 0 8px 8px', border: '1px solid rgba(59,130,246,0.2)', borderTop: 'none', marginTop: '-4px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Indexed Topics</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {doc.topics.map(t => (
                        <span key={t} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(59,130,246,0.12)', color: 'var(--primary)', fontWeight: 500 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {docs.length === 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                No documents indexed. Upload via Modules.
              </p>
            )}
          </div>
        </div>

        {/* ── Performance Data Loop ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} color="#a855f7" /> Performance Data Loop
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Top student queries this week — feeding back into the AI to improve future responses.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {PERFORMANCE_DATA.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#a855f7', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.question}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)' }}>{item.count} queries · {item.doc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Gaps */}
          {knowledgeGaps.length > 0 && (
            <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <AlertTriangle size={14} /> Knowledge Gaps Detected
              </h3>
              {knowledgeGaps.map((gap, i) => (
                <div key={i} style={{ marginBottom: '0.4rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)' }}>{gap.topic}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{gap.note}</div>
                </div>
              ))}
              <a href="../modules" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem', fontSize: '0.74rem', color: '#ef4444', textDecoration: 'none', fontWeight: 600 }}>
                Upload missing docs →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Content Generator ── */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="#f59e0b" /> AI Content Generator
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1.25rem' }}>
          Generate course materials instantly from your indexed knowledge base.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {GENERATOR_ACTIONS.map(action => (
            <button
              key={action.label}
              onClick={() => handleGenerate(action.prompt)}
              disabled={isLoading || indexedDocs.length === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: '7px', fontSize: '0.82rem', fontWeight: 600,
                cursor: isLoading || indexedDocs.length === 0 ? 'not-allowed' : 'pointer',
                background: `rgba(${action.color === '#f59e0b' ? '245,158,11' : action.color === '#3b82f6' ? '59,130,246' : action.color === '#10b981' ? '16,185,129' : '168,85,247'}, 0.1)`,
                color: action.color,
                border: `1px solid ${action.color}33`,
                opacity: isLoading || indexedDocs.length === 0 ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              <action.icon size={14} /> {action.label}
            </button>
          ))}
        </div>

        {/* Output area */}
        <div style={{ minHeight: '120px', padding: '1.25rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', position: 'relative' }}>
          {isLoading && !generatedContent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--muted-foreground)', fontSize: '0.88rem' }}>
              <Loader2 size={16} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
              Generating from knowledge base...
            </div>
          )}
          {(generatedContent || (isLoading && messages.length > 0)) && (
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--foreground)', fontFamily: 'inherit', margin: 0 }}>
              {messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || generatedContent}
            </pre>
          )}
          {!isLoading && !generatedContent && (
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              Generated content will appear here. Select an action above to begin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
