'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldAlert, AlertTriangle } from 'lucide-react';
import Input, { Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

// ---- Client-side validation helpers ----
const PHONE_REGEX = /^[+\d\s\-(). ]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCustomerForm(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (form.phone && form.phone.trim() !== '') {
    if (!PHONE_REGEX.test(form.phone.trim())) {
      errors.phone = 'Phone can only contain digits, spaces, +, -, and parentheses.';
    }
  }

  if (form.email && form.email.trim() !== '') {
    if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
  }

  const hasPhone = form.phone && form.phone.trim() !== '';
  const hasEmail = form.email && form.email.trim() !== '';
  if (!hasPhone && !hasEmail) {
    errors.phone = 'Either Phone Number or Email Address is required.';
  }

  return errors;
}

const SENSITIVE_FIELDS = [
  { key: 'CARD_NUMBER', label: 'Card Number', placeholder: '4111 1111 1111 1111', type: 'text', masked: true },
  { key: 'CARD_HOLDER', label: 'Card Holder Name', placeholder: 'John Doe', type: 'text', masked: false },
  { key: 'CARD_EXPIRY', label: 'Card Expiry', placeholder: 'MM/YY', type: 'text', masked: false },
  { key: 'CVV', label: 'CVV', placeholder: '•••', type: 'password', masked: true, warning: true },
  { key: 'PASSPORT', label: 'Passport Number', placeholder: 'AB1234567', type: 'text', masked: true },
  { key: 'GOVT_ID', label: 'Government ID', placeholder: 'ID number', type: 'text', masked: true },
  { key: 'SENSITIVE_NOTE', label: 'Sensitive Note', placeholder: 'Confidential notes...', type: 'textarea', masked: false },
];

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

  const [sensitiveForm, setSensitiveForm] = useState({
    CARD_NUMBER: '',
    CARD_HOLDER: '',
    CARD_EXPIRY: '',
    CVV: '',
    PASSPORT: '',
    GOVT_ID: '',
    SENSITIVE_NOTE: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Duplicate detection state
  const [duplicateWarning, setDuplicateWarning] = useState(null); // { duplicates: [], pendingSubmit: true }
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  }

  function handleSensitiveChange(e) {
    const { name, value } = e.target;
    setSensitiveForm((f) => ({ ...f, [name]: value }));
  }

  async function saveSensitiveData(customerId) {
    const fields = Object.entries(sensitiveForm)
      .filter(([, value]) => value && value.trim() !== '')
      .map(([fieldType, value]) => ({ fieldType, value }));

    if (fields.length === 0) return;

    const res = await fetch(`/api/customers/${customerId}/sensitive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('Sensitive data save failed:', data.error);
    }

    // After saving, clear inputs so agent can't see what they typed
    setSensitiveForm({
      CARD_NUMBER: '',
      CARD_HOLDER: '',
      CARD_EXPIRY: '',
      CVV: '',
      PASSPORT: '',
      GOVT_ID: '',
      SENSITIVE_NOTE: '',
    });
  }

  async function submitCustomer(overrideDuplicate = false) {
    setError('');
    setLoading(true);

    try {
      const url = isEdit ? `/api/customers/${customerId}` : '/api/customers';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, overrideDuplicate }),
      });

      const data = await res.json();

      // Duplicate warning — show modal
      if (res.status === 200 && data.warning && !overrideDuplicate) {
        setDuplicateWarning(data);
        setShowDuplicateModal(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
          setError(Object.values(data.errors)[0] || 'Validation failed.');
        } else {
          setError(data.error || 'Something went wrong');
        }
        setLoading(false);
        return;
      }

      const savedCustomerId = data.customer._id;

      // Save sensitive data (cleared from form after save)
      await saveSensitiveData(savedCustomerId);

      router.push(`/customers/${savedCustomerId}`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Client-side validation
    const errors = validateCustomerForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(Object.values(errors)[0]);
      return;
    }

    await submitCustomer(false);
  }

  async function handleOverrideDuplicate() {
    setShowDuplicateModal(false);
    setDuplicateWarning(null);
    await submitCustomer(true);
  }

  const hasSensitiveInput = Object.values(sensitiveForm).some((v) => v && v.trim() !== '');

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Global error banner */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ---- Basic Info ---- */}
        <Input
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
          error={fieldErrors.name}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+92 300 1234567"
            error={fieldErrors.phone}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            error={fieldErrors.email}
          />
        </div>

        <p className="text-xs text-gray-500 -mt-2">
          At least one of Phone or Email is required.
        </p>

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

        {/* ---- Sensitive Information Section ---- */}
        {isEdit && (
          <div className="border border-amber-200 rounded-xl p-5 bg-amber-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-amber-600" />
                <h3 className="text-sm font-semibold text-gray-900">Sensitive Information</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                <ShieldAlert size={11} />
                Write-only · Protected after save
              </span>
            </div>

            <p className="text-xs text-gray-500">
              Data entered here is encrypted and stored securely.{' '}
              <strong>After saving, only Super Admin can view these values.</strong>{' '}
              {currentUser?.role !== 'super_admin' && 'You will not be able to see them again.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SENSITIVE_FIELDS.filter((f) => f.type !== 'textarea').map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Lock size={11} className="text-amber-500" />
                    {field.label}
                    {field.warning && (
                      <span className="text-xs text-orange-500 font-normal">(not recommended to store)</span>
                    )}
                  </label>
                  <input
                    type={field.type}
                    name={field.key}
                    value={sensitiveForm[field.key]}
                    onChange={handleSensitiveChange}
                    placeholder={field.placeholder}
                    autoComplete="off"
                    className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg bg-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            {/* Sensitive Note textarea */}
            {SENSITIVE_FIELDS.filter((f) => f.type === 'textarea').map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Lock size={11} className="text-amber-500" />
                  {field.label}
                </label>
                <textarea
                  name={field.key}
                  value={sensitiveForm[field.key]}
                  onChange={handleSensitiveChange}
                  placeholder={field.placeholder}
                  rows={3}
                  autoComplete="off"
                  className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg bg-white placeholder-gray-400 resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            ))}

            {hasSensitiveInput && (
              <div className="flex items-start gap-2 p-3 bg-amber-100 border border-amber-300 rounded-lg">
                <ShieldAlert size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Sensitive data will be encrypted and saved. After saving, these fields will show as{' '}
                  <strong>Protected</strong> for all users except Super Admin.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sensitive section hint for new customers */}
        {!isEdit && (
          <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Lock size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500">
              You can add sensitive information (card details, passport, etc.) after creating the customer.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>
            {isEdit ? 'Save Changes' : 'Create Customer'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>

      {/* Duplicate Detection Modal */}
      <Modal
        open={showDuplicateModal}
        onClose={() => { setShowDuplicateModal(false); setLoading(false); }}
        title="Possible Duplicate Customer"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Possible duplicate customer found.</p>
              <p className="text-xs text-yellow-700 mt-1">
                A customer with the same email or phone number already exists. Do you want to proceed anyway?
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Existing customers:</p>
            {duplicateWarning?.duplicates?.map((d) => (
              <div key={d._id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <span className="font-medium text-gray-900">{d.name}</span>
                <div className="text-xs text-gray-500 text-right">
                  {d.email && <div>{d.email}</div>}
                  {d.phone && <div>{d.phone}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => { setShowDuplicateModal(false); setLoading(false); }}
            >
              Cancel
            </Button>
            <Button onClick={handleOverrideDuplicate} loading={loading}>
              Proceed Anyway
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
