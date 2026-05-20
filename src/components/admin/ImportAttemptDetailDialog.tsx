'use client';

import type { ImportAttempt } from '@/types';
import Dialog from '@/components/ui/Dialog';

interface ImportAttemptDetailDialogProps {
  attempt: ImportAttempt | null;
  open: boolean;
  onClose: () => void;
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

export default function ImportAttemptDetailDialog({
  attempt,
  open,
  onClose,
}: ImportAttemptDetailDialogProps) {
  if (!attempt) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Import Attempt Details">
      <div className="space-y-4">
        {/* Header metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-ink-muted">Provider</span>
            <p className="text-ink font-medium">{attempt.provider}</p>
          </div>
          <div>
            <span className="text-ink-muted">Model</span>
            <p className="text-ink font-mono text-xs">{attempt.model}</p>
          </div>
          <div>
            <span className="text-ink-muted">Status</span>
            <p className="mt-1">
              <span className={getStatusBadgeClass(attempt.status)}>
                {attempt.status}
              </span>
            </p>
          </div>
          <div>
            <span className="text-ink-muted">Date</span>
            <p className="text-ink">
              {dateFormatter.format(new Date(attempt.createdAt))}
            </p>
          </div>
        </div>

        {/* Input text */}
        <div>
          <h3 className="text-sm font-medium text-ink mb-2">Input Text</h3>
          <pre className="max-h-48 overflow-y-auto rounded-md border border-border bg-surface p-3 text-xs text-ink whitespace-pre-wrap break-words font-mono">
            {attempt.inputText}
          </pre>
        </div>

        {/* Parsed JSON */}
        <div>
          <h3 className="text-sm font-medium text-ink mb-2">Parsed JSON</h3>
          <pre className="max-h-64 overflow-y-auto rounded-md border border-border bg-surface p-3 text-xs text-ink whitespace-pre-wrap break-words font-mono">
            {attempt.parsedJson
              ? JSON.stringify(attempt.parsedJson, null, 2)
              : 'No parsed data available'}
          </pre>
        </div>
      </div>
    </Dialog>
  );
}
