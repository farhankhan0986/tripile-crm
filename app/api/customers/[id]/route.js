import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/auditLogger';

async function getCustomerWithAuth(id, decoded) {
  const customer = await Customer.findById(id)
    .populate('assignedAgent', 'name email')
    .populate('createdBy', 'name');

  if (!customer) return { error: 'Customer not found', status: 404 };

  // Agents can only access their own customers
  if (
    decoded.role === 'agent' &&
    customer.assignedAgent?._id?.toString() !== decoded.id
  ) {
    return { error: 'Forbidden', status: 403 };
  }

  return { customer };
}

export async function GET(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const result = await getCustomerWithAuth(id, decoded);
    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

    return NextResponse.json({ customer: result.customer });
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
    const result = await getCustomerWithAuth(id, decoded);
    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

    const body = await request.json();
    const { name, phone, email, assignedAgent, notes } = body;

    const updated = await Customer.findByIdAndUpdate(
      id,
      { name, phone, email, assignedAgent, notes },
      { new: true, runValidators: true }
    ).populate('assignedAgent', 'name email');

    await createAuditLog({
      action: 'customer_updated',
      performedBy: decoded.id,
      targetId: id,
      targetModel: 'Customer',
      meta: { name },
    });

    return NextResponse.json({ customer: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
