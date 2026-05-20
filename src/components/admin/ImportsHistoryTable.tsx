'use client';

import { useState } from 'react';
import type { ImportAttempt } from '@/types';
import ImportAttemptDetailDialog from './ImportAttemptDetailDialog';

interface ImportsHistoryTableProps {
  attempts: ImportAttempt[];
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function getStatusBadgeClass(status: ImportAttempt['status']): string {
  switch (status) {
    case 'success':
      return 'badge-success';
    case 'partial':
      return 'badge-warning';
    case 'failed':
      return 'badge-danger';
  }
}

export default function ImportsHistoryTable({ attempts }: ImportsHistoryTableProps) {
  const [selectedAttempt, setSelectedAttempt] = useState<ImportAttempt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleView(attempt: ImportAttempt) {
    setSelectedAttempt(attempt);
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setSelectedAttempt(null);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-ink-muted">
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr
                key={attempt.id}
                className="border-b border-border last:border-b-0 hover:bg-surface-card transition-colors"
              >
                <td className="px-4 py-3 text-ink">{attempt.provider}</td>
                <td className="px-4 py-3 text-ink font-mono text-xs">
                  {attempt.model}
                </td>
                <td className="px-4 py-3">
                  <span className={getStatusBadgeClass(attempt.status)}>
                    {attempt.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {dateFormatter.format(new Date(attempt.createdAt))}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleView(attempt)}
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ImportAttemptDetailDialog
        attempt={selectedAttempt}
        open={dialogOpen}
        onClose={handleClose}
      />
    </>
  );
}
