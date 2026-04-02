"use client";
import Link from 'next/link';
import { BookOpen, ArrowRight, Zap } from 'lucide-react';

const courses = [
  {
    id: 'business-comm', code: 'COM 301', title: 'Business Communication',
    term: 'Fall 2026', progress: 72,
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
    glow: 'rgba(99,102,241,0.4)',
    tag: 'AI Active',
  },
  {
    id: 'corp-finance', code: 'FIN 402', title: 'Corporate Finance',
    term: 'Fall 2026', progress: 48,
    gradient: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
    glow: 'rgba(16,185,129,0.35)',
    tag: 'In Progress',
  },
  {
    id: 'marketing', code: 'MKT 201', title: 'Intro to Digital Marketing',
    term: 'Fall 2026', progress: 91,
    gradient: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)',
    glow: 'rgba(244,63,94,0.35)',
    tag: 'Near Complete',
  },
  {
    id: 'ethics', code: 'ETH 105', title: 'Business Ethics & Law',
    term: 'Fall 2026', progress: 30,
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
    glow: 'rgba(245,158,11,0.35)',
    tag: 'Just Started',
  },
];

export default function Dashboard() {
  return (
    <div style={{ padding: '3rem 3.5rem', animation: 'fadeIn 0.55s ease-out' }}>

      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <Zap size={14} color="var(--brand-1)" />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand-1)' }}>
            Fall 2026 Semester
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: '0.5rem' }}>
          <span className="gradient-text">Dashboard</span>
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', fontWeight: 400 }}>
          Welcome back — your courses are waiting.
        </p>
      </div>

      {/* Courses grid */}
      <div className="course-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {courses.map((course, i) => (
          <Link key={course.id} href={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
            <div
              className="glass-panel"
              style={{
                padding: 0, overflow: 'hidden', cursor: 'pointer',
                transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease',
                animation: `fadeIn 0.5s ease-out ${i * 0.08}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
                e.currentTarget.style.boxShadow = `0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.3), 0 0 40px ${course.glow}`;
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderColor = 'var(--card-border)';
              }}
            >
              {/* Gradient banner */}
              <div style={{ height: '130px', background: course.gradient, position: 'relative', overflow: 'hidden' }}>
                {/* Shine overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)',
                }} />
                {/* Animated shimmer */}
                <div style={{
                  position: 'absolute', top: '-50%', left: '-60%', width: '40%', height: '200%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                  transform: 'skewX(-20deg)',
                  animation: `shimmer ${3 + i * 0.5}s ${i * 0.3}s linear infinite`,
                  backgroundSize: '200% 100%',
                }} />
                {/* Course code badge */}
                <div style={{
                  position: 'absolute', bottom: '1rem', left: '1rem',
                  background: 'rgba(0,0,0,0.35)',
                  backdropFilter: 'blur(8px)',
                  color: 'white', padding: '0.3rem 0.65rem',
                  borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                  letterSpacing: '0.08em', border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  {course.code}
                </div>
                {/* Tag */}
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
                  color: 'rgba(255,255,255,0.9)', padding: '0.2rem 0.55rem',
                  borderRadius: '100px', fontSize: '0.62rem', fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.15)',
                  letterSpacing: '0.03em',
                }}>
                  {course.tag}
                </div>
              </div>

              {/* Course info */}
              <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
                  {course.title}
                </h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginBottom: '1.1rem' }}>
                  {course.term}
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>Progress</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--foreground)' }}>{course.progress}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '100px', height: '5px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${course.progress}%`,
                    background: course.gradient,
                    borderRadius: '100px',
                    boxShadow: `0 0 8px ${course.glow}`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>

                {/* Enter arrow */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-1)', opacity: 0.8 }}>
                    Open course <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
