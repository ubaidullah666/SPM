'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, clearAuth } from '@/lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const volunteerNav: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: '⊞' },
  { href: '/projects', label: 'Browse Projects', icon: '🔍' },
  { href: '/dashboard/applications', label: 'My Applications', icon: '📋' },
  { href: '/dashboard/contributions', label: 'Contributions', icon: '⏱' },
  { href: '/dashboard/portfolio', label: 'Impact Portfolio', icon: '🏆' },
  { href: '/dashboard/suggestions', label: 'AI Suggestions', icon: '✨' },
];

const ngoNav: NavItem[] = [
  { href: '/dashboard/ngo', label: 'Overview', icon: '⊞' },
  { href: '/dashboard/ngo/projects', label: 'My Projects', icon: '📁' },
  { href: '/dashboard/ngo/applications', label: 'Applications', icon: '📋' },
  { href: '/projects', label: 'Browse All', icon: '🔍' },
];

const adminNav: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: '⊞' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/projects', label: 'Projects', icon: '📁' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems =
    user?.role === 'ngo'
      ? ngoNav
      : user?.role === 'admin'
      ? adminNav
      : volunteerNav;

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="mobile-nav-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-text">ImpactHub</div>
          <div className="logo-sub">Social Impact Platform</div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : item.href === '/dashboard/ngo'
                ? pathname === '/dashboard/ngo'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: 16 }}>Account</div>
          <Link
            href="/profile"
            className={`nav-item ${pathname === '/profile' ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="nav-icon">👤</span>
            Profile
          </Link>
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ width: '100%', textAlign: 'left', background: 'none' }}
          >
            <span className="nav-icon">🚪</span>
            Sign Out
          </button>
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role || 'volunteer'}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
