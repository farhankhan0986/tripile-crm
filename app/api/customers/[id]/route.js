import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import SensitiveData from '@/models/SensitiveData';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/auditLogger';
import { customerSchema, parseZodErrors } from '@/lib/validation';

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

    // --- Zod validation ---
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parseZodErrors(parsed.error);
      return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
    }

    const { name, phone, email, assignedAgent, notes } = parsed.data;

    // --- Email uniqueness check (exclude current customer) ---
    if (email && email.trim() !== '') {
      const existing = await Customer.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'A customer with this email already exists.' },
          { status: 409 }
        );
      }
    }

    const updated = await Customer.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        phone: phone?.trim() || '',
        email: email?.trim().toLowerCase() || '',
        assignedAgent,
        notes: notes?.trim() || '',
      },
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
    if (err.code === 11000 && err.keyPattern?.email) {
      return NextResponse.json(
        { error: 'A customer with this email already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only super_admin and manager can delete/archive
    if (decoded.role === 'agent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const customer = await Customer.findById(id);
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    // Hard delete — super_admin only
    if (permanent) {
      if (decoded.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Only Super Admin can permanently delete records.' },
          { status: 403 }
        );
      }
      // Delete associated sensitive data
      await SensitiveData.deleteMany({ customerId: id });
      await Customer.findByIdAndDelete(id);

      await createAuditLog({
        action: 'customer_deleted',
        performedBy: decoded.id,
        targetId: id,
        targetModel: 'Customer',
        meta: { name: customer.name, permanent: true },
      });

      return NextResponse.json({ message: 'Customer permanently deleted.' });
    }

    // Soft delete — archive
    customer.status = 'archived';
    await customer.save();

    await createAuditLog({
      action: 'customer_archived',
      performedBy: decoded.id,
      targetId: id,
      targetModel: 'Customer',
      meta: { name: customer.name },
    });

    return NextResponse.json({ message: 'Customer archived successfully.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only super_admin and manager can restore/re-archive
    if (decoded.role === 'agent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['active', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    const customer = await Customer.findById(id);
    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    customer.status = status;
    await customer.save();

    await createAuditLog({
      action: status === 'active' ? 'customer_updated' : 'customer_archived',
      performedBy: decoded.id,
      targetId: id,
      targetModel: 'Customer',
      meta: { name: customer.name, statusChange: status },
    });

    return NextResponse.json({
      message: `Customer ${status === 'active' ? 'restored' : 'archived'} successfully.`,
      customer,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
