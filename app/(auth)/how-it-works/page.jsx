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
  Info,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Archive,
  Trash2,
  ShieldAlert,
  LockKeyhole,
  
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
    description: 'Complete control over the entire system including user management, sensitive data, and audit logs.',
    permissions: [
      { label: 'Dashboard & analytics', allowed: true },
      { label: 'All customer records', allowed: true },
      { label: 'All bookings (any agent)', allowed: true },
      { label: 'View & reveal sensitive data', allowed: true },
      { label: 'User management & roles', allowed: true },
      { label: 'Archive & permanently delete', allowed: true },
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
    description: 'Oversees team operations. Can manage customers and bookings but cannot view sensitive data.',
    permissions: [
      { label: 'Dashboard & team stats', allowed: true },
      { label: 'All customer records', allowed: true },
      { label: 'All bookings (read/write)', allowed: true },
      { label: 'Archive customers', allowed: true },
      { label: 'View sensitive data', allowed: false },
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
    description: 'Handles day-to-day interactions. Can enter sensitive data but cannot view it after saving.',
    permissions: [
      { label: 'Personal dashboard', allowed: true },
      { label: 'Assigned customers only', allowed: true },
      { label: 'Own bookings only', allowed: true },
      { label: 'Enter sensitive data (write-only)', allowed: true },
      { label: 'View sensitive data after saving', allowed: false },
      { label: 'Delete or archive customers', allowed: false },
      { label: 'Audit logs & history', allowed: false },
    ],
  },
];

/* ── Feature list ─────────────────────────────────── */
const features = [
  {
    Icon: LayoutDashboard,
    iconColor: '#334155',
    title: 'Dashboard',
    desc: 'Real-time overview of customers, bookings, and team performance at a glance.',
  },
  {
    Icon: Users,
    iconColor: '#334155',
    title: 'Customer Management',
    desc: 'Track every lead with contact history, validation badges, duplicate detection, and soft delete.',
  },
  {
    Icon: BookOpen,
    iconColor: '#334155',
    title: 'Booking Engine',
    desc: 'Create and monitor travel bookings with PNR, airline, payment tracking, and status management.',
  },
  {
    Icon: Lock,
    iconColor: '#d97706',
    title: 'Sensitive Data Vault',
    desc: 'Card numbers, passports, and IDs are AES-256 encrypted. Only Super Admin can reveal them.',
  },
  {
    Icon: Shield,
    iconColor: '#334155',
    title: 'Role-Based Access',
    desc: 'Three distinct roles with field-level security ensure every member sees only what is relevant.',
  },
  {
    Icon: ClipboardList,
    iconColor: '#334155',
    title: 'Audit Logs',
    desc: 'Every action - including sensitive data access - is recorded so admins always know who did what.',
  },
];

/* ── Sensitive data flow ───────────────────────────── */
const sensitiveFlow = [
  {
    role: 'Agent',
    Icon: UserCheck,
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    action: 'Enters card number',
    result: 'Sees "Protected" after saving',
    icon: LockKeyhole,
    iconColor: '#15803d',
  },
  {
    role: 'Manager',
    Icon: BriefcaseBusiness,
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    action: 'Opens customer profile',
    result: 'Always sees "Protected"',
    icon: LockKeyhole,
    iconColor: '#1d4ed8',
  },
  {
    role: 'Super Admin',
    Icon: Crown,
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#e9d5ff',
    action: 'Opens customer profile',
    result: 'Clicks Reveal → sees actual value',
    icon: Eye,
    iconColor: '#7c3aed',
  },
];

