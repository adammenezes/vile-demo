"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from './RoleProvider';
import { User, LayoutDashboard, Book, Calendar, Inbox, GraduationCap } from 'lucide-react';

const menuItems = [
  { icon: User, label: 'Account', href: '#' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Book, label: 'Courses', href: '/courses/business-comm' },
  { icon: Calendar, label: 'Calendar', href: '#' },
  { icon: Inbox, label: 'Inbox', href: '#' },
];

export default function GlobalSidebar() {
  const { role, setRole } = useRole();
  const pathname = usePathname();
  const isTeacher = role === 'teacher';

  return (
    <div className="global-sidebar" style={{
      width: '80px',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--card-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1.25rem 0',
      zIndex: 50,
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Subtle gradient line on the right edge */}
      <div style={{
        position: 'absolute', right: -1, top: '10%', bottom: '10%', width: '1px',
        background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.5) 40%, rgba(139,92,246,0.5) 60%, transparent)',
        pointerEvents: 'none',
      }} />

      {/* Brand */}
      <div className="sidebar-brand" style={{
        marginBottom: '2rem',
        padding: '0.6rem',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
        border: '1px solid rgba(99,102,241,0.3)',
        color: '#a5b4fc',
        boxShadow: '0 0 20px rgba(99,102,241,0.2)',
        animation: 'pulse-glow 3s ease-in-out infinite',
      }}>
        <GraduationCap size={28} strokeWidth={1.75} />
      </div>

      {/* Nav items */}
      <div className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.15rem' }}>
        {menuItems.map((item, i) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
              <div className="sidebar-nav-item" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                padding: '0.7rem 0', width: '100%', position: 'relative',
                color: isActive ? '#a5b4fc' : 'var(--muted-foreground)',
                transition: 'color 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#c4b5fd'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--muted-foreground)'; }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: '3px', borderRadius: '0 3px 3px 0',
                    background: 'linear-gradient(180deg, var(--brand-1), var(--brand-2))',
                    boxShadow: '0 0 8px rgba(99,102,241,0.6)',
                  }} />
                )}
                {/* Icon glow wrapper */}
                <div style={{
                  padding: '0.45rem',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  transition: 'background 0.2s ease',
                }}>
                  <item.icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: isActive ? 700 : 500, letterSpacing: '0.03em' }}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Role toggle */}
      <div className="sidebar-role" style={{ marginTop: 'auto', padding: '0 0.75rem', width: '100%' }}>
        <button
          onClick={() => setRole(isTeacher ? 'student' : 'teacher')}
          title={`Switch to ${isTeacher ? 'Student' : 'Teacher'} mode`}
          style={{
            width: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            padding: '0.55rem 0.25rem',
            borderRadius: '10px',
            border: `1px solid ${isTeacher ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}`,
            background: isTeacher ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isTeacher ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)';
            e.currentTarget.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isTeacher ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span style={{ fontSize: '0.55rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
            View As
          </span>
          <span style={{
            fontSize: '0.7rem', fontWeight: 800,
            color: isTeacher ? '#fcd34d' : '#a5b4fc',
            letterSpacing: '0.05em',
          }}>
            {isTeacher ? 'TCH' : 'STU'}
          </span>
        </button>
      </div>
    </div>
  );
}
