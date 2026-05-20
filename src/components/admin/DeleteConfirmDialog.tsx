'use client';

import { useState } from 'react';
import Dialog from '@/components/ui/Dialog';

interface DeleteConfirmDialogProps {
  actionTitle: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  actionTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  }

  return (
    <Dialog
      open={true}
      onClose={onCancel}
      title="Confirm Deletion"
      description={`Are you sure you want to delete "${actionTitle}"? This action cannot be undone.`}
    >
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting}
          className="btn-danger"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Dialog>
  );
}
