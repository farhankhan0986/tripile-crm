'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, Plane } from 'lucide-react';

const roleLabels = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  agent: 'Agent',
};

const pageTitles = {
  '/': 'Dashboard',
  '/customers': 'Customers',
  '/bookings': 'Bookings',
  '/users': 'User Management',
  '/audit-logs': 'Audit Logs',
};

export default function TopBar({ user }) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine current page title for mobile header
  const pageTitle =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(([key]) => key !== '/' && pathname.startsWith(key))?.[1] ||
    'Dashboard';

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      {/* Mobile: logo + page title | Desktop: empty left side */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex items-center justify-center w-7 h-7 bg-blue-600 rounded-lg">
          <Plane className="text-white" size={13} />
        </div>
        <span className="font-semibold text-gray-900 text-sm">{pageTitle}</span>
      </div>
      <div className="hidden md:block" />

      {/* Right side: user info + logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={14} className="text-blue-600" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-medium text-gray-900">{user?.name}</span>
            <span className="text-xs text-gray-500">{roleLabels[user?.role] || user?.role}</span>
          </div>
        </div>
        <div className="w-px h-5 bg-gray-200" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
