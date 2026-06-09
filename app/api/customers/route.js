import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/auditLogger';
import { customerSchema, parseZodErrors } from '@/lib/validation';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'active';

    let query = {};

    // Filter by status (active/archived). 'all' skips the filter.
    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }

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

    // --- Zod validation ---
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parseZodErrors(parsed.error);
      return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
    }

    const { name, phone, email, assignedAgent, notes } = parsed.data;

    // --- Email uniqueness check ---
    if (email && email.trim() !== '') {
      const existing = await Customer.findOne({ email: email.trim().toLowerCase() });
      if (existing) {
        return NextResponse.json(
          { error: 'A customer with this email already exists.' },
          { status: 409 }
        );
      }
    }

    // --- Duplicate detection (same email OR same phone) ---
    const duplicateConditions = [];
    if (email && email.trim() !== '') {
      duplicateConditions.push({ email: email.trim().toLowerCase() });
    }
    if (phone && phone.trim() !== '') {
      duplicateConditions.push({ phone: phone.trim() });
    }

    let duplicates = [];
    if (duplicateConditions.length > 0) {
      duplicates = await Customer.find({
        $or: duplicateConditions,
        status: 'active',
      }).select('name email phone').lean();
    }

    // If caller is NOT overriding and duplicates found, return warning
    const overrideDuplicate = body.overrideDuplicate === true;
    if (duplicates.length > 0 && !overrideDuplicate) {
      return NextResponse.json(
        {
          warning: 'Possible duplicate customer found.',
          duplicates,
        },
        { status: 200 }
      );
    }

    // --- Create customer ---
    const customer = await Customer.create({
      name: name.trim(),
      phone: phone?.trim() || '',
      email: email?.trim().toLowerCase() || '',
      assignedAgent: assignedAgent || decoded.id,
      notes: notes?.trim() || '',
      status: 'active',
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
    // Handle mongoose duplicate key error
    if (err.code === 11000 && err.keyPattern?.email) {
      return NextResponse.json(
        { error: 'A customer with this email already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
