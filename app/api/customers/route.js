import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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

    let query = {};

    // Agents only see their own customers
    if (decoded.role === 'agent') {
      query.assignedAgent = decoded.id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query)
      .populate('assignedAgent', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ customers });
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
    const { name, phone, email, assignedAgent, notes } = body;

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const customer = await Customer.create({
      name,
      phone,
      email,
      assignedAgent: assignedAgent || decoded.id,
      notes,
      createdBy: decoded.id,
    });

    await createAuditLog({
      action: 'customer_created',
      performedBy: decoded.id,
      targetId: customer._id,
      targetModel: 'Customer',
      meta: { name },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
