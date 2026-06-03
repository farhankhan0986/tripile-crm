import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Booking from "@/models/Booking";
import { verifyToken } from "@/lib/auth";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { Edit, Plus } from "lucide-react";
import Button from "@/components/ui/Button";

async function getCustomer(id, userId, role) {
  await dbConnect();
  const customer = await Customer.findById(id)
    .populate("assignedAgent", "name email")
    .populate("createdBy", "name")
    .lean();

  if (!customer) return null;

  if (role === "agent" && customer.assignedAgent?._id?.toString() !== userId)
    return null;

  return customer;
}

async function getBookings(customerId) {
  return Booking.find({ customer: customerId }).sort({ createdAt: -1 }).lean();
}

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const decoded = verifyToken(token);

  const customer = await getCustomer(id, decoded?.id, decoded?.role);
  if (!customer) notFound();

  const bookings = await getBookings(id);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/customers" className="hover:text-gray-700">
              Customers
            </Link>
            <span>/</span>
            <span className="text-gray-900">{customer.name}</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            {customer.name}
          </h1>
        </div>
        <Link href={`/customers/${id}/edit`}>
          <Button variant="secondary" size="sm">
            <Edit size={14} />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 grid-cols-1 gap-4 mb-6">
        {/* Customer Info */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Customer Details
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-gray-500 mb-1">Phone</dt>
              <dd className="font-medium text-gray-900">
                {customer.phone || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 mb-1">Email</dt>
              <dd className="font-medium text-gray-900 overflow-hidden text-ellipsis">
                {customer.email || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 mb-1">Assigned Agent</dt>
              <dd className="font-medium text-gray-900">
                {customer.assignedAgent?.name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 mb-1">Created By</dt>
              <dd className="font-medium text-gray-900">
                {customer.createdBy?.name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 mb-1">Created At</dt>
              <dd className="font-medium text-gray-900">
                {new Date(customer.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </dd>
            </div>
          </dl>
          {customer.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <dt className="text-sm text-gray-500 mb-1">Notes</dt>
              <dd className="text-sm text-gray-700 whitespace-pre-wrap">
                {customer.notes}
              </dd>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Bookings</span>
              <span className="font-semibold text-gray-900">
                {bookings.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Pending</span>
              <span className="font-semibold text-gray-900">
                {bookings.filter((b) => b.status === "pending").length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Confirmed</span>
              <span className="font-semibold text-gray-900">
                {bookings.filter((b) => b.status === "confirmed").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Bookings</h2>
          <Link href={`/bookings/new?customerId=${id}`}>
            <Button size="sm">
              <Plus size={14} />
              Add Booking
            </Button>
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No bookings yet
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    PNR
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Airline
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Travel Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Payment
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-900">
                      {b.pnr || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {b.airline || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {b.travelDate
                        ? new Date(b.travelDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={b.payment?.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/bookings/${b._id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
