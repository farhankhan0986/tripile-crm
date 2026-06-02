import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import Booking from '@/models/Booking';
import { Users, BookOpen, CalendarCheck, Clock } from 'lucide-react';
import Link from 'next/link';

async function getStats(token) {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let customerQuery = {};
    let bookingQuery = {};

    if (decoded.role === 'agent') {
      customerQuery = { assignedAgent: decoded.id };
      const myCustomers = await Customer.find({ assignedAgent: decoded.id }).select('_id');
      const ids = myCustomers.map((c) => c._id);
      bookingQuery = { customer: { $in: ids } };
    }

    const [totalCustomers, totalBookings, todayBookings, pendingBookings] = await Promise.all([
      Customer.countDocuments(customerQuery),
      Booking.countDocuments(bookingQuery),
      Booking.countDocuments({ ...bookingQuery, createdAt: { $gte: today, $lt: tomorrow } }),
      Booking.countDocuments({ ...bookingQuery, status: 'pending' }),
    ]);

    return { totalCustomers, totalBookings, todayBookings, pendingBookings };
  } catch {
    return null;
  }
}

const statCards = [
  { key: 'totalCustomers', label: 'Total Customers', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/customers' },
  { key: 'totalBookings', label: 'Total Bookings', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/bookings' },
  { key: 'todayBookings', label: "Today's Bookings", icon: CalendarCheck, color: 'text-green-600', bg: 'bg-green-50', href: '/bookings' },
  { key: 'pendingBookings', label: 'Pending Bookings', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', href: '/bookings' },
];

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const stats = await getStats(token);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your travel CRM</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, color, bg, href }) => (
          <Link
            key={key}
            href={href}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={color} size={18} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900">
              {stats ? stats[key] ?? 0 : '—'}
            </p>
          </Link>
        ))}
      </div>

      {!stats && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          Could not load stats. Make sure MongoDB is running and the connection is configured.
        </div>
      )}
    </div>
  );
}
