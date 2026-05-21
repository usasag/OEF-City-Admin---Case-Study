'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveImportedActions } from '@/actions/imports';
import { useToast } from '@/components/ui/ToastProvider';
import type { ExtractedAction } from '@/lib/ai/schema';
import type { Sector, ActionStatus } from '@/types';

interface ImportReviewProps {
  actions: ExtractedAction[];
  onBack: () => void;
  onComplete: () => void;
}

const SECTORS: { value: Sector; label: string }[] = [
  { value: 'transport', label: 'Transport' },
  { value: 'energy', label: 'Energy' },
  { value: 'buildings', label: 'Buildings' },
  { value: 'waste', label: 'Waste' },
  { value: 'land_use', label: 'Land Use' },
];

const STATUSES: { value: ActionStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function ImportReview({ actions: initialActions, onBack, onComplete }: ImportReviewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [actions, setActions] = useState<ExtractedAction[]>(initialActions);
  const [isApproving, setIsApproving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function updateAction(index: number, field: keyof ExtractedAction, value: string | number) {
    setActions((prev) =>
      prev.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      )
    );
  }

  function removeAction(index: number) {
    setActions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleApprove() {
    if (actions.length === 0) return;

    setServerError(null);
    setIsApproving(true);

    try {
      const result = await approveImportedActions(actions);

      if (result.success) {
        toast.success(
          `Successfully imported ${result.data.length} climate action${result.data.length !== 1 ? 's' : ''}`
        );
        router.refresh();
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setServerError(result.error.message);
        toast.error(result.error.message);
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">
          Review Extracted Actions ({actions.length})
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-ink-muted hover:text-ink"
        >
          ← Back to input
        </button>
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
          {serverError}
        </div>
      )}

      {actions.length === 0 ? (
        <div className="rounded-lg bg-surface-card border border-border p-4 text-center text-sm text-ink-muted">
          All actions have been removed. Go back to try again.
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div
              key={index}
              className="card p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="text-xs font-medium text-ink-muted">
                  Action {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeAction(index)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label={`Remove action ${index + 1}`}
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor={`action-title-${index}`}
                    className="block text-xs font-medium text-ink-muted"
                  >
                    Title
                  </label>
                  <input
                    id={`action-title-${index}`}
                    type="text"
                    value={action.title}
                    onChange={(e) => updateAction(index, 'title', e.target.value)}
                    maxLength={200}
                    className="input mt-1"
                  />
                </div>

                {/* Sector */}
                <div>
                  <label
                    htmlFor={`action-sector-${index}`}
                    className="block text-xs font-medium text-ink-muted"
                  >
                    Sector
                  </label>
                  <select
                    id={`action-sector-${index}`}
                    value={action.sector}
                    onChange={(e) => updateAction(index, 'sector', e.target.value)}
                    className="select mt-1"
                  >
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor={`action-status-${index}`}
                    className="block text-xs font-medium text-ink-muted"
                  >
                    Status
                  </label>
                  <select
                    id={`action-status-${index}`}
                    value={action.status}
                    onChange={(e) => updateAction(index, 'status', e.target.value)}
                    className="select mt-1"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Annual Reduction */}
                <div>
                  <label
                    htmlFor={`action-reduction-${index}`}
                    className="block text-xs font-medium text-ink-muted"
                  >
                    Annual Reduction (tonnes CO2e)
                  </label>
                  <input
                    id={`action-reduction-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={action.annualReduction}
                    onChange={(e) =>
                      updateAction(index, 'annualReduction', Number(e.target.value))
                    }
                    className="input mt-1"
                  />
                </div>

                {/* Start Year */}
                <div>
                  <label
                    htmlFor={`action-year-${index}`}
                    className="block text-xs font-medium text-ink-muted"
                  >
                    Start Year
                  </label>
                  <input
                    id={`action-year-${index}`}
                    type="number"
                    min="2000"
                    max="2100"
                    value={action.startYear}
                    onChange={(e) =>
                      updateAction(index, 'startYear', Number(e.target.value))
                    }
                    className="input mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve / Cancel buttons */}
      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isApproving}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApprove}
          disabled={isApproving || actions.length === 0}
          className="btn-primary"
        >
          {isApproving
            ? 'Approving...'
            : `Approve & Import ${actions.length} Action${actions.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
