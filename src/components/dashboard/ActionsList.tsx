import type { ClimateAction } from '@/types';

interface ActionsListProps {
  actions: ClimateAction[];
}

const STATUS_LABELS: Record<ClimateAction['status'], string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function ActionsList({ actions }: ActionsListProps) {
  if (actions.length === 0) {
    return (
      <p className="text-ink-faint">No climate actions have been recorded yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-alt dark:bg-slate-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Sector
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Annual Reduction
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Start Year
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface-card">
          {actions.map((action) => (
            <tr key={action.id} className="transition-colors hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10">
              <td className="px-6 py-4 text-sm font-medium text-ink">
                {action.title}
              </td>
              <td className="px-6 py-4 text-sm capitalize text-ink-muted">
                {action.sector.replace('_', ' ')}
              </td>
              <td className="px-6 py-4 text-sm text-ink-muted">
                {action.annualReduction.toLocaleString()} t CO2e
              </td>
              <td className="px-6 py-4 text-sm text-ink-muted">
                {STATUS_LABELS[action.status]}
              </td>
              <td className="px-6 py-4 text-sm text-ink-muted">
                {action.startYear}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
