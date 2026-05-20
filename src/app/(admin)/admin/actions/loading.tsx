import { TableSkeleton } from '@/components/admin/Skeletons';

export default function ActionsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 rounded bg-border animate-pulse" aria-busy="true" />
        <div className="h-10 w-28 rounded bg-border animate-pulse" aria-busy="true" />
      </div>
      <TableSkeleton rows={5} columns={6} />
    </div>
  );
}
