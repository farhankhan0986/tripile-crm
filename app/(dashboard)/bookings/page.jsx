'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, BookOpen, Trash2, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, booking: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user || null))
      .catch(() => {});
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/bookings?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchBookings(), 300);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  const canDelete = currentUser?.role === 'super_admin' || currentUser?.role === 'manager';

  async function handleDelete() {
    if (!deleteModal.booking) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/bookings/${deleteModal.booking._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete.');
        setDeleteLoading(false);
        return;
      }
      setDeleteModal({ open: false, booking: null });
      fetchBookings();
    } catch {
      setDeleteError('Network error. Please try again.');
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">{bookings.length} total</p>
        </div>
        <Link href="/bookings/new">
          <Button>
            <Plus size={16} />
            New Booking
          </Button>
        </Link>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by PNR or airline..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BookOpen size={32} className="mb-3 opacity-30" />
            <p className="text-sm">{search ? 'No bookings match your search' : 'No bookings yet'}</p>
            {!search && (
              <Link href="/bookings/new" className="mt-3">
                <Button size="sm" variant="secondary">Add first booking</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">PNR</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Airline</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Travel Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{b.customer?.name || '—'}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{b.pnr || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{b.airline || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {b.travelDate ? new Date(b.travelDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                    <td className="px-4 py-3"><PaymentStatusBadge status={b.payment?.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/bookings/${b._id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
                        >
                          View
                        </Link>
                        <Link
                          href={`/bookings/${b._id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors cursor-pointer"
                        >
                          Edit
                        </Link>
                        {canDelete && (
                          <button
                            onClick={() => setDeleteModal({ open: true, booking: b })}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
                            title="Delete booking"
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

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => { setDeleteModal({ open: false, booking: null }); setDeleteError(''); }}
        title="Delete Booking"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">This action is irreversible.</p>
              <p className="text-xs text-red-700 mt-1">
                Booking {deleteModal.booking?.pnr ? <strong>{deleteModal.booking.pnr}</strong> : ''} for{' '}
                <strong>{deleteModal.booking?.customer?.name}</strong> will be permanently deleted.
              </p>
            </div>
          </div>

          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              onClick={() => { setDeleteModal({ open: false, booking: null }); setDeleteError(''); }}
            >
              Cancel
            </Button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
