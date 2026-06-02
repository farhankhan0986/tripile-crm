'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

const roleLabels = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  agent: 'Agent',
};

export default function TopBar({ user }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
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
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
