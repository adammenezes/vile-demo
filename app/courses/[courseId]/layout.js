"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '../../components/RoleProvider';
import { use } from 'react';

export default function CourseLayout({ children, params }) {
  const pathname = usePathname();
  const resolvedParams = use(params);
  const courseId = resolvedParams?.courseId || 'business-comm';
  const { role } = useRole();

  const titleFormat = courseId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const navLinks = [
    { label: 'Home', href: `/courses/${courseId}` },
    { label: 'Modules', href: `/courses/${courseId}/modules` },
    { label: 'Assignments', href: `/courses/${courseId}/assignments` },
    { label: 'AI Study Assistant', href: `/courses/${courseId}/ai`, isNew: true },
    ...(role === 'teacher' ? [
      { label: 'Content Engine', href: `/courses/${courseId}/content-engine`, isTeacher: true },
    ] : [])
  ];

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Secondary Course Sidebar */}
      <div style={{ width: '220px', padding: '2.5rem 1.5rem', borderRight: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.01)' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)', marginBottom: '1.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {titleFormat}
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {navLinks.map((link, i) => {
            const isActive = link.label === 'Home'
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link key={i} href={link.href} style={{
                color: isActive ? 'var(--foreground)' : link.isTeacher ? '#f59e0b' : 'var(--primary)',
                textDecoration: isActive ? 'none' : 'underline',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9rem',
                borderLeft: isActive ? `2px solid ${link.isTeacher ? '#f59e0b' : 'var(--foreground)'}` : '2px solid transparent',
                paddingLeft: '10px',
                marginLeft: '-12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}>
                {link.label}
                {link.isNew && (
                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '12px', fontWeight: 700 }}>NEW</span>
                )}
                {link.isTeacher && !link.isNew && (
                  <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '12px', fontWeight: 700 }}>TCH</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Course Content area */}
      <div style={{ flex: 1, padding: '2.5rem 3.5rem', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
