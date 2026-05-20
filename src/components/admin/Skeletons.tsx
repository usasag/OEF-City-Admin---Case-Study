interface TextSkeletonProps {
  width?: string;
  className?: string;
}

/**
 * A pulsing line placeholder for text content.
 * Configurable width via Tailwind class or inline style.
 */
export function TextSkeleton({ width = 'w-3/4', className = '' }: TextSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading text"
      className={`h-4 rounded bg-border animate-pulse ${width} ${className}`}
    />
  );
}

interface CardSkeletonProps {
  className?: string;
}

/**
 * A card-shaped placeholder with pulsing content areas.
 */
export function CardSkeleton({ className = '' }: CardSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading card"
      className={`rounded-lg border border-border bg-surface-card p-6 ${className}`}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-1/3 rounded bg-border" />
        <div className="h-4 w-2/3 rounded bg-border" />
        <div className="h-4 w-1/2 rounded bg-border" />
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * A table-shaped placeholder with pulsing rows.
 * Configurable row and column count.
 */
export function TableSkeleton({ rows = 5, columns = 4, className = '' }: TableSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading table"
      className={`rounded-lg border border-border bg-surface-card overflow-hidden ${className}`}
    >
      <div className="animate-pulse">
        {/* Header row */}
        <div className="flex gap-4 border-b border-border px-4 py-3 bg-surface-alt">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={`header-${i}`}
              className="h-4 rounded bg-border flex-1"
            />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            className="flex gap-4 border-b border-border last:border-b-0 px-4 py-3"
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className="h-4 rounded bg-border flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