/* ── Workflow steps ───────────────────────────────── */
const workflow = [
  {
    step: '01',
    title: 'Admin creates users',
    desc: 'A Super Admin creates accounts and assigns roles (Super Admin, Manager, or Agent) through User Management.',
  },
  {
    step: '02',
    title: 'Agents add customers',
    desc: 'Agents log in and add their assigned customers with contact details, including phone and email validation.',
  },
  {
    step: '03',
    title: 'Sensitive data is entered',
    desc: 'Agents enter card details, passport numbers, or sensitive notes. After saving, these are encrypted and immediately hidden from the agent.',
  },
  {
    step: '04',
    title: 'Bookings are created',
    desc: 'Agents create bookings with airline, PNR, and travel dates. Payment details are write-only for agents.',
  },
  {
    step: '05',
    title: 'Managers track performance',
    desc: 'Managers review all customers and bookings, archive inactive records, and monitor open items via the Dashboard.',
  },
  {
    step: '06',
    title: 'Admins audit & control',
    desc: 'Super Admins reveal encrypted sensitive data when needed, review the full Audit Log, and permanently delete records.',
  },
];

/* ── Validation features ───────────────────────────── */
const validations = [
  { label: 'Phone must contain only digits, +, -, spaces, or parentheses' },
  { label: 'Email must be unique - no two customers share the same email' },
  { label: 'At least Phone or Email is required - both cannot be blank' },
  { label: 'Duplicate detection warns before creating similar records' },
  { label: 'Missing Email / Missing Phone badges flag incomplete records' },
  { label: 'Customers can be archived (soft delete) or permanently deleted' },
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
          cursor: pointer;
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
        .section { margin-bottom: 3.5rem; }

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
        @media (max-width: 640px) { .hero-title { font-size: 1.75rem; } }
        .hero-desc {
          font-size: 0.9375rem;
          color: #64748b;
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.65;
        }

        /* ── Section heading ── */
        .section-heading { margin-bottom: 1.25rem; }
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
          grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
          gap: 1rem;
        }
        @media (max-width: 480px) { .features-grid { grid-template-columns: 1fr 1fr; } }
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
        .feature-card h3 { font-size: 0.875rem; font-weight: 600; color: #0f172a; margin: 0 0 0.375rem; }
        .feature-card p { font-size: 0.8rem; color: #64748b; margin: 0; line-height: 1.55; }

        /* ── Roles ── */
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
        }
        @media (max-width: 560px) { .roles-grid { grid-template-columns: 1fr; } }
        .role-card {
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          transition: box-shadow 0.15s;
        }
        .role-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .role-header {
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid;
        }
        .role-header-left { display: flex; align-items: center; gap: 0.625rem; }
        .role-icon-wrap { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .role-label { font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.01em; }
        .role-badge { font-size: 0.6875rem; font-weight: 600; padding: 0.2rem 0.625rem; border-radius: 100px; letter-spacing: 0.02em; }
        .role-desc { padding: 0.75rem 1.25rem; font-size: 0.8rem; color: #64748b; line-height: 1.55; border-bottom: 1px solid #f1f5f9; }
        .role-permissions { padding: 0.875rem 1.25rem; display: flex; flex-direction: column; gap: 0.625rem; }
        .perm-row { display: flex; align-items: center; gap: 0.5rem; }
        .perm-label { font-size: 0.8125rem; line-height: 1.4; }
        .perm-label.allowed { color: #334155; }
        .perm-label.denied { color: #94a3b8; text-decoration: line-through; }

        /* ── Sensitive data flow ── */
        .sensitive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
        }
        .sensitive-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
        }
        .sensitive-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .sensitive-body { padding: 0.875rem 1rem; font-size: 0.8rem; color: #64748b; line-height: 1.55; }
        .sensitive-result {
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #334155;
        }

        /* ── Validation list ── */
        .validation-list {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
        }
        .validation-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.8125rem;
          color: #334155;
          line-height: 1.45;
        }
        .validation-item:last-child { border-bottom: none; }

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
        .workflow-item:last-child { border-bottom: none; }
        .workflow-item:hover { background: #fafafa; }
        .step-num { font-size: 0.6875rem; font-weight: 800; color: #cbd5e1; letter-spacing: 0.04em; min-width: 22px; padding-top: 2px; }
        .workflow-dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; margin-top: 6px; flex-shrink: 0; }
        .workflow-item:hover .workflow-dot { background: #1e293b; }
        .workflow-content h3 { font-size: 0.875rem; font-weight: 600; color: #0f172a; margin: 0 0 0.25rem; }
        .workflow-content p { font-size: 0.8125rem; color: #64748b; margin: 0; line-height: 1.55; }

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
        .cta-title { font-size: 1.125rem; font-weight: 700; color: #f8fafc; margin: 0; letter-spacing: -0.02em; }
        .cta-sub { font-size: 0.8125rem; color: #94a3b8; margin: 0; }
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
          cursor: pointer;
        }
        .cta-btn:hover { background: #f1f5f9; transform: translateY(-1px); }
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
            A secure, unified workspace for your travel team - manage customers, bookings,
            and sensitive data with fine-grained role-based access and AES-256 encryption.
          </p>
        </section>

        {/* Features */}
        <section className="section">
          <div className="section-heading">
            <h2>Core Modules</h2>
            <p>Everything your travel team needs in one place.</p>
          </div>
          <div className="features-grid ">
              {features.map((f) => {
              const Icon = f.Icon;
              return (
                <div key={f.title} className="feature-card select-none">
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
                    style={{ background: role.accentBg, borderColor: role.accentBorder }}
                  >
                    <div className="role-header-left">
                      <div className="role-icon-wrap" style={{ background: role.accentBorder }}>
                        <Icon size={15} color={role.accentText} strokeWidth={2} />
                      </div>
                      <span className="role-label" style={{ color: role.accentText }}>{role.label}</span>
                    </div>
                    <span className="role-badge" style={{ background: role.badgeBg, color: role.accentText }}>
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

        {/* Sensitive Data Security */}
        <section className="section">
          <div className="section-heading">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={17} strokeWidth={2} color="#d97706" /> Sensitive Data Security</h2>
            <p>
              Card numbers, passport numbers, government IDs, and sensitive notes are encrypted with AES-256-GCM before storage.
              Access is strictly role-controlled — agents can only write, never read.
            </p>
          </div>
          <div className="sensitive-grid">
            {sensitiveFlow.map((item) => {
              const Icon = item.Icon;
              return (
                <div key={item.role} className="sensitive-card">
                  <div
                    className="sensitive-header"
                    style={{ background: item.bg, borderColor: item.border, color: item.color }}
                  >
                    <Icon size={14} strokeWidth={2} />
                    {item.role}
                  </div>
                  <div className="sensitive-body">
                    <div style={{ marginBottom: '0.375rem', color: '#475569' }}>Action: <strong>{item.action}</strong></div>
                    <div className="sensitive-result" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {(() => { const ResultIcon = item.icon; return <ResultIcon size={13} strokeWidth={2} color={item.iconColor} />; })()}
                      {item.result}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', fontSize: '0.8125rem', color: '#92400e', lineHeight: '1.55' }}>
            <strong>Encrypted fields:</strong> Card Number · Card Holder · Card Expiry · CVV · Passport Number · Government ID · Sensitive Notes.
            Encryption key is stored in server-side environment variables and never exposed to the client.
          </div>
        </section>

        {/* Customer Validation */}
        <section className="section">
          <div className="section-heading">
            <h2>Customer Data Validation</h2>
            <p>Strict rules ensure only clean, valid records are saved to the database.</p>
          </div>
          <div className="validation-list">
            {validations.map((v) => (
              <div key={v.label} className="validation-item">
                <CheckCircle2 size={14} color="#22c55e" strokeWidth={2} style={{ flexShrink: 0 }} />
                {v.label}
              </div>
            ))}
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
              <div key={item.step} className="workflow-item select-none">
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
            <p className="cta-sub">Sign in to your workspace and manage your travel operations securely.</p>
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
