"use client";
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Dashboard() {
  const courses = [
    { id: 'business-comm', code: 'COM 301', title: 'Business Communication', term: 'Fall 2026 Semester', color: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' },
    { id: 'corp-finance', code: 'FIN 402', title: 'Corporate Finance', term: 'Fall 2026 Semester', color: 'linear-gradient(135deg, #047857, #10b981)' },
    { id: 'marketing', code: 'MKT 201', title: 'Intro to Digital Marketing', term: 'Fall 2026 Semester', color: 'linear-gradient(135deg, #be123c, #e11d48)' },
    { id: 'ethics', code: 'ETH 105', title: 'Business Ethics & Law', term: 'Fall 2026 Semester', color: 'linear-gradient(135deg, #b45309, #d97706)' }
  ];

  return (
    <div style={{ padding: '2.5rem 3rem', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>
          <BookOpen size={16} /> All Courses
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {courses.map(course => (
          <Link key={course.id} href={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer', height: '100%' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ height: '140px', background: course.color, position: 'relative' }}>
                 <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'white', color: 'black', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>{course.code}</div>
              </div>
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--foreground)' }}>{course.title}</h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>{course.term}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
