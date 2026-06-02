import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import CustomerForm from '@/components/forms/CustomerForm';

async function getAgents() {
  await dbConnect();
  return User.find({ role: { $in: ['agent', 'manager'] }, isActive: true }).select('_id name email').lean();
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return { id: decoded.id, role: decoded.role, name: decoded.name };
}

export const metadata = { title: 'New Customer — Tripile CRM' };

export default async function NewCustomerPage() {
  const [agents, currentUser] = await Promise.all([getAgents(), getCurrentUser()]);

  // Serialize Mongoose docs — ObjectId is not a plain object
  const serializedAgents = JSON.parse(JSON.stringify(agents));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">New Customer</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new customer to the system</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <CustomerForm agents={serializedAgents} currentUser={currentUser} />
      </div>
    </div>
  );
}
