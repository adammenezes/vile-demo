"use client";
import { useRole } from '../../components/RoleProvider';
import { Pencil, Target, BarChart3, Sparkles, BookOpen, Trophy } from 'lucide-react';

export default function CourseHome() {
  const { role } = useRole();
  const isTeacher = role === 'teacher';

  const objectives = [
    'Master internal vs external email etiquette',
    'Navigate conflict resolution effectively',
    'Construct highly persuasive proposals',
  ];

  const grading = [
    { label: 'Weekly Case Studies', value: '30%', color: '#6366f1' },
    { label: 'Midterm Practical', value: '30%', color: '#8b5cf6' },
    { label: 'Final Presentation', value: '40%', color: '#06b6d4' },
  ];

  return (
    <div style={{ maxWidth: '860px', animation: 'fadeIn 0.5s ease-out' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand-1)' }}>
              Business Communication
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.5rem' }}>
            <span className="gradient-text">COM 301</span>
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem' }}>
            Fall Semester 2026 · Prof. Rebecca Sullivan
          </p>
        </div>
        {isTeacher && (
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
            <Pencil size={14} /> Edit Syllabus
          </button>
        )}
      </div>

      {/* AI Banner (only show if teacher) */}
      {isTeacher && (
        <div style={{
          marginBottom: '1.75rem',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
          border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', gap: '1rem',
          animation: 'fadeIn 0.5s 0.1s ease-out both',
        }}>
          <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', flexShrink: 0 }}>
            <Sparkles size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.2rem' }}>
              AI Study Assistant is Active
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
              Students have 24/7 access to an AI grounded in your lecture notes and syllabus. Navigate to the <strong style={{ color: '#a5b4fc' }}>AI Study Assistant</strong> to manage sources.
            </p>
          </div>
        </div>
      )}

      {/* Overview card */}
      <div className="glass-panel" style={{ padding: '2rem 2.5rem', marginBottom: '1.5rem', animation: 'fadeIn 0.5s 0.15s ease-out both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--card-border)' }}>
          <BookOpen size={16} color="var(--brand-1)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Course Overview</h2>
        </div>
        <p style={{ lineHeight: 1.8, color: 'var(--muted-foreground)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Welcome to COM 301! In today's hyper-connected business landscape, the ability to communicate clearly, empathetically, and
          persuasively is paramount. This course will equip you with foundational skills to handle client escalations, internal advocacy,
          and professional rhetoric.
        </p>
        <p style={{ lineHeight: 1.8, color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
          <strong style={{ color: 'var(--foreground)' }}>New for Fall:</strong>{' '}
          We are pioneering the use of the{' '}
          <span style={{ color: '#a5b4fc', fontWeight: 600 }}>AI Study Assistant</span>.
          The AI has been securely granted access to direct lecture notes and syllabus grading rubrics, available 24/7 for tailored feedback.
        </p>
      </div>

      {/* Two-col info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', animation: 'fadeIn 0.5s 0.2s ease-out both' }}>

        {/* Learning objectives */}
        <div className="glass-panel" style={{ padding: '1.5rem 1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.1rem' }}>
            <Target size={15} color="#a5b4fc" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Learning Objectives</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {objectives.map((obj, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                  background: 'linear-gradient(135deg, var(--brand-1), var(--brand-2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', fontWeight: 800, color: 'white',
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{obj}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Grading */}
        <div className="glass-panel" style={{ padding: '1.5rem 1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.1rem' }}>
            <Trophy size={15} color="#fcd34d" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Grading Breakdown</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {grading.map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)' }}>{item.value}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: item.value,
                    background: item.color,
                    borderRadius: '100px',
                    boxShadow: `0 0 8px ${item.color}80`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
