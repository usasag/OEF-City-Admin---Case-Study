import { cookies } from 'next/headers';
import { getCityBySlugWithinOrg, getCitiesByOrgId } from '@/lib/db/queries/cities';
import type { City } from '@/types';

const COOKIE_NAME = 'oef_active_city';
const THIRTY_DAYS = 30 * 24 * 60 * 60;

/**
 * Resolves the active city for the given organization.
 * Resolution order:
 * 1. Read `oef_active_city` cookie → look up by (orgId, slug)
 * 2. If cookie is unset or names a foreign-org city → fallback to alphabetically first city
 * 3. If org has zero cities → return null
 */
export async function getActiveCity(orgId: string): Promise<City | null> {
  const cookieStore = await cookies();
  const slug = cookieStore.get(COOKIE_NAME)?.value;

  if (slug) {
    const city = await getCityBySlugWithinOrg(orgId, slug);
    if (city) return city;
  }

  // Fallback: alphabetically first city in the org
  const cities = await getCitiesByOrgId(orgId);
  return cities.length > 0 ? cities[0] : null;
}

/**
 * Writes the active city cookie.
 * This is a low-level helper for Server Components/Actions that need to set
 * the cookie directly. The setActiveCity Server Action in src/actions/onboarding.ts
 * also sets this cookie but includes auth + tenant validation.
 */
export async function setActiveCityCookie(slug: string): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';

  cookieStore.set(COOKIE_NAME, slug, {
    path: '/admin',
    sameSite: 'lax',
    secure: isProduction,
    maxAge: THIRTY_DAYS,
  });
}
