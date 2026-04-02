"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '../../components/RoleProvider';
import { use } from 'react';
import { Home, Blocks, ClipboardList, Bot, Cpu, ChevronRight } from 'lucide-react';

const NAV_ICONS = { Home, Modules: Blocks, Assignments: ClipboardList, 'AI Study Assistant': Bot, 'Content Engine': Cpu };

export default function CourseLayout({ children, params }) {
  const pathname = usePathname();
  const resolvedParams = use(params);
  const courseId = resolvedParams?.courseId || 'business-comm';
  const { role } = useRole();

  const titleFormat = courseId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const navLinks = [
    { label: 'Home', href: `/courses/${courseId}` },
    { label: 'Modules', href: `/courses/${courseId}/modules` },
    { label: 'Assignments', href: `/courses/${courseId}/assignments` },
    { label: 'AI Study Assistant', href: `/courses/${courseId}/ai`, isNew: true },
    ...(role === 'teacher' ? [
      { label: 'Content Engine', href: `/courses/${courseId}/content-engine`, isTeacher: true },
    ] : []),
  ];

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* ── Secondary Course Sidebar ── */}
      <div style={{
        width: '230px', flexShrink: 0,
        padding: '2rem 1rem 2rem 1.25rem',
        borderRight: '1px solid var(--card-border)',
        background: 'linear-gradient(180deg, rgba(8,8,24,0.6) 0%, rgba(4,4,16,0.8) 100%)',
        display: 'flex', flexDirection: 'column', gap: '0.25rem',
      }}>
        {/* Course title */}
        <div style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand-1)', marginBottom: '0.3rem' }}>
            Course
          </p>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {titleFormat}
          </h2>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {navLinks.map((link, i) => {
            const isActive = link.label === 'Home'
              ? pathname === link.href
              : pathname.startsWith(link.href);
            const IconComponent = NAV_ICONS[link.label];

            return (
              <Link key={i} href={link.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.55rem 0.7rem',
                    borderRadius: '10px',
                    color: isActive ? 'var(--foreground)' : link.isTeacher ? '#fcd34d' : 'var(--muted-foreground)',
                    background: isActive
                      ? (link.isTeacher ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.12)')
                      : 'transparent',
                    border: `1px solid ${isActive
                      ? (link.isTeacher ? 'rgba(245,158,11,0.25)' : 'rgba(99,102,241,0.3)')
                      : 'transparent'}`,
                    boxShadow: isActive && !link.isTeacher ? '0 0 12px rgba(99,102,241,0.15)' : 'none',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = 'var(--foreground)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = link.isTeacher ? '#fcd34d' : 'var(--muted-foreground)';
                    }
                  }}
                >
                  {IconComponent && <IconComponent size={15} strokeWidth={isActive ? 2.25 : 1.75} />}
                  <span style={{ flex: 1 }}>{link.label}</span>
                  {link.isNew && <span className="badge badge-new">NEW</span>}
                  {link.isTeacher && !link.isNew && <span className="badge badge-teacher">TCH</span>}
                  {isActive && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
