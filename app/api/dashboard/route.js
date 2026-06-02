import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import Booking from '@/models/Booking';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    return NextResponse.json({ totalCustomers, totalBookings, todayBookings, pendingBookings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
