import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Customer from '@/models/Customer';
import { verifyToken } from '@/lib/auth';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { Edit, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import BookingDetailClient from '@/components/ui/BookingDetailClient';

export const metadata = { title: 'Booking — Tripile CRM' };

export default async function BookingDetailPage({ params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const decoded = verifyToken(token);

  await dbConnect();

  const booking = await Booking.findById(id)
    .populate('customer', 'name phone email')
    .populate('createdBy', 'name')
    .lean();

  if (!booking) notFound();

  // Agents can only see bookings of their assigned customers
  if (decoded?.role === 'agent') {
    const customer = await Customer.findById(booking.customer?._id);
    if (customer?.assignedAgent?.toString() !== decoded?.id) notFound();
  }

  const isAgent = decoded?.role === 'agent';
  const canDelete = decoded?.role === 'super_admin' || decoded?.role === 'manager';

  const b = JSON.parse(JSON.stringify(booking));

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/bookings" className="hover:text-gray-700">Bookings</Link>
            <span>/</span>
            <span className="text-gray-900">{b.pnr || 'Booking'}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">
              {b.pnr ? `PNR: ${b.pnr}` : 'Booking Details'}
            </h1>
            <BookingStatusBadge status={b.status} />
          </div>
        </div>
        <Link href={`/bookings/${id}/edit`}>
          <Button variant="secondary" size="sm">
            <Edit size={14} />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Main details */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 space-y-5">

          {/* Booking Info */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Booking Information</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-gray-500 mb-1">Customer</dt>
                <dd className="font-medium text-gray-900">
                  <Link href={`/customers/${b.customer?._id}`} className="text-blue-600 hover:text-blue-700">
                    {b.customer?.name || '—'}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Airline</dt>
                <dd className="font-medium text-gray-900">{b.airline || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">PNR</dt>
                <dd className="font-mono font-medium text-gray-900">{b.pnr || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Travel Date</dt>
                <dd className="font-medium text-gray-900">
                  {b.travelDate
                    ? new Date(b.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Created By</dt>
                <dd className="font-medium text-gray-900">{b.createdBy?.name || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Created At</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Notes — protected for agents */}
          <div className="pt-4 border-t border-gray-100">
            <dt className="text-sm text-gray-500 mb-2">Notes</dt>
            {isAgent ? (
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 w-fit">
                <Lock size={13} className="text-gray-400" />
                <span className="text-xs text-gray-400 font-medium tracking-wide">Protected</span>
              </div>
            ) : (
              <dd className="text-sm text-gray-700 whitespace-pre-wrap">
                {b.notes || <span className="text-gray-400 italic">No notes</span>}
              </dd>
            )}
          </div>
        </div>

        {/* Sidebar — Payment */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Payment</h2>

          {isAgent ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <PaymentStatusBadge status={b.payment?.status} />
              </div>
              <div className="mt-3 flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                <Lock size={13} className="text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-400">Payment details are restricted.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <PaymentStatusBadge status={b.payment?.status} />
              </div>
              {b.payment?.gatewayName && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Gateway</span>
                  <span className="font-medium text-gray-900">{b.payment.gatewayName}</span>
                </div>
              )}
              {b.payment?.transactionId && (
                <div>
                  <span className="text-gray-500 block mb-1">Transaction ID</span>
                  <span className="font-mono text-xs text-gray-700 break-all">{b.payment.transactionId}</span>
                </div>
              )}
              {b.payment?.last4Digits && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Card</span>
                  <span className="font-mono font-medium text-gray-900">•••• {b.payment.last4Digits}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete action — client component */}
      {canDelete && (
        <BookingDetailClient bookingId={id} pnr={b.pnr} />
      )}
    </div>
  );
}
