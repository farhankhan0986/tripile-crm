import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Customer from '@/models/Customer';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/auditLogger';

export async function GET(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;

    const booking = await Booking.findById(id)
      .populate('customer', 'name phone email')
      .populate('createdBy', 'name');

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (decoded.role === 'agent') {
      const customer = await Customer.findById(booking.customer._id);
      if (customer?.assignedAgent?.toString() !== decoded.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ booking });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { customer, airline, pnr, travelDate, status, notes, payment } = body;

    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (decoded.role === 'agent') {
      const customerDoc = await Customer.findById(booking.customer);
      if (customerDoc?.assignedAgent?.toString() !== decoded.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      {
        customer,
        airline,
        pnr,
        travelDate,
        status,
        notes,
        'payment.status': payment?.status,
        'payment.transactionId': payment?.transactionId,
        'payment.gatewayName': payment?.gatewayName,
        'payment.last4Digits': payment?.last4Digits,
      },
      { new: true, runValidators: true }
    ).populate('customer', 'name phone email');

    await createAuditLog({
      action: 'booking_updated',
      performedBy: decoded.id,
      targetId: id,
      targetModel: 'Booking',
      meta: { pnr },
    });

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
