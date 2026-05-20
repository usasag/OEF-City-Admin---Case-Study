interface OnTrackBadgeProps {
  status: 'on_track' | 'off_track' | 'indeterminate';
}

export default function OnTrackBadge({ status }: OnTrackBadgeProps) {
  const config = {
    on_track: { label: 'On Track', className: 'badge-success' },
    off_track: { label: 'Off Track', className: 'badge-danger' },
    indeterminate: { label: 'Indeterminate', className: 'badge-neutral' },
  };

  const { label, className } = config[status];

  return <span className={className}>{label}</span>;
}
