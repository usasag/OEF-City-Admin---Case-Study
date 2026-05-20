import { CardSkeleton } from '@/components/admin/Skeletons';

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Chart skeletons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-card p-6" aria-busy="true" aria-label="Loading chart">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-48 rounded bg-border" />
            <div className="h-64 w-full rounded bg-border" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface-card p-6" aria-busy="true" aria-label="Loading chart">
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-40 rounded bg-border" />
            <div className="h-64 w-full rounded bg-border" />
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface-card p-6" aria-busy="true" aria-label="Loading chart">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-56 rounded bg-border" />
          <div className="h-64 w-full rounded bg-border" />
        </div>
      </div>
      <CardSkeleton />
    </div>
  );
}
