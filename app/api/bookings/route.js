import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Customer from '@/models/Customer';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/auditLogger';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const customerId = searchParams.get('customerId') || '';

    let query = {};

    if (decoded.role === 'agent') {
      const myCustomers = await Customer.find({ assignedAgent: decoded.id }).select('_id');
      query.customer = { $in: myCustomers.map((c) => c._id) };
    }

    if (customerId) {
      query.customer = customerId;
    }

    if (search) {
      query.$or = [
        { pnr: { $regex: search, $options: 'i' } },
        { airline: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name phone email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const body = await request.json();
    const { customer, airline, pnr, travelDate, status, notes, payment } = body;

    if (!customer) return NextResponse.json({ error: 'Customer is required' }, { status: 400 });

    const booking = await Booking.create({
      customer,
      airline,
      pnr,
      travelDate,
      status: status || 'pending',
      notes,
      payment: {
        status: payment?.status || 'unpaid',
        transactionId: payment?.transactionId,
        gatewayName: payment?.gatewayName,
        last4Digits: payment?.last4Digits,
      },
      createdBy: decoded.id,
    });

    await createAuditLog({
      action: 'booking_created',
      performedBy: decoded.id,
      targetId: booking._id,
      targetModel: 'Booking',
      meta: { customer, pnr },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
