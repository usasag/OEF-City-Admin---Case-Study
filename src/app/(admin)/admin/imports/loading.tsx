import { TableSkeleton } from '@/components/admin/Skeletons';

export default function ImportsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 rounded bg-border animate-pulse" aria-busy="true" />
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
}
