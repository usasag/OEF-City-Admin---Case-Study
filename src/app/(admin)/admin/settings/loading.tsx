import { TextSkeleton } from '@/components/admin/Skeletons';

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <TextSkeleton width="w-24" />
        <div className="h-10 w-full rounded bg-border animate-pulse" aria-busy="true" />
      </div>
      <div className="space-y-2">
        <TextSkeleton width="w-40" />
        <div className="h-10 w-full rounded bg-border animate-pulse" aria-busy="true" />
      </div>
      <div className="space-y-2">
        <TextSkeleton width="w-28" />
        <div className="h-10 w-full rounded bg-border animate-pulse" aria-busy="true" />
      </div>
      <div className="h-10 w-32 rounded bg-border animate-pulse" aria-busy="true" />
    </div>
  );
}
