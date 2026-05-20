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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="card">
        <p className="text-sm font-medium text-ink-muted">Total Estimated Reduction</p>
        <p className="mt-1 text-2xl font-bold text-cyan-700 dark:text-cyan-400">
          {totalReduction.toLocaleString()} <span className="text-sm font-normal text-ink-faint">t CO2e</span>
        </p>
      </div>
      <div className="card">
        <p className="text-sm font-medium text-ink-muted">% of Baseline Reduced</p>
        <p className="mt-1 text-2xl font-bold text-cyan-700 dark:text-cyan-400">
          {percentReduced.toFixed(1)}%
        </p>
      </div>
      <div className="card">
        <p className="text-sm font-medium text-ink-muted">Climate Actions</p>
        <p className="mt-1 text-2xl font-bold text-cyan-700 dark:text-cyan-400">
          {actionCount}
        </p>
      </div>
      <div className="card">
        <p className="text-sm font-medium text-ink-muted">Status</p>
        <div className="mt-2">
          <OnTrackBadge status={onTrackStatus} />
        </div>
      </div>
    </div>
  );
}
