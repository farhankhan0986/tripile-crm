import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import Customer from '@/models/Customer';
import TasksClient from './TasksClient';

async function getData(token) {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    await dbConnect();

    const scope = decoded.role === 'agent' ? { assignedTo: decoded.id } : {};

    const [tasks, users, customers] = await Promise.all([
      Task.find(scope)
        .populate('assignedTo', 'name email role')
        .populate('createdBy', 'name email')
        .populate('customer', 'name phone email')
        .populate('notes.addedBy', 'name')
        .sort({ dueDate: 1, createdAt: -1 })
        .lean(),
      User.find({ isActive: true }).select('name email role').lean(),
      Customer.find({ status: 'active' }).select('name phone email').lean(),
    ]);

    return {
      tasks: JSON.parse(JSON.stringify(tasks)),
      users: JSON.parse(JSON.stringify(users)),
      customers: JSON.parse(JSON.stringify(customers)),
      currentUser: {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name,
      },
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export const metadata = {
  title: 'Tasks — Tripile CRM',
  description: 'Reminders and follow-up tasks',
};

export default async function TasksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const data = await getData(token);

  if (!data) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        Could not load tasks. Make sure you are logged in and the database is connected.
      </div>
    );
  }

  return (
    <TasksClient
      initialTasks={data.tasks}
      currentUser={data.currentUser}
      users={data.users}
      customers={data.customers}
    />
  );
}
