import { TextSkeleton } from '@/components/admin/Skeletons';

export default function ImportLoading() {
  return (
    <div className="space-y-4">
      <TextSkeleton width="w-64" />
      <div className="h-48 w-full rounded bg-border animate-pulse" aria-busy="true" aria-label="Loading textarea" />
      <div className="flex justify-end">
        <div className="h-10 w-36 rounded bg-border animate-pulse" aria-busy="true" />
      </div>
    </div>
  );
}
