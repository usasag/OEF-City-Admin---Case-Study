'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ClimateAction } from '@/types';
import { deleteClimateAction } from '@/actions/climate-actions';
import { useToast } from '@/components/ui/ToastProvider';
import ActionForm from './ActionForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface ActionsTableProps {
  actions: ClimateAction[];
  canEdit?: boolean;
}

const SECTOR_LABELS: Record<string, string> = {
  transport: 'Transport',
  energy: 'Energy',
  buildings: 'Buildings',
  waste: 'Waste',
  land_use: 'Land Use',
};

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function ActionsTable({ actions, canEdit = true }: ActionsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [editingAction, setEditingAction] = useState<ClimateAction | null>(null);
  const [deletingAction, setDeletingAction] = useState<ClimateAction | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  async function handleDelete() {
    if (!deletingAction) return;
    const result = await deleteClimateAction(deletingAction.id);
    if (result.success) {
      setDeletingAction(null);
      toast.success('Climate action deleted');
      router.refresh();
    } else {
      toast.error(result.error.message);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Climate Actions</h2>
        {canEdit && (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Add Action
          </button>
        )}
      </div>

      {actions.length === 0 ? (
        <p className="text-sm text-ink-faint">No climate actions have been recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-alt dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Sector</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Annual Reduction</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Start Year</th>
                {canEdit && (
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface-card">
              {actions.map((action) => (
                <tr key={action.id} className="transition-colors hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-ink">{action.title}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-muted">{SECTOR_LABELS[action.sector] ?? action.sector}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-muted">{action.annualReduction.toLocaleString()} t CO2e</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-muted">{STATUS_LABELS[action.status] ?? action.status}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-muted">{action.startYear}</td>
                  {canEdit && (
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <button
                        type="button"
                        onClick={() => setEditingAction(action)}
                        className="mr-2 rounded-md px-2 py-1 text-cyan-600 transition-all duration-150
                                   hover:bg-cyan-50 hover:text-cyan-800
                                   active:bg-cyan-100
                                   dark:text-cyan-400 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingAction(action)}
                        className="rounded-md px-2 py-1 text-red-600 transition-all duration-150
                                   hover:bg-red-50 hover:text-red-800
                                   active:bg-red-100
                                   dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateForm && (
        <ActionForm
          onClose={() => {
            setShowCreateForm(false);
          }}
        />
      )}

      {editingAction && (
        <ActionForm
          action={editingAction}
          onClose={() => {
            setEditingAction(null);
          }}
        />
      )}

      {deletingAction && (
        <DeleteConfirmDialog
          actionTitle={deletingAction.title}
          onConfirm={handleDelete}
          onCancel={() => setDeletingAction(null)}
        />
      )}
    </div>
  );
}
