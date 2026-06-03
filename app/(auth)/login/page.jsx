'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, LogIn, Compass, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      router.push('/');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      <style>{`
        .login-root {
          min-height: 100vh;
          background: #f6f7f9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: Inter, system-ui, -apple-system, sans-serif;
        }

        .login-wrap {
          width: 100%;
          max-width: 400px;
        }

        /* ── Brand ── */
        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }
        .brand-icon {
          width: 52px;
          height: 52px;
          background: #1e293b;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
        }
        .brand-name {
          font-size: 1.375rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 0 0 0.25rem;
        }
        .brand-sub {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0;
        }

        /* ── Card ── */
        .login-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
        }
        .card-title {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 1.5rem;
        }

        /* ── Error ── */
        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          margin-bottom: 1.25rem;
        }
        .error-box svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: #dc2626;
        }
        .error-box span {
          font-size: 0.8125rem;
          color: #991b1b;
          line-height: 1.5;
        }

        /* ── Fields ── */
        .field {
          margin-bottom: 1rem;
        }
        .field-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .input-wrap {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }
        .field-input {
          width: 100%;
          padding: 0.625rem 0.875rem 0.625rem 2.5rem;
          font-size: 0.875rem;
          color: #0f172a;
          background: #fff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .field-input::placeholder {
          color: #94a3b8;
        }
        .field-input:focus {
          border-color: #334155;
          box-shadow: 0 0 0 3px rgba(51,65,85,0.08);
        }

        /* ── Submit ── */
        .submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.6875rem 1rem;
          background: #1e293b;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          font-family: inherit;
          letter-spacing: 0.01em;
        }
        .submit-btn:hover:not(:disabled) {
          background: #0f172a;
        }
        .submit-btn:active:not(:disabled) {
          transform: scale(0.99);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── How it works link ── */
        .hiw-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
          padding: 0.875rem 1rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .hiw-link:hover {
          border-color: #cbd5e1;
          box-shadow: 0 1px 6px rgba(0,0,0,0.08);
        }
        .hiw-link-left {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        .hiw-link-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #0f172a;
        }
        .hiw-link-sub {
          font-size: 0.75rem;
          color: #64748b;
        }
        .hiw-link-arrow {
          width: 28px;
          height: 28px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .hiw-link:hover .hiw-link-arrow {
          background: #e2e8f0;
        }

        /* ── Footer ── */
        .login-footer {
          text-align: center;
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 1.5rem;
        }
        .login-footer span {
          color: #cbd5e1;
        }
      `}</style>

      <div className="login-wrap">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <Compass size={24} color="#f8fafc" strokeWidth={1.75} />
          </div>
          <h1 className="brand-name">Tripile CRM</h1>
          <p className="brand-sub">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="login-card">
          <p className="card-title">Welcome back</p>

          {error && (
            <div className="error-box">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label" htmlFor="login-email">Email address</label>
              <div className="input-wrap">
                <Mail size={15} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@tripile.com"
                  required
                  autoComplete="email"
                  className="field-input"
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="login-password">Password</label>
              <div className="input-wrap">
                <Lock size={15} className="input-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="field-input"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none',
                    cursor: 'pointer', color: '#94a3b8', padding: '0.25rem',
                    display: 'flex', alignItems: 'center',
                  }}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn" id="login-submit-btn">
              {loading ? (
                <><span className="spinner" />Signing in…</>
              ) : (
                <><LogIn size={15} />Sign In</>
              )}
            </button>
          </form>
        </div>

        {/* How it works link */}
        <Link href="/how-it-works" className="hiw-link" id="how-it-works-link">
          <div className="hiw-link-left">
            <span className="hiw-link-label">How does Tripile CRM work?</span>
            <span className="hiw-link-sub">Roles, modules & workflow guide</span>
          </div>
          <div className="hiw-link-arrow">
            <ChevronRight size={14} />
          </div>
        </Link>

        <p className="login-footer">
          Internal system <span>·</span> Tripile Travel
        </p>
      </div>
    </div>
  );
}
