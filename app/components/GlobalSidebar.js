"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from './RoleProvider';
import { User, LayoutDashboard, Book, Calendar, Inbox, Settings, GraduationCap } from 'lucide-react';

export default function GlobalSidebar() {
  const { role, setRole } = useRole();
  const pathname = usePathname();

  const menuItems = [
    { icon: User, label: 'Account', href: '#' },
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Book, label: 'Courses', href: '/courses/business-comm' },
    { icon: Calendar, label: 'Calendar', href: '#' },
    { icon: Inbox, label: 'Inbox', href: '#' },
  ];

  return (
    <div style={{ width: '84px', background: 'rgba(9, 9, 11, 0.95)', borderRight: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0', zIndex: 50, flexShrink: 0 }}>
      {/* Brand Icon */}
      <div style={{ marginBottom: '2.5rem', color: 'var(--primary)' }}>
        <GraduationCap size={36} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {menuItems.map((item, i) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={i} href={item.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
              color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
              textDecoration: 'none', width: '100%', padding: '1rem 0',
              transition: 'color 0.2s',
              borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
            }}>
              <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
        {/* Role Toggle Switch for Demo */}
        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--card-border)', transition: 'background 0.2s' }}
             onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
             onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
             onClick={() => setRole(role === 'teacher' ? 'student' : 'teacher')}
             title={`Switch to ${role === 'teacher' ? 'Student' : 'Teacher'}`}>
          <div style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)', textAlign: 'center', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View As</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: role === 'teacher' ? '#f59e0b' : '#3b82f6', textAlign: 'center' }}>
            {role === 'teacher' ? 'TCH' : 'STU'}
          </div>
        </div>
      </div>
    </div>
  );
}
