'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, LogIn, UserPlus, Pencil, Trash2, Archive, Eye, CreditCard, RotateCcw } from 'lucide-react';

// ─── Action config ──────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  login: {
    label: 'Logged In',
    icon: LogIn,
    badge: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    row: '',
    dot: 'bg-blue-400',
  },
  customer_created: {
    label: 'Customer Created',
    icon: UserPlus,
    badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    row: '',
    dot: 'bg-emerald-400',
  },
  customer_updated: {
    label: 'Customer Updated',
    icon: Pencil,
    badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    row: '',
    dot: 'bg-amber-400',
  },
  customer_archived: {
    label: 'Customer Archived',
    icon: Archive,
    badge: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
    row: 'bg-orange-50',
    dot: 'bg-orange-400',
  },
  customer_deleted: {
    label: 'Customer Deleted',
    icon: Trash2,
    badge: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    row: 'bg-red-50',
    dot: 'bg-red-500',
  },
  booking_created: {
    label: 'Booking Created',
    icon: UserPlus,
    badge: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
    row: '',
    dot: 'bg-indigo-400',
  },
  booking_updated: {
    label: 'Booking Updated',
    icon: Pencil,
    badge: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
    row: '',
    dot: 'bg-purple-400',
  },
  booking_deleted: {
    label: 'Booking Deleted',
    icon: Trash2,
    badge: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    row: 'bg-red-50',
    dot: 'bg-red-500',
  },
  sensitive_data_created: {
    label: 'Sensitive Data Added',
    icon: CreditCard,
    badge: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    row: '',
    dot: 'bg-slate-400',
  },
  sensitive_data_updated: {
    label: 'Sensitive Data Updated',
    icon: CreditCard,
    badge: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    row: '',
    dot: 'bg-slate-400',
  },
  sensitive_data_viewed: {
    label: 'Sensitive Data Viewed',
    icon: Eye,
    badge: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
    row: '',
    dot: 'bg-gray-400',
  },
};

const DEFAULT_CONFIG = {
  label: null,
  icon: ClipboardList,
  badge: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  row: '',
  dot: 'bg-gray-400',
};

// ─── Pretty key labels ───────────────────────────────────────────────────────
const META_KEY_LABELS = {
  name: 'Name',
  customer: 'Customer',
  pnr: 'PNR',
  permanent: 'Permanent',
  statusChange: 'Status Changed To',
};

function formatMetaValue(key, value) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function MetaCell({ meta }) {
  if (!meta) return <span className="text-gray-400">—</span>;

  const entries = Object.entries(meta).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return <span className="text-gray-400">—</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([k, v]) => (
        <span
          key={k}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-mono"
        >
          <span className="text-gray-400 font-sans font-medium">{META_KEY_LABELS[k] || k}:</span>
          {formatMetaValue(k, v)}
        </span>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/audit-logs')
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.logs || []);
        setLoading(false);
      });
  }, []);

  const filteredLogs = filter === 'all' ? logs : logs.filter((l) => l.action === filter);

  // Determine unique actions for filter dropdown
  const uniqueActions = [...new Set(logs.map((l) => l.action))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">System activity trail - last 200 events</p>
        </div>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>
              {ACTION_CONFIG[a]?.label || a}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { color: 'bg-red-500', label: 'Destructive' },
          { color: 'bg-orange-400', label: 'Archive' },
          { color: 'bg-emerald-400', label: 'Create' },
          { color: 'bg-amber-400', label: 'Update' },
          { color: 'bg-blue-400', label: 'Login' },
        ].map(({ color, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <ClipboardList size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Performed By</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Details</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => {
                  const cfg = ACTION_CONFIG[log.action] || DEFAULT_CONFIG;
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={log._id}
                      className={`hover:brightness-95 transition-all ${cfg.row || 'hover:bg-gray-50'}`}
                    >
                      {/* Action */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.badge}`}>
                          <Icon size={12} strokeWidth={2.5} />
                          {cfg.label || log.action}
                        </span>
                      </td>

                      {/* Performed By */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <span className="font-medium text-gray-900">{log.performedBy?.name || 'Unknown'}</span>
                        </div>
                        <div className="text-xs text-gray-400 ml-4 mt-0.5">{log.performedBy?.email || ''}</div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3 text-gray-500 capitalize text-xs">
                        {log.performedBy?.role?.replace(/_/g, ' ') || '—'}
                      </td>

                      {/* Details / Meta */}
                      <td className="px-4 py-3">
                        <MetaCell meta={log.meta} />
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        <div>{new Date(log.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="text-gray-400">{new Date(log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filteredLogs.length > 0 && (
        <p className="text-xs text-gray-400 text-right mt-3">
          Showing {filteredLogs.length} of {logs.length} entries
        </p>
      )}
    </div>
  );
}
