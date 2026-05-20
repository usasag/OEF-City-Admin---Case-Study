'use client';

import { useState } from 'react';
import type { CityWithStats } from '@/lib/db/queries/cities';
import { CityDirectoryCard } from './CityDirectoryCard';

// ─── Pure filter helper (exported for unit/property tests) ───────────────────

/**
 * Filters cities by case-insensitive substring match against city name
 * OR organization name. Returns all cities when query is empty or whitespace.
 */
export function filterCities(cities: CityWithStats[], query: string): CityWithStats[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === '') {
    return cities;
  }
  return cities.filter(
    (city) =>
      city.name.toLowerCase().includes(trimmed) ||
      city.organizationName.toLowerCase().includes(trimmed)
  );
}

// ─── Client Component ────────────────────────────────────────────────────────

export interface CityDirectorySearchProps {
  cities: CityWithStats[];
}

export function CityDirectorySearch({ cities }: CityDirectorySearchProps) {
  const [query, setQuery] = useState('');
  const filtered = filterCities(cities, query);

  return (
    <div>
      <div className="mb-8 max-w-md mx-auto">
        <input
          type="search"
          className="input"
          placeholder="Search cities or organizations\u2026"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search cities"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-ink-muted text-body py-8">
          No cities match your search.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((city) => (
            <CityDirectoryCard key={city.id} city={city} />
          ))}
        </div>
      )}
    </div>
  );
}
