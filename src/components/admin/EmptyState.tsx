import { Icon, type IconName } from '@/components/ui/Icon';
import Link from 'next/link';

export interface PrimaryAction {
  label: string;
  href: string;
}

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  /** Primary call-to-action — object form */
  primaryAction?: PrimaryAction;
  /** @deprecated Use primaryAction instead */
  actionLabel?: string;
  /** @deprecated Use primaryAction instead */
  actionHref?: string;
}

export function EmptyState({
  icon = 'sprout',
  title,
  description,
  primaryAction,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const resolvedLabel = primaryAction?.label ?? actionLabel;
  const resolvedHref = primaryAction?.href ?? actionHref;

  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center"
      role="status"
      aria-label={title}
    >
      <div className="mb-4 text-ink-muted">
        <Icon name={icon} size={48} />
      </div>
      <h3 className="text-h3 mb-2">{title}</h3>
      {description && (
        <p className="text-body text-ink-muted max-w-md mb-6">{description}</p>
      )}
      {resolvedLabel && resolvedHref && (
        <Link href={resolvedHref} className="btn-primary">
          {resolvedLabel}
        </Link>
      )}
    </div>
  );
}
