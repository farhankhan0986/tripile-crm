import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const next7Days = new Date(todayStart);
    next7Days.setDate(next7Days.getDate() + 7);

    // Scope by role
    const scope = decoded.role === 'agent' ? { assignedTo: decoded.id } : {};
    const baseQuery = { ...scope, status: 'pending' };

    const [overdue, dueToday, upcoming, remindersToday] = await Promise.all([
      Task.countDocuments({ ...baseQuery, dueDate: { $lt: todayStart } }),
      Task.countDocuments({ ...baseQuery, dueDate: { $gte: todayStart, $lte: todayEnd } }),
      Task.countDocuments({
        ...baseQuery,
        dueDate: { $gt: todayEnd, $lte: next7Days },
      }),
      Task.countDocuments({
        ...scope,
        status: 'pending',
        reminderDate: { $gte: todayStart, $lte: todayEnd },
      }),
    ]);

    // Fetch a few tasks due today for the dashboard detail view
    const dueTodayTasks = await Task.find({
      ...baseQuery,
      dueDate: { $gte: todayStart, $lte: todayEnd },
    })
      .populate('assignedTo', 'name')
      .populate('customer', 'name')
      .select('title priority assignedTo customer dueDate reminderDate')
      .limit(5)
      .sort({ priority: -1 });

    const overdueTasks = await Task.find({
      ...baseQuery,
      dueDate: { $lt: todayStart },
    })
      .populate('assignedTo', 'name')
      .populate('customer', 'name')
      .select('title priority assignedTo customer dueDate')
      .limit(5)
      .sort({ dueDate: 1 });

    return NextResponse.json({
      counts: { overdue, dueToday, upcoming, remindersToday },
      dueTodayTasks,
      overdueTasks,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
