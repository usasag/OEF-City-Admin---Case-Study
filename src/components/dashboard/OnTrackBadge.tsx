interface OnTrackBadgeProps {
  status: 'on_track' | 'off_track' | 'indeterminate';
}

const config: Record<OnTrackBadgeProps['status'], { label: string; className: string }> = {
  on_track: { label: 'On Track', className: 'bg-green-100 text-green-800' },
  off_track: { label: 'Off Track', className: 'bg-red-100 text-red-800' },
  indeterminate: { label: 'Indeterminate', className: 'bg-gray-100 text-gray-800' },
};

export default function OnTrackBadge({ status }: OnTrackBadgeProps) {
  const { label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}
    >
      {label}
    </span>
  );
}
