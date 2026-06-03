'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Shield,
  ClipboardList,
} from 'lucide-react';

const navItems = [
  { href: '/',           label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'manager', 'agent'] },
  { href: '/customers',  label: 'Customers',  icon: Users,           roles: ['super_admin', 'manager', 'agent'] },
  { href: '/bookings',   label: 'Bookings',   icon: BookOpen,        roles: ['super_admin', 'manager', 'agent'] },
  { href: '/users',      label: 'Users',      icon: Shield,          roles: ['super_admin'] },
  { href: '/audit-logs', label: 'Audit',      icon: ClipboardList,   roles: ['super_admin'] },
];

export default function MobileNav({ user }) {
  const pathname = usePathname();
  const allowed = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      <style>{`
        .mobile-nav {
          display: none;
        }
        @media (max-width: 767px) {
          .mobile-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: #fff;
            border-top: 1px solid #e5e7eb;
            padding: 0;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
          }
          .mobile-nav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px 4px 12px;
            text-decoration: none;
            gap: 4px;
            position: relative;
            transition: all 0.2s;
          }
          .mobile-nav-item .nav-icon {
            transition: transform 0.2s;
          }
          .mobile-nav-item:active .nav-icon {
            transform: scale(0.9);
          }
          .mobile-nav-item .nav-label {
            font-size: 10px;
            font-weight: 500;
            font-family: inherit;
            transition: color 0.2s;
          }
          .mobile-nav-item.active::before {
            content: '';
            position: absolute;
            top: 0; left: 50%;
            transform: translateX(-50%);
            width: 32px; height: 3px;
            background: #1e293b;
            border-radius: 0 0 4px 4px;
          }
        }
      `}</style>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {allowed.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item${active ? ' active' : ''}`}
              style={{ color: active ? '#1e293b' : '#9ca3af' }}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
