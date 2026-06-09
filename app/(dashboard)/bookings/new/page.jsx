import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import BookingForm from '@/components/forms/BookingForm';

export const metadata = { title: 'New Booking — Tripile CRM' };

export default async function NewBookingPage({ searchParams }) {
  const { customerId } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const decoded = verifyToken(token);

  await dbConnect();

  let customerQuery = {};
  if (decoded?.role === 'agent') {
    customerQuery.assignedAgent = decoded.id;
  }

  const customers = await Customer.find(customerQuery).select('_id name phone').sort({ name: 1 }).lean();
  const serialized = JSON.parse(JSON.stringify(customers));

  const initial = customerId ? { customer: customerId } : {};

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">New Booking</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new flight booking</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <BookingForm customers={serialized} initial={initial} currentRole={decoded?.role} />
      </div>
    </div>
  );
}
