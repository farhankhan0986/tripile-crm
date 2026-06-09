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

    // Agents cannot update payment details or sensitive notes
    const updateData = {
      customer,
      airline,
      pnr,
      travelDate,
      status,
    };

    // Only super_admin and manager can edit payment details and notes
    if (decoded.role !== 'agent') {
      updateData.notes = notes;
      updateData['payment.status'] = payment?.status;
      updateData['payment.transactionId'] = payment?.transactionId;
      updateData['payment.gatewayName'] = payment?.gatewayName;
      updateData['payment.last4Digits'] = payment?.last4Digits;
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customer', 'name phone email');

    await createAuditLog({
      action: 'booking_updated',
      performedBy: decoded.id,
      targetId: id,
      targetModel: 'Booking',
      meta: { pnr, customer: updated?.customer?.name },
    });

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Agents cannot delete bookings
    if (decoded.role === 'agent') {
      return NextResponse.json({ error: 'Agents cannot delete bookings.' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    const booking = await Booking.findById(id).populate('customer', 'name');
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    await Booking.findByIdAndDelete(id);

    await createAuditLog({
      action: 'booking_deleted',
      performedBy: decoded.id,
      targetId: id,
      targetModel: 'Booking',
      meta: { pnr: booking.pnr, customer: booking.customer?.name },
    });

    return NextResponse.json({ message: 'Booking deleted successfully.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

