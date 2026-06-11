import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { taskSchema, taskNoteSchema, parseZodErrors } from '@/lib/validation';
import { createAuditLog } from '@/lib/auditLogger';

async function getTaskWithAuth(id, decoded) {
  const task = await Task.findById(id)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email')
    .populate('customer', 'name phone email')
    .populate('notes.addedBy', 'name');

  if (!task) return { error: 'Task not found', status: 404 };

  // Agents can only access tasks assigned to them
  if (decoded.role === 'agent' && task.assignedTo?._id?.toString() !== decoded.id) {
    return { error: 'Forbidden', status: 403 };
  }

  return { task };
}

export async function GET(request, { params }) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const result = await getTaskWithAuth(id, decoded);
    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

    return NextResponse.json({ task: result.task });
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

    await dbConnect();
    const { id } = await params;
    const result = await getTaskWithAuth(id, decoded);
    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

    const body = await request.json();
    const task = result.task;

    // --- Append a note ---
    if (body.addNote !== undefined) {
      const parsedNote = taskNoteSchema.safeParse({ text: body.addNote });
      if (!parsedNote.success) {
        const errors = parseZodErrors(parsedNote.error);
        return NextResponse.json({ error: Object.values(errors)[0] }, { status: 400 });
      }
      task.notes.push({ text: parsedNote.data.text, addedBy: decoded.id });
      await task.save();
      await task.populate('notes.addedBy', 'name');

      await createAuditLog({
        action: 'task_note_added',
        performedBy: decoded.id,
        targetId: task._id,
        targetModel: 'Task',
        meta: { title: task.title },
      });

      return NextResponse.json({ task });
    }

    // --- Quick status toggle (lightweight) ---
    if (body.status !== undefined && Object.keys(body).length === 1) {
      if (!['pending', 'completed'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
      }
      task.status = body.status;
      await task.save();

      await createAuditLog({
        action: body.status === 'completed' ? 'task_completed' : 'task_updated',
        performedBy: decoded.id,
        targetId: task._id,
        targetModel: 'Task',
        meta: { title: task.title, status: body.status },
      });

      return NextResponse.json({ task });
    }

    // --- Full edit (manager/admin only) ---
    if (decoded.role === 'agent') {
      // Agents can only toggle status on their own tasks (handled above)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parseZodErrors(parsed.error);
      return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
    }

    const { title, description, dueDate, reminderDate, status, priority, assignedTo, customer } =
      parsed.data;

    task.title = title;
    task.description = description || '';
    task.dueDate = new Date(dueDate);
    task.reminderDate = reminderDate ? new Date(reminderDate) : undefined;
    task.status = status || 'pending';
    task.priority = priority || 'medium';
    task.assignedTo = assignedTo;
    task.customer = customer || undefined;

    await task.save();
    await task.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'createdBy', select: 'name email' },
      { path: 'customer', select: 'name phone email' },
      { path: 'notes.addedBy', select: 'name' },
    ]);

    await createAuditLog({
      action: 'task_updated',
      performedBy: decoded.id,
      targetId: task._id,
      targetModel: 'Task',
      meta: { title, status, priority },
    });

    return NextResponse.json({ task });
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

    if (decoded.role === 'agent') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    const task = await Task.findById(id);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    await Task.findByIdAndDelete(id);

    await createAuditLog({
      action: 'task_deleted',
      performedBy: decoded.id,
      targetId: id,
      targetModel: 'Task',
      meta: { title: task.title },
    });

    return NextResponse.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
