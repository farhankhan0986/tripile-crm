'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input, { Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function BookingForm({ initial = {}, customers = [], bookingId }) {
  const router = useRouter();
  const isEdit = !!bookingId;

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
        notes: form.notes,
        payment: {
          status: form.paymentStatus,
          transactionId: form.transactionId,
          gatewayName: form.gatewayName,
          last4Digits: form.last4Digits,
        },
      };

      const url = isEdit ? `/api/bookings/${bookingId}` : '/api/bookings';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }

      router.push('/bookings');
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
          <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes..." />
        </div>
      </div>

      {/* Payment Details */}
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
