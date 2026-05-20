'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setActiveCity } from '@/actions/onboarding';

interface CitySwitcherProps {
  cities: { slug: string; name: string }[];
  activeCitySlug: string | null;
}

/**
 * Accessible dropdown for switching between cities in the admin workspace.
 * Only renders when the organization owns more than one city.
 */
export function CitySwitcher({ cities, activeCitySlug }: CitySwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Hide when there's 1 or fewer cities
  if (cities.length <= 1) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSlug = e.target.value;
    if (newSlug === activeCitySlug) return;

    startTransition(async () => {
      await setActiveCity(newSlug);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="city-switcher" className="text-sm font-medium text-ink-muted">
        City:
      </label>
      <select
        id="city-switcher"
        className="select text-sm"
        value={activeCitySlug ?? ''}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Switch active city"
      >
        {cities.map((city) => (
          <option key={city.slug} value={city.slug}>
            {city.name}
          </option>
        ))}
      </select>
    </div>
  );
}
