'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, User, Archive, Trash2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [currentUser, setCurrentUser] = useState(null);

  // Delete/archive modal
  const [actionModal, setActionModal] = useState({ open: false, customer: null, type: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Fetch current user role
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user || null))
      .catch(() => {});
  }, []);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/customers?search=${encodeURIComponent(search)}&status=${statusFilter}`
    );
    const data = await res.json();
    setCustomers(data.customers || []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(), 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  async function handleAction() {
    if (!actionModal.customer) return;
    setActionLoading(true);
    setActionError('');

    const { customer, type } = actionModal;
    const url =
      type === 'hard_delete'
        ? `/api/customers/${customer._id}?permanent=true`
        : `/api/customers/${customer._id}`;

    try {
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Action failed.');
        setActionLoading(false);
        return;
      }
      setActionModal({ open: false, customer: null, type: null });
      fetchCustomers();
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  const canArchive = currentUser?.role === 'super_admin' || currentUser?.role === 'manager';
  const canHardDelete = currentUser?.role === 'super_admin';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">{customers.length} total</p>
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus size={16} />
            New Customer
          </Button>
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {[
          { key: 'active', label: 'Active' },
          { key: 'archived', label: 'Archived' },
          ...(canHardDelete ? [{ key: 'all', label: 'All' }] : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              statusFilter === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <User size={32} className="mb-3 opacity-30" />
            <p className="text-sm">{search ? 'No customers match your search' : 'No customers yet'}</p>
            {!search && statusFilter === 'active' && (
              <Link href="/customers/new" className="mt-3">
                <Button size="sm" variant="secondary">Add first customer</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned Agent</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{c.name}</span>
                        {/* Validation badges */}
                        {!c.email && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                            <AlertCircle size={10} />
                            Missing Email
                          </span>
                        )}
                        {!c.phone && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                            <AlertCircle size={10} />
                            Missing Phone
                          </span>
                        )}
                        {c.status === 'archived' && (
                          <Badge color="gray">Archived</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.assignedAgent?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/customers/${c._id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
                        >
                          View
                        </Link>
                        {canArchive && c.status === 'active' && (
                          <button
                            onClick={() => setActionModal({ open: true, customer: c, type: 'archive' })}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors cursor-pointer"
                            title="Archive customer"
                          >
                            <Archive size={12} />
                          </button>
                        )}
                        {canHardDelete && (
                          <button
                            onClick={() => setActionModal({ open: true, customer: c, type: 'hard_delete' })}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
                            title="Permanently delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Archive / Delete confirmation modal */}
      <Modal
        open={actionModal.open}
        onClose={() => { setActionModal({ open: false, customer: null, type: null }); setActionError(''); }}
        title={actionModal.type === 'hard_delete' ? 'Permanently Delete Customer' : 'Archive Customer'}
      >
        <div className="space-y-4">
          {actionModal.type === 'hard_delete' ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">This action is irreversible.</p>
              <p className="text-xs text-red-700 mt-1">
                All data including sensitive records and bookings references will be permanently removed for{' '}
                <strong>{actionModal.customer?.name}</strong>.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-700">
              Are you sure you want to archive <strong>{actionModal.customer?.name}</strong>?
              The customer will be hidden from the active list but not deleted.
            </p>
          )}

          {actionError && (
            <p className="text-sm text-red-600">{actionError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              onClick={() => { setActionModal({ open: false, customer: null, type: null }); setActionError(''); }}
            >
              Cancel
            </Button>
            <button
              onClick={handleAction}
              disabled={actionLoading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                actionModal.type === 'hard_delete'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-900 text-white'
              } disabled:opacity-50`}
            >
              {actionLoading
                ? 'Processing...'
                : actionModal.type === 'hard_delete'
                ? 'Delete Permanently'
                : 'Archive'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
