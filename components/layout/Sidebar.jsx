'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Shield,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Plane,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'manager', 'agent'] },
  { href: '/customers', label: 'Customers', icon: Users, roles: ['super_admin', 'manager', 'agent'] },
  { href: '/bookings', label: 'Bookings', icon: BookOpen, roles: ['super_admin', 'manager', 'agent'] },
  { href: '/users', label: 'User Management', icon: Shield, roles: ['super_admin'] },
  { href: '/audit-logs', label: 'Audit Logs', icon: ClipboardList, roles: ['super_admin'] },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const allowed = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      } min-h-screen`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2 px-4 py-5 border-b border-gray-200 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg flex-shrink-0">
          <Plane className="text-white" size={16} />
        </div>
        {!collapsed && (
          <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">Tripile CRM</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {allowed.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
