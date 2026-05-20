'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ClimateAction } from '@/types';
import { deleteClimateAction } from '@/actions/climate-actions';
import ActionForm from './ActionForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface ActionsTableProps {
  actions: ClimateAction[];
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

export default function ActionsTable({ actions }: ActionsTableProps) {
  const router = useRouter();
  const [editingAction, setEditingAction] = useState<ClimateAction | null>(null);
  const [deletingAction, setDeletingAction] = useState<ClimateAction | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  async function handleDelete() {
    if (!deletingAction) return;
    const result = await deleteClimateAction(deletingAction.id);
    if (result.success) {
      setDeletingAction(null);
      showSuccess('Climate action deleted successfully.');
      router.refresh();
    }
  }

  return (
    <div>
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Header with create button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Climate Actions</h2>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Action
        </button>
      </div>

      {/* Table */}
      {actions.length === 0 ? (
        <p className="text-sm text-gray-500">
          No climate actions have been recorded yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Sector
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Annual Reduction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Start Year
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {actions.map((action) => (
                <tr key={action.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {action.title}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {SECTOR_LABELS[action.sector] ?? action.sector}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {action.annualReduction.toLocaleString()} t CO2e
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {STATUS_LABELS[action.status] ?? action.status}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {action.startYear}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => setEditingAction(action)}
                      className="mr-2 text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingAction(action)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create form modal */}
      {showCreateForm && (
        <ActionForm
          onClose={() => {
            setShowCreateForm(false);
            showSuccess('Climate action created successfully.');
          }}
        />
      )}

      {/* Edit form modal */}
      {editingAction && (
        <ActionForm
          action={editingAction}
          onClose={() => {
            setEditingAction(null);
            showSuccess('Climate action updated successfully.');
          }}
        />
      )}

      {/* Delete confirmation dialog */}
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
