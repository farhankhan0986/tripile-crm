import Link from 'next/link';
import {
  Plane,
  ArrowLeft,
  LayoutDashboard,
  Users,
  BookOpen,
  Shield,
  ClipboardList,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

/* ── Role definitions ─────────────────────────────── */
const roles = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    emoji: '👑',
    accentBg: 'bg-violet-50',
    accentBorder: 'border-violet-200',
    accentText: 'text-violet-700',
    badgeBg: 'bg-violet-100',
    description: 'Complete control over the entire system including user management and audit logs.',
    permissions: [
      { label: 'Dashboard & analytics', allowed: true },
      { label: 'All customer records', allowed: true },
      { label: 'All bookings (any agent)', allowed: true },
      { label: 'User management & roles', allowed: true },
      { label: 'Audit logs & history', allowed: true },
    ],
  },
  {
    id: 'manager',
    label: 'Manager',
    emoji: '🗂️',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
    accentText: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    description: 'Oversees team operations, can view and manage all customers and bookings.',
    permissions: [
      { label: 'Dashboard & team stats', allowed: true },
      { label: 'All customer records', allowed: true },
      { label: 'All bookings (read/write)', allowed: true },
      { label: 'User management & roles', allowed: false },
      { label: 'Audit logs & history', allowed: false },
    ],
  },
  {
    id: 'agent',
    label: 'Agent',
    emoji: '🧑‍💼',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentText: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    description: 'Handles day-to-day customer interactions limited to their own assigned records.',
    permissions: [
      { label: 'Personal dashboard', allowed: true },
      { label: 'Assigned customers only', allowed: true },
      { label: 'Own bookings only', allowed: true },
      { label: 'User management & roles', allowed: false },
      { label: 'Audit logs & history', allowed: false },
    ],
  },
];

/* ── Feature list ─────────────────────────────────── */
const features = [
  {
    icon: LayoutDashboard,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'Dashboard',
    desc: 'Get a real-time overview of customers, bookings, and team performance at a glance.',
  },
  {
    icon: Users,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    title: 'Customer Management',
    desc: 'Track every lead and customer with full contact history, notes, and assignment to agents.',
  },
  {
    icon: BookOpen,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    title: 'Booking Engine',
    desc: 'Create, update, and monitor travel bookings with status tracking from pending to confirmed.',
  },
  {
    icon: Shield,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    title: 'Role-Based Access',
    desc: 'Three distinct roles ensure every team member sees only what is relevant to their work.',
  },
  {
    icon: ClipboardList,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    title: 'Audit Logs',
    desc: 'Every action is recorded so admins always know who changed what and when.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="text-white" size={14} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Tripile CRM</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} />
            Back to Login
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* Hero */}
        <section className="text-center pt-4">
          <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full mb-4 uppercase tracking-wide">
            Platform Overview
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            How Tripile CRM Works
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            A unified workspace for your travel team — manage customers, bookings, and team
            members with fine-grained role-based access control.
          </p>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Core Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className={`w-9 h-9 ${f.iconBg} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon size={18} className={f.iconColor} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Roles */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Roles & Authorization</h2>
          <p className="text-sm text-gray-500 mb-5">
            Access is controlled by three roles. Each user is assigned one role at account creation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`bg-white border rounded-xl overflow-hidden hover:shadow-sm transition-all ${role.accentBorder}`}
              >
                {/* Card header */}
                <div className={`${role.accentBg} border-b ${role.accentBorder} px-5 py-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{role.emoji}</span>
                      <span className={`text-base font-bold ${role.accentText}`}>{role.label}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${role.badgeBg} ${role.accentText}`}>
                      {role.id === 'super_admin' ? 'Full' : role.id === 'manager' ? 'Operational' : 'Limited'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{role.description}</p>
                </div>

                {/* Permissions list */}
                <div className="px-5 py-4 space-y-3">
                  {role.permissions.map((p) => (
                    <div key={p.label} className="flex items-center gap-2.5">
                      {p.allowed ? (
                        <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle size={15} className="text-gray-300 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          p.allowed ? 'text-gray-700' : 'text-gray-400 line-through'
                        }`}
                      >
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How workflow works */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Typical Workflow</h2>
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {[
              {
                step: '01',
                title: 'Admin creates users',
                desc: 'A Super Admin creates accounts and assigns roles (Agent, Manager, or Super Admin) through User Management.',
              },
              {
                step: '02',
                title: 'Agents add customers',
                desc: 'Agents log in and add their assigned customers with contact details and travel preferences.',
              },
              {
                step: '03',
                title: 'Bookings are created',
                desc: 'Agents create bookings linked to customers. Managers can review all bookings across the team.',
              },
              {
                step: '04',
                title: 'Managers track performance',
                desc: 'Managers use the Dashboard to monitor team stats, open bookings, and pending items.',
              },
              {
                step: '05',
                title: 'Admins audit activity',
                desc: 'Super Admins review the Audit Logs to see every change made in the system for compliance.',
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 px-5 py-4">
                <span className="text-xs font-bold text-gray-300 mt-0.5 w-6 flex-shrink-0">{item.step}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Plane size={15} />
            Go to Login
          </Link>
        </section>

      </main>
    </div>
  );
}
