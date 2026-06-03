import Link from 'next/link';
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  BookOpen,
  Shield,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Compass,
  Crown,
  BriefcaseBusiness,
  UserCheck,
  LogIn,
  ChevronRight,
  CircleDot,
  Info,
} from 'lucide-react';

/* ── Role definitions ─────────────────────────────── */
const roles = [
  {
    id: 'super_admin',
    label: 'Super Admin',
    Icon: Crown,
    accentBg: '#faf5ff',
    accentBorder: '#e9d5ff',
    accentText: '#7c3aed',
    badgeBg: '#ede9fe',
    accessLevel: 'Full Access',
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
    Icon: BriefcaseBusiness,
    accentBg: '#eff6ff',
    accentBorder: '#bfdbfe',
    accentText: '#1d4ed8',
    badgeBg: '#dbeafe',
    accessLevel: 'Operational',
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
    Icon: UserCheck,
    accentBg: '#f0fdf4',
    accentBorder: '#bbf7d0',
    accentText: '#15803d',
    badgeBg: '#dcfce7',
    accessLevel: 'Limited',
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
    Icon: LayoutDashboard,
    iconBg: '#f8fafc',
    iconColor: '#334155',
    title: 'Dashboard',
    desc: 'Real-time overview of customers, bookings, and team performance at a glance.',
  },
  {
    Icon: Users,
    iconBg: '#f8fafc',
    iconColor: '#334155',
    title: 'Customer Management',
    desc: 'Track every lead with full contact history, notes, and agent assignment.',
  },
  {
    Icon: BookOpen,
    iconBg: '#f8fafc',
    iconColor: '#334155',
    title: 'Booking Engine',
    desc: 'Create and monitor travel bookings with status tracking from pending to confirmed.',
  },
  {
    Icon: Shield,
    iconBg: '#f8fafc',
    iconColor: '#334155',
    title: 'Role-Based Access',
    desc: 'Three distinct roles ensure every team member sees only what is relevant.',
  },
  {
    Icon: ClipboardList,
    iconBg: '#f8fafc',
    iconColor: '#334155',
    title: 'Audit Logs',
    desc: 'Every action is recorded so admins always know who changed what and when.',
  },
];

