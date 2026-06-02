import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import CustomerForm from '@/components/forms/CustomerForm';

export const metadata = { title: 'Edit Customer — Tripile CRM' };

export default async function EditCustomerPage({ params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const decoded = verifyToken(token);

  await dbConnect();
  const [customer, agents] = await Promise.all([
    Customer.findById(id).populate('assignedAgent', '_id name').lean(),
    User.find({ role: { $in: ['agent', 'manager'] }, isActive: true }).select('_id name').lean(),
  ]);

  if (!customer) notFound();

  const currentUser = { id: decoded?.id, role: decoded?.role };

  // Serialize for client
  const serialized = JSON.parse(JSON.stringify(customer));
  const serializedAgents = JSON.parse(JSON.stringify(agents));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/customers" className="hover:text-gray-700">Customers</Link>
          <span>/</span>
          <Link href={`/customers/${id}`} className="hover:text-gray-700">{customer.name}</Link>
          <span>/</span>
          <span className="text-gray-900">Edit</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Edit Customer</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <CustomerForm
          initial={serialized}
          agents={serializedAgents}
          customerId={id}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
