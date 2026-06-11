import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import Booking from '@/models/Booking';
import Task from '@/models/Task';
import {
  Users, BookOpen, CalendarCheck, Clock,
  Bell, AlertCircle, CalendarClock, Calendar,
  ArrowRight, CheckSquare, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

/* ─── data fetchers ─────────────────────────────────────── */
async function getStats(token) {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;
    await dbConnect();

    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    let customerQuery = {};
    let bookingQuery  = {};

    if (decoded.role === 'agent') {
      customerQuery = { assignedAgent: decoded.id };
      const myCustomers = await Customer.find({ assignedAgent: decoded.id }).select('_id');
      bookingQuery = { customer: { $in: myCustomers.map(c => c._id) } };
    }

    const [totalCustomers, totalBookings, todayBookings, pendingBookings] = await Promise.all([
      Customer.countDocuments(customerQuery),
      Booking.countDocuments(bookingQuery),
      Booking.countDocuments({ ...bookingQuery, createdAt: { $gte: today, $lt: tomorrow } }),
      Booking.countDocuments({ ...bookingQuery, status: 'pending' }),
    ]);

    return { totalCustomers, totalBookings, todayBookings, pendingBookings };
  } catch { return null; }
}

async function getTaskSummary(token) {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;
    await dbConnect();

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1);
    const next7Days  = new Date(todayStart); next7Days.setDate(next7Days.getDate() + 7);

    const scope     = decoded.role === 'agent' ? { assignedTo: decoded.id } : {};
    const baseQuery = { ...scope, status: 'pending' };

    const [overdue, dueToday, upcoming, remindersToday] = await Promise.all([
      Task.countDocuments({ ...baseQuery, dueDate: { $lt: todayStart } }),
      Task.countDocuments({ ...baseQuery, dueDate: { $gte: todayStart, $lt: todayEnd } }),
      Task.countDocuments({ ...baseQuery, dueDate: { $gte: todayEnd, $lt: next7Days } }),
      Task.countDocuments({ ...scope, status: 'pending', reminderDate: { $gte: todayStart, $lt: todayEnd } }),
    ]);

    const [dueTodayList, overdueList] = await Promise.all([
      Task.find({ ...baseQuery, dueDate: { $gte: todayStart, $lt: todayEnd } })
        .populate('customer', 'name').populate('assignedTo', 'name')
        .select('title priority customer assignedTo').limit(4).lean(),
      Task.find({ ...baseQuery, dueDate: { $lt: todayStart } })
        .populate('customer', 'name').populate('assignedTo', 'name')
        .select('title priority customer assignedTo dueDate').sort({ dueDate: 1 }).limit(4).lean(),
    ]);

    return {
      overdue, dueToday, upcoming, remindersToday,
      dueTodayList: JSON.parse(JSON.stringify(dueTodayList)),
      overdueList:  JSON.parse(JSON.stringify(overdueList)),
    };
  } catch { return null; }
}

/* ─── sub-components ────────────────────────────────────── */
const PRIORITY_DOT = {
  high:   'bg-red-400',
  medium: 'bg-sky-400',
  low:    'bg-gray-300',
};

function TaskPreviewItem({ task }) {
  return (
    <li className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority] || 'bg-gray-300'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate font-medium">{task.title}</p>
        {task.customer && (
          <p className="text-[11px] text-gray-400 truncate">{task.customer.name}</p>
        )}
      </div>
      {task.assignedTo && (
        <span className="text-[10px] text-gray-400 flex-shrink-0 hidden sm:block">
          {task.assignedTo.name}
        </span>
      )}
    </li>
  );
}

