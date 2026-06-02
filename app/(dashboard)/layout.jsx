import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  await dbConnect();
  const user = await User.findById(decoded.id).select('-password').lean();
  if (!user) return null;

  return { ...user, id: user._id.toString(), _id: user._id.toString() };
}

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
