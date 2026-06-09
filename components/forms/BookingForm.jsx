'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import Input, { Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function BookingForm({ initial = {}, customers = [], bookingId, currentRole }) {
  const router = useRouter();
  const isEdit = !!bookingId;

  // Agents CAN enter notes/payment when CREATING a booking (write-only).
  // After saving, they cannot see those fields — restriction applies on edit only.
  const isAgent = currentRole === 'agent';
  const hideProtectedFields = isAgent && isEdit; // only hide when editing existing booking

  const [form, setForm] = useState({
    customer: initial.customer?._id || initial.customer || '',
    airline: initial.airline || '',
    pnr: initial.pnr || '',
    travelDate: initial.travelDate ? new Date(initial.travelDate).toISOString().split('T')[0] : '',
    status: initial.status || 'pending',
    notes: initial.notes || '',
    paymentStatus: initial.payment?.status || 'unpaid',
    transactionId: initial.payment?.transactionId || '',
    gatewayName: initial.payment?.gatewayName || '',
    last4Digits: initial.payment?.last4Digits || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.customer) { setError('Customer is required'); return; }

    setLoading(true);
    try {
      const payload = {
        customer: form.customer,
        airline: form.airline,
        pnr: form.pnr,
        travelDate: form.travelDate || null,
        status: form.status,
      };

      // Only include notes and payment fields for non-agents OR when creating (agent write-once)
      if (!hideProtectedFields) {
        payload.notes = form.notes;
        payload.payment = {
          status: form.paymentStatus,
          transactionId: form.transactionId,
          gatewayName: form.gatewayName,
          last4Digits: form.last4Digits,
        };
      }

      const url = isEdit ? `/api/bookings/${bookingId}` : '/api/bookings';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }

      router.push(`/bookings/${data.booking._id}`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Booking Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Booking Details</h3>
        <div className="space-y-4">
          <Select label="Customer" name="customer" value={form.customer} onChange={handleChange} required>
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.name} {c.phone ? `· ${c.phone}` : ''}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Airline" name="airline" value={form.airline} onChange={handleChange} placeholder="Emirates" />
            <Input label="PNR" name="pnr" value={form.pnr} onChange={handleChange} placeholder="ABC123" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Travel Date" type="date" name="travelDate" value={form.travelDate} onChange={handleChange} />
            <Select label="Booking Status" name="status" value={form.status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </Select>
          </div>

          {/* Notes — hidden from agents on edit only */}
          {!hideProtectedFields ? (
            <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes..." />
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">Notes</span>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                <Lock size={13} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-400 font-medium tracking-wide">Protected</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details — hidden from agents on edit only */}
      {!hideProtectedFields ? (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select label="Payment Status" name="paymentStatus" value={form.paymentStatus} onChange={handleChange}>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="refunded">Refunded</option>
              </Select>
              <Input label="Gateway Name" name="gatewayName" value={form.gatewayName} onChange={handleChange} placeholder="Stripe, JazzCash..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Transaction ID" name="transactionId" value={form.transactionId} onChange={handleChange} placeholder="txn_xxxxxxxxxxxx" />
              <Input
                label="Last 4 Digits"
                name="last4Digits"
                value={form.last4Digits}
                onChange={handleChange}
                placeholder="4242"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-500">Payment Details</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">Payment information is restricted to managers and admins.</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {isEdit ? 'Save Changes' : 'Create Booking'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