/* ─── page ──────────────────────────────────────────────── */
const STAT_CARDS = [
  { key: 'totalCustomers', label: 'Customers',       icon: Users,         accent: '#3b82f6', accentBg: '#eff6ff', href: '/customers' },
  { key: 'totalBookings',  label: 'Total Bookings',  icon: BookOpen,      accent: '#6366f1', accentBg: '#eef2ff', href: '/bookings'  },
  { key: 'todayBookings',  label: "Today's Bookings",icon: CalendarCheck, accent: '#10b981', accentBg: '#ecfdf5', href: '/bookings'  },
  { key: 'pendingBookings',label: 'Pending Bookings',icon: Clock,         accent: '#f59e0b', accentBg: '#fffbeb', href: '/bookings'  },
];

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const [stats, ts] = await Promise.all([getStats(token), getTaskSummary(token)]);

  const hasTaskActivity = ts && (ts.overdue > 0 || ts.dueToday > 0 || ts.upcoming > 0 || ts.remindersToday > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ── Page heading ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back — here's what's happening today</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 rounded-lg px-3 py-1.5">
          <TrendingUp size={12} />
          Live overview
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, accent, accentBg, href }) => (
          <Link
            key={key}
            href={href}
            className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: accentBg }}
              >
                <Icon size={18} style={{ color: accent }} />
              </div>
              <ArrowRight
                size={14}
                className="text-gray-200 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-0.5">
              {stats ? (stats[key] ?? 0) : '—'}
            </p>
            <p className="text-xs font-medium text-gray-400">{label}</p>
          </Link>
        ))}
      </div>

      {!stats && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          ⚠ Could not load stats — make sure MongoDB is running.
        </div>
      )}

      {/* ── Tasks section ── */}
      {ts && (
        <div>
          {/* Section heading */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
                <CheckSquare size={14} color="#f8fafc" strokeWidth={2} />
              </div>
              <h2 className="text-base font-bold text-gray-900">Task Overview</h2>
            </div>
            <Link
              href="/tasks"
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {/* Reminder banner */}
          {ts.remindersToday > 0 && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl px-4 py-3.5 mb-4">
              <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell size={17} className="text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-violet-900">
                  {ts.remindersToday} Reminder{ts.remindersToday > 1 ? 's' : ''} Due Today
                </p>
                <p className="text-xs text-violet-500 mt-0.5">Don't forget to follow up on these tasks.</p>
              </div>
              <Link
                href="/tasks"
                className="flex-shrink-0 text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 transition-colors"
              >
                Open <ArrowRight size={11} />
              </Link>
            </div>
          )}

          {/* Task stat pills */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Overdue',    count: ts.overdue,  icon: AlertCircle,   accent: '#ef4444', bg: '#fef2f2', ring: '#fecaca' },
              { label: 'Due Today',  count: ts.dueToday, icon: CalendarClock, accent: '#f59e0b', bg: '#fffbeb', ring: '#fde68a' },
              { label: 'Next 7 Days',count: ts.upcoming, icon: Calendar,      accent: '#3b82f6', bg: '#eff6ff', ring: '#bfdbfe' },
            ].map(({ label, count, icon: Icon, accent, bg, ring }) => (
              <Link
                key={label}
                href="/tasks"
                className="group rounded-2xl p-4 transition-all hover:shadow-md"
                style={{ background: bg, border: `1px solid ${ring}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={15} style={{ color: accent }} />
                  <span className="text-xs font-semibold" style={{ color: accent }}>{label}</span>
                </div>
                <p className="text-3xl font-bold" style={{ color: accent }}>{count}</p>
              </Link>
            ))}
          </div>

          {/* Preview lists side-by-side */}
          {(ts.overdueList.length > 0 || ts.dueTodayList.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {ts.overdueList.length > 0 && (
                <div className="bg-white border border-red-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-red-50 bg-red-50/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wide">
                      <AlertCircle size={12} /> Overdue
                    </div>
                    {ts.overdue > 4 && (
                      <Link href="/tasks" className="text-[11px] text-red-400 hover:text-red-600 font-medium">
                        +{ts.overdue - 4} more →
                      </Link>
                    )}
                  </div>
                  <ul className="px-4 py-1">
                    {ts.overdueList.map(t => <TaskPreviewItem key={t._id} task={t} />)}
                  </ul>
                </div>
              )}

              {ts.dueTodayList.length > 0 && (
                <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-amber-50 bg-amber-50/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wide">
                      <CalendarClock size={12} /> Due Today
                    </div>
                    {ts.dueToday > 4 && (
                      <Link href="/tasks" className="text-[11px] text-amber-400 hover:text-amber-600 font-medium">
                        +{ts.dueToday - 4} more →
                      </Link>
                    )}
                  </div>
                  <ul className="px-4 py-1">
                    {ts.dueTodayList.map(t => <TaskPreviewItem key={t._id} task={t} />)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* All clear */}
          {!hasTaskActivity && (
            <div className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-2xl py-10 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
                <CheckSquare size={22} className="text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-gray-600">All caught up!</p>
              <p className="text-xs text-gray-400 mt-1">No overdue or upcoming tasks right now.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
