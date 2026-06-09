'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SensitiveDataSection from '@/components/ui/SensitiveField';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Archive, Trash2, AlertTriangle } from 'lucide-react';

export default function CustomerDetailClient({
  customerId,
  isSuperAdmin,
  canArchiveOrDelete,
  customerStatus,
  customerName,
  currentRole,
}) {
  const router = useRouter();
  const [actionModal, setActionModal] = useState({ open: false, type: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  async function handleAction() {
    setActionLoading(true);
    setActionError('');

    const { type } = actionModal;

    try {
      let res;

      if (type === 'hard_delete') {
        res = await fetch(`/api/customers/${customerId}?permanent=true`, { method: 'DELETE' });
      } else if (type === 'restore') {
        res = await fetch(`/api/customers/${customerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active' }),
        });
      } else {
        // archive
        res = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' });
      }

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Action failed.');
        setActionLoading(false);
        return;
      }

      if (type === 'hard_delete') {
        router.push('/customers');
        router.refresh();
      } else {
        router.refresh();
      }
      setActionModal({ open: false, type: null });
    } catch {
      setActionError('Network error. Please try again.');
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Sensitive Information */}
      <SensitiveDataSection customerId={customerId} isSuperAdmin={isSuperAdmin} />

      {/* Archive / Delete actions */}
      {(canArchiveOrDelete || isSuperAdmin) && (
        <div className="flex items-center gap-3 pt-1 flex-wrap">
          {canArchiveOrDelete && customerStatus === 'active' && (
            <button
              onClick={() => setActionModal({ open: true, type: 'archive' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors cursor-pointer"
            >
              <Archive size={13} />
              Archive Customer
            </button>
          )}
          {canArchiveOrDelete && customerStatus === 'archived' && (
            <button
              onClick={() => setActionModal({ open: true, type: 'restore' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              Restore to Active
            </button>
          )}
          {isSuperAdmin && (
            <button
              onClick={() => setActionModal({ open: true, type: 'hard_delete' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer ml-auto"
            >
              <Trash2 size={13} />
              Delete Permanently
            </button>
          )}
        </div>
      )}

      {/* Confirmation modal */}
      <Modal
        open={actionModal.open}
        onClose={() => { setActionModal({ open: false, type: null }); setActionError(''); }}
        title={
          actionModal.type === 'hard_delete'
            ? 'Permanently Delete Customer'
            : actionModal.type === 'archive'
            ? 'Archive Customer'
            : 'Restore Customer'
        }
      >
        <div className="space-y-4">
          {actionModal.type === 'hard_delete' ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">This action is irreversible.</p>
                <p className="text-xs text-red-700 mt-1">
                  <strong>{customerName}</strong> and all associated sensitive data will be permanently deleted from the database.
                </p>
              </div>
            </div>
          ) : actionModal.type === 'archive' ? (
            <p className="text-sm text-gray-700">
              Are you sure you want to archive <strong>{customerName}</strong>?
              The customer will be hidden from the active list but not deleted.
              You can restore them anytime.
            </p>
          ) : (
            <p className="text-sm text-gray-700">
              Restore <strong>{customerName}</strong> to the active list?
            </p>
          )}

          {actionError && (
            <p className="text-sm text-red-600">{actionError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              onClick={() => { setActionModal({ open: false, type: null }); setActionError(''); }}
            >
              Cancel
            </Button>
            <button
              onClick={handleAction}
              disabled={actionLoading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                actionModal.type === 'hard_delete'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-900 text-white'
              }`}
            >
              {actionLoading
                ? 'Processing...'
                : actionModal.type === 'hard_delete'
                ? 'Delete Permanently'
                : actionModal.type === 'archive'
                ? 'Archive'
                : 'Restore'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
