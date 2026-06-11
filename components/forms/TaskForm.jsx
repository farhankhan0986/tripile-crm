'use client';

import { useState, useEffect } from 'react';
import Input, { Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function TaskForm({ onSubmit, onCancel, initialData, currentUser, users = [], customers = [] }) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate ? initialData.dueDate.slice(0, 10) : '',
    reminderDate: initialData?.reminderDate ? initialData.reminderDate.slice(0, 10) : '',
    status: initialData?.status || 'pending',
    priority: initialData?.priority || 'medium',
    assignedTo: initialData?.assignedTo?._id || initialData?.assignedTo || currentUser?.id || '',
    customer: initialData?.customer?._id || initialData?.customer || '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Agents are always assigned to themselves
  const isAgent = currentUser?.role === 'agent';
  const assignableUsers = isAgent
    ? users.filter((u) => u._id === currentUser.id || u.id === currentUser.id)
    : users;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required.';
    if (!form.dueDate) newErrors.dueDate = 'Due date is required.';
    if (!form.assignedTo) newErrors.assignedTo = 'Assigned To is required.';
    if (form.reminderDate && form.dueDate && form.reminderDate > form.dueDate) {
      newErrors.reminderDate = 'Reminder date cannot be after due date.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate,
        reminderDate: form.reminderDate || null,
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo,
        customer: form.customer || null,
      };
      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="task-title"
        label="Title"
        required
        placeholder="e.g. Follow up payment"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        error={errors.title}
      />

      <Textarea
        id="task-description"
        label="Description"
        placeholder="Brief description of what needs to be done…"
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        error={errors.description}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="task-due-date"
          label="Due Date"
          required
          type="date"
          value={form.dueDate}
          onChange={(e) => set('dueDate', e.target.value)}
          error={errors.dueDate}
        />
        <Input
          id="task-reminder-date"
          label="Reminder Date"
          type="date"
          value={form.reminderDate}
          onChange={(e) => set('reminderDate', e.target.value)}
          error={errors.reminderDate}
          max={form.dueDate || undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          id="task-priority"
          label="Priority"
          value={form.priority}
          onChange={(e) => set('priority', e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>

        {isEdit && (
          <Select
            id="task-status"
            label="Status"
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </Select>
        )}
      </div>

      <Select
        id="task-assigned-to"
        label="Assigned To"
        required
        value={form.assignedTo}
        onChange={(e) => set('assignedTo', e.target.value)}
        error={errors.assignedTo}
        disabled={isAgent}
      >
        <option value="">Select user…</option>
        {assignableUsers.map((u) => (
          <option key={u._id || u.id} value={u._id || u.id}>
            {u.name} ({u.role})
          </option>
        ))}
      </Select>

      <Select
        id="task-customer"
        label="Linked Customer (optional)"
        value={form.customer}
        onChange={(e) => set('customer', e.target.value)}
      >
        <option value="">None</option>
        {customers.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </Select>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
