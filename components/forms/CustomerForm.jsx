'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input, { Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function CustomerForm({ initial = {}, agents = [], customerId, currentUser }) {
  const router = useRouter();
  const isEdit = !!customerId;

  const [form, setForm] = useState({
    name: initial.name || '',
    phone: initial.phone || '',
    email: initial.email || '',
    assignedAgent: initial.assignedAgent?._id || initial.assignedAgent || currentUser?.id || '',
    notes: initial.notes || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }

    setLoading(true);
    try {
      const url = isEdit ? `/api/customers/${customerId}` : '/api/customers';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }

      router.push(`/customers/${data.customer._id}`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <Input
        label="Full Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="John Doe"
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+92 300 1234567"
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="john@example.com"
        />
      </div>

      {(currentUser?.role === 'super_admin' || currentUser?.role === 'manager') && agents.length > 0 && (
        <Select
          label="Assigned Agent"
          name="assignedAgent"
          value={form.assignedAgent}
          onChange={handleChange}
        >
          <option value="">Select agent</option>
          {agents.map((a) => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </Select>
      )}

      <Textarea
        label="Notes"
        name="notes"
        value={form.notes}
        onChange={handleChange}
        placeholder="Any relevant notes..."
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {isEdit ? 'Save Changes' : 'Create Customer'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
