'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, User } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function fetchCustomers() {
    setLoading(true);
    const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setCustomers(data.customers || []);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">{customers.length} total</p>
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus size={16} />
            New Customer
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <User size={32} className="mb-3 opacity-30" />
            <p className="text-sm">{search ? 'No customers match your search' : 'No customers yet'}</p>
            {!search && (
              <Link href="/customers/new" className="mt-3">
                <Button size="sm" variant="secondary">Add first customer</Button>
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned Agent</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.assignedAgent?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/customers/${c._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
