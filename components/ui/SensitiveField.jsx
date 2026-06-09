'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { SENSITIVE_FIELD_LABELS } from '@/lib/sensitiveFields';

// Mask sensitive values for display (show last 4 chars)
function maskValue(fieldType, value) {
  if (!value || value === 'Protected') return 'Protected';
  if (fieldType === 'CARD_NUMBER' && value.length > 4) {
    return '•••• •••• •••• ' + value.slice(-4);
  }
  if (fieldType === 'CVV') return '•••';
  if (fieldType === 'PASSPORT' || fieldType === 'GOVT_ID') {
    return '••••••' + value.slice(-3);
  }
  return value;
}

/**
 * Displays a single protected sensitive field.
 * For super_admin: shows a "Reveal" toggle button.
 * For others: shows 🔒 Protected.
 */
export function SensitiveFieldDisplay({ fieldType, value, isSuperAdmin }) {
  const [revealed, setRevealed] = useState(false);
  const label = SENSITIVE_FIELD_LABELS[fieldType] || fieldType;

  if (!isSuperAdmin || value === 'Protected') {
    return (
      <div className="flex items-center gap-2">
        <Lock size={13} className="text-gray-400 flex-shrink-0" />
        <span className="text-xs font-medium text-gray-400 tracking-wide">Protected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <Lock size={13} className="text-amber-500 flex-shrink-0" />
      <span className="text-sm font-mono text-gray-800">
        {revealed ? value : maskValue(fieldType, value)}
      </span>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700 ml-1"
        title={revealed ? 'Hide value' : 'Reveal value'}
      >
        {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
}

/**
 * Full sensitive data section shown on the Customer Detail page.
 * Fetches data from the API and renders each field with role-appropriate display.
 */
export default function SensitiveDataSection({ customerId, isSuperAdmin }) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSensitiveData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers/${customerId}/sensitive`);
      const data = await res.json();
      if (res.ok) {
        setFields(data.fields || []);
      } else {
        setError(data.error || 'Failed to load sensitive data.');
      }
    } catch {
      setError('Network error loading sensitive data.');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchSensitiveData();
  }, [fetchSensitiveData]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={15} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-gray-900">Sensitive Information</h2>
        </div>
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={15} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-gray-900">Sensitive Information</h2>
        </div>
        <p className="text-sm text-gray-400 italic">No sensitive data stored for this customer.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock size={15} className="text-amber-500" />
          <h2 className="text-sm font-semibold text-gray-900">Sensitive Information</h2>
        </div>
        {isSuperAdmin && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <ShieldAlert size={11} />
            Admin View
          </span>
        )}
        {!isSuperAdmin && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
            <Lock size={11} />
            Protected
          </span>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 mb-3">{error}</div>
      )}

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {fields.map((field) => (
          <div key={field.fieldType}>
            <dt className="text-xs text-gray-500 mb-1">
              {SENSITIVE_FIELD_LABELS[field.fieldType] || field.fieldType}
            </dt>
            <dd>
              <SensitiveFieldDisplay
                fieldType={field.fieldType}
                value={field.value}
                isSuperAdmin={isSuperAdmin}
              />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