/* ── Workflow steps ───────────────────────────────── */
const workflow = [
  {
    step: '01',
    title: 'Admin creates users',
    desc: 'A Super Admin creates accounts and assigns roles through User Management.',
  },
  {
    step: '02',
    title: 'Agents add customers',
    desc: 'Agents log in and add their assigned customers with contact details and travel preferences.',
  },
  {
    step: '03',
    title: 'Bookings are created',
    desc: 'Agents create bookings linked to customers. Managers can review all bookings.',
  },
  {
    step: '04',
    title: 'Managers track performance',
    desc: 'Managers use the Dashboard to monitor team stats, open bookings, and pending items.',
  },
  {
    step: '05',
    title: 'Admins audit activity',
    desc: 'Super Admins review the Audit Logs to see every change made in the system.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="hiw-root">
      <style>{`
        /* ── Reset & base ── */
        .hiw-root {
          min-height: 100vh;
          background: #f6f7f9;
          font-family: Inter, system-ui, -apple-system, sans-serif;
          color: #0f172a;
        }

        /* ── Top bar ── */
        .hiw-topbar {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .hiw-topbar-inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          text-decoration: none;
        }
        .brand-icon {
          width: 32px;
          height: 32px;
          background: #1e293b;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .brand-name {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .back-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        /* ── Main ── */
        .hiw-main {
          max-width: 960px;
          margin: 0 auto;
          padding: 3rem 1.5rem 4rem;
        }

        /* ── Section spacing ── */
        .section {
          margin-bottom: 3.5rem;
        }

        /* ── Hero ── */
        .hero {
          text-align: center;
          padding-bottom: 0.5rem;
          margin-bottom: 3rem;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.3125rem 0.875rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .hero-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin: 0 0 0.875rem;
          line-height: 1.15;
        }
        @media (max-width: 640px) {
          .hero-title { font-size: 1.75rem; }
        }
        .hero-desc {
          font-size: 0.9375rem;
          color: #64748b;
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.65;
        }

        /* ── Section heading ── */
        .section-heading {
          margin-bottom: 1.25rem;
        }
        .section-heading h2 {
          font-size: 1.0625rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
          margin: 0 0 0.25rem;
        }
        .section-heading p {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0;
          line-height: 1.55;
        }

        /* ── Feature cards ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr 1fr; }
        }
        .feature-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.25rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .feature-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }
        .feature-icon-wrap {
          width: 38px;
          height: 38px;
          background: #f1f5f9;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.875rem;
        }
        .feature-card h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 0.375rem;
        }
        .feature-card p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
          line-height: 1.55;
        }

        /* ── Roles ── */
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
        }
        @media (max-width: 560px) {
          .roles-grid { grid-template-columns: 1fr; }
        }
        .role-card {
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          transition: box-shadow 0.15s;
        }
        .role-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .role-header {
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid;
        }
        .role-header-left {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .role-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .role-label {
          font-size: 0.9375rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .role-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.2rem 0.625rem;
          border-radius: 100px;
          letter-spacing: 0.02em;
        }
        .role-desc {
          padding: 0.75rem 1.25rem;
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.55;
          border-bottom: 1px solid #f1f5f9;
        }
        .role-permissions {
          padding: 0.875rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .perm-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .perm-label {
          font-size: 0.8125rem;
          line-height: 1.4;
        }
        .perm-label.allowed {
          color: #334155;
        }
        .perm-label.denied {
          color: #94a3b8;
          text-decoration: line-through;
        }

        /* ── Workflow ── */
        .workflow-list {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
        }
        .workflow-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.125rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.12s;
        }
        .workflow-item:last-child {
          border-bottom: none;
        }
        .workflow-item:hover {
          background: #fafafa;
        }
        .step-num {
          font-size: 0.6875rem;
          font-weight: 800;
          color: #cbd5e1;
          letter-spacing: 0.04em;
          min-width: 22px;
          padding-top: 2px;
        }
        .workflow-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e2e8f0;
          margin-top: 6px;
          flex-shrink: 0;
        }
        .workflow-item:hover .workflow-dot {
          background: #1e293b;
        }
        .workflow-content h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 0.25rem;
        }
        .workflow-content p {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0;
          line-height: 1.55;
        }

        /* ── CTA ── */
        .cta-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.875rem;
          padding: 2rem;
          background: #1e293b;
          border-radius: 16px;
          text-align: center;
        }
        .cta-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .cta-sub {
          font-size: 0.8125rem;
          color: #94a3b8;
          margin: 0;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: #fff;
          color: #0f172a;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
          letter-spacing: 0.01em;
        }
        .cta-btn:hover {
          background: #f1f5f9;
          transform: translateY(-1px);
        }
      `}</style>

      {/* Top bar */}
      <header className="hiw-topbar">
        <div className="hiw-topbar-inner">
          <Link href="/login" className="brand">
            <div className="brand-icon">
              <Compass size={17} color="#f8fafc" strokeWidth={1.75} />
            </div>
            <span className="brand-name">Tripile CRM</span>
          </Link>
          <Link href="/login" className="back-btn" id="back-to-login-btn">
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>
      </header>

      <main className="hiw-main">

        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">
            <Info size={11} />
            Platform Overview
          </div>
          <h1 className="hero-title">How Tripile CRM Works</h1>
          <p className="hero-desc">
            A unified workspace for your travel team — manage customers, bookings, and team
            members with fine-grained role-based access control.
          </p>
        </section>

        {/* Features */}
        <section className="section">
          <div className="section-heading">
            <h2>Core Modules</h2>
            <p>Everything your travel team needs in one place.</p>
          </div>
          <div className="features-grid">
            {features.map((f) => {
              const Icon = f.Icon;
              return (
                <div key={f.title} className="feature-card">
                  <div className="feature-icon-wrap">
                    <Icon size={18} color={f.iconColor} strokeWidth={1.75} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Roles */}
        <section className="section">
          <div className="section-heading">
            <h2>Roles & Authorization</h2>
            <p>Access is controlled by three roles. Each user is assigned one role at account creation.</p>
          </div>
          <div className="roles-grid">
            {roles.map((role) => {
              const Icon = role.Icon;
              return (
                <div key={role.id} className="role-card">
                  <div
                    className="role-header"
                    style={{
                      background: role.accentBg,
                      borderColor: role.accentBorder,
                    }}
                  >
                    <div className="role-header-left">
                      <div
                        className="role-icon-wrap"
                        style={{ background: role.accentBorder }}
                      >
                        <Icon size={15} color={role.accentText} strokeWidth={2} />
                      </div>
                      <span className="role-label" style={{ color: role.accentText }}>
                        {role.label}
                      </span>
                    </div>
                    <span
                      className="role-badge"
                      style={{ background: role.badgeBg, color: role.accentText }}
                    >
                      {role.accessLevel}
                    </span>
                  </div>
                  <div className="role-desc">{role.description}</div>
                  <div className="role-permissions">
                    {role.permissions.map((p) => (
                      <div key={p.label} className="perm-row">
                        {p.allowed ? (
                          <CheckCircle2 size={14} color="#22c55e" strokeWidth={2} />
                        ) : (
                          <XCircle size={14} color="#cbd5e1" strokeWidth={2} />
                        )}
                        <span className={`perm-label ${p.allowed ? 'allowed' : 'denied'}`}>
                          {p.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Workflow */}
        <section className="section">
          <div className="section-heading">
            <h2>Typical Workflow</h2>
            <p>How your team uses Tripile CRM day to day.</p>
          </div>
          <div className="workflow-list">
            {workflow.map((item) => (
              <div key={item.step} className="workflow-item">
                <span className="step-num">{item.step}</span>
                <div className="workflow-dot" />
                <div className="workflow-content">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="cta-section">
            <p className="cta-title">Ready to get started?</p>
            <p className="cta-sub">Sign in to your workspace and manage your travel operations.</p>
            <Link href="/login" className="cta-btn" id="goto-login-btn">
              <LogIn size={15} />
              Go to Login
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
