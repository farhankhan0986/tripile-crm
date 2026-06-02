'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, BookOpen } from 'lucide-react';
import Button from '@/components/ui/Button';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => fetchBookings(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function fetchBookings() {
    setLoading(true);
    const res = await fetch(`/api/bookings?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
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
          <table className="w-full text-sm">
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
                    <Link
                      href={`/bookings/${b._id}/edit`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                    >
                      Edit →
                    </Link>
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
