import OnTrackBadge from './OnTrackBadge';

interface KpiSummaryProps {
  totalReduction: number;
  percentReduced: number;
  actionCount: number;
  onTrackStatus: 'on_track' | 'off_track' | 'indeterminate';
}

export default function KpiSummary({
  totalReduction,
  percentReduced,
  actionCount,
  onTrackStatus,
}: KpiSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-500">Total Estimated Reduction</p>
        <p className="text-2xl font-bold mt-1">
          {totalReduction.toLocaleString()} t CO2e
        </p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-500">% of Baseline Reduced</p>
        <p className="text-2xl font-bold mt-1">{percentReduced.toFixed(1)}%</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-500">Climate Actions</p>
        <p className="text-2xl font-bold mt-1">{actionCount}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-500">Status</p>
        <div className="mt-2">
          <OnTrackBadge status={onTrackStatus} />
        </div>
      </div>
    </div>
  );
}
