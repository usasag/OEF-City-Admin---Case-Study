import Link from 'next/link';
import type { CityWithStats } from '@/lib/db/queries/cities';

export interface CityDirectoryCardProps {
  city: CityWithStats;
}

export function CityDirectoryCard({ city }: CityDirectoryCardProps) {
  return (
    <Link
      href={`/cities/${city.slug}`}
      className="card block hover:shadow-md transition-shadow duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500"
    >
      <h3 className="text-h3 mb-1">{city.name}</h3>
      <p className="text-small text-ink-muted mb-4">{city.organizationName}</p>

      <dl className="grid grid-cols-3 gap-2 text-small">
        <div>
          <dt className="text-ink-muted">Target year</dt>
          <dd className="font-semibold">{city.targetYear}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Actions</dt>
          <dd className="font-semibold">{city.actionCount}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Reduction</dt>
          <dd className="font-semibold">
            {city.totalAnnualReduction.toLocaleString()} t
          </dd>
        </div>
      </dl>
    </Link>
  );
}
