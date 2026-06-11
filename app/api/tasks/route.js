import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { taskSchema, parseZodErrors } from '@/lib/validation';
import { createAuditLog } from '@/lib/auditLogger';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const assignedTo = searchParams.get('assignedTo') || '';

    let query = {};

    // Agents only see their own tasks
    if (decoded.role === 'agent') {
      query.assignedTo = decoded.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status && ['pending', 'completed'].includes(status)) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .populate('customer', 'name phone email')
      .populate('notes.addedBy', 'name')
      .sort({ dueDate: 1, createdAt: -1 });

    return NextResponse.json({ tasks });
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

    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parseZodErrors(parsed.error);
      return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
    }

    const { title, description, dueDate, reminderDate, status, priority, assignedTo, customer } =
      parsed.data;

    // Agents can only assign tasks to themselves
    if (decoded.role === 'agent' && assignedTo !== decoded.id) {
      return NextResponse.json(
        { error: 'Agents can only assign tasks to themselves.' },
        { status: 403 }
      );
    }

    const task = await Task.create({
      title,
      description: description || '',
      dueDate: new Date(dueDate),
      reminderDate: reminderDate ? new Date(reminderDate) : undefined,
      status: status || 'pending',
      priority: priority || 'medium',
      assignedTo,
      customer: customer || undefined,
      createdBy: decoded.id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .populate('customer', 'name phone email');

    await createAuditLog({
      action: 'task_created',
      performedBy: decoded.id,
      targetId: task._id,
      targetModel: 'Task',
      meta: { title, assignedTo },
    });

    return NextResponse.json({ task: populated }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
