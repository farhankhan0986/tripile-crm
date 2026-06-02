import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Customer from '@/models/Customer';
import { verifyToken } from '@/lib/auth';
import BookingForm from '@/components/forms/BookingForm';

export const metadata = { title: 'Edit Booking — Tripile CRM' };

export default async function EditBookingPage({ params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const decoded = verifyToken(token);

  await dbConnect();

  const booking = await Booking.findById(id).populate('customer', '_id name phone').lean();
  if (!booking) notFound();

  let customerQuery = {};
  if (decoded?.role === 'agent') {
    customerQuery.assignedAgent = decoded.id;
  }

  const customers = await Customer.find(customerQuery).select('_id name phone').sort({ name: 1 }).lean();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/bookings" className="hover:text-gray-700">Bookings</Link>
          <span>/</span>
          <span className="text-gray-900">Edit</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Edit Booking</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <BookingForm
          initial={JSON.parse(JSON.stringify(booking))}
          customers={JSON.parse(JSON.stringify(customers))}
          bookingId={id}
        />
      </div>
    </div>
  );
}
