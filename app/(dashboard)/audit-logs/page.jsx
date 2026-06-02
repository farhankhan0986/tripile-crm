'use client';

import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';

const actionLabels = {
  login: 'Logged In',
  customer_created: 'Customer Created',
  customer_updated: 'Customer Updated',
  booking_created: 'Booking Created',
  booking_updated: 'Booking Updated',
};

const actionColors = {
  login: 'bg-blue-50 text-blue-700',
  customer_created: 'bg-green-50 text-green-700',
  customer_updated: 'bg-yellow-50 text-yellow-700',
  booking_created: 'bg-indigo-50 text-indigo-700',
  booking_updated: 'bg-purple-50 text-purple-700',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-logs')
      .then((r) => r.json())
      .then((d) => { setLogs(d.logs || []); setLoading(false); });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">System activity trail — last 200 events</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <ClipboardList size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No audit logs yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Performed By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{log.performedBy?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{log.performedBy?.role?.replace('_', ' ') || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {log.meta ? Object.entries(log.meta).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
