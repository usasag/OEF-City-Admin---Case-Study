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
      <p className="text-gray-500">No climate actions have been recorded yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Sector
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Annual Reduction
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Start Year
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {actions.map((action) => (
            <tr key={action.id}>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {action.title}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                {action.sector.replace('_', ' ')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {action.annualReduction.toLocaleString()} t CO2e
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {STATUS_LABELS[action.status]}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {action.startYear}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
