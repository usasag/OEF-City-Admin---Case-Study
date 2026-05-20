import { supabase } from '../supabase';
import type { City } from '@/types';
import { getActionsByCity } from './climate-actions';
import { totalEstimatedReduction, isOnTrack } from '@/lib/calculations/progress';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface CityWithStats {
  id: string;
  name: string;
  slug: string;
  organizationName: string;
  targetYear: number;
  actionCount: number;
  totalAnnualReduction: number;
}

export interface CityWithOrgStats {
  id: string;
  name: string;
  slug: string;
  baselineEmissions: number;
  targetYear: number;
  actionCount: number;
  totalAnnualReduction: number;
  onTrackStatus: 'on_track' | 'off_track' | 'indeterminate';
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

/**
 * Maps a snake_case database row to a camelCase City object.
 */
function mapRowToCity(row: Record<string, unknown>): City {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    name: row.name as string,
    slug: row.slug as string,
    baselineEmissions: Number(row.baseline_emissions),
    targetYear: row.target_year as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Public: get city by slug (no org filter needed for public dashboard).
 */
export async function getCityBySlug(slug: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch city by slug: ${error.message}`);
  }

  return mapRowToCity(data);
}

/**
 * Admin: get city by organization_id (tenant-scoped).
 */
export async function getCityByOrgId(organizationId: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch city by organization: ${error.message}`);
  }

  return mapRowToCity(data);
}

/**
 * Admin: update city settings (tenant-scoped).
 */
export async function updateCity(
  id: string,
  organizationId: string,
  data: { name: string; baselineEmissions: number; targetYear: number }
): Promise<City> {
  const { data: updated, error } = await supabase
    .from('cities')
    .update({
      name: data.name,
      baseline_emissions: data.baselineEmissions,
      target_year: data.targetYear,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update city: ${error.message}`);
  }

  return mapRowToCity(updated);
}

// ─── Public Stats Query ──────────────────────────────────────────────────────

/**
 * Public: get all cities with attached organization name, action count,
 * and total annual reduction. Used by the Landing_Page city directory.
 */
export async function getAllPublicCitiesWithStats(): Promise<CityWithStats[]> {
  // Fetch all cities joined with their organization name
  const { data: cities, error: citiesError } = await supabase
    .from('cities')
    .select(`
      id,
      name,
      slug,
      target_year,
      organization_id,
      organizations ( name )
    `);

  if (citiesError) {
    throw new Error(`Failed to fetch public cities: ${citiesError.message}`);
  }

  if (!cities || cities.length === 0) {
    return [];
  }

  // Fetch aggregated action stats per city
  const cityIds = cities.map((c: Record<string, unknown>) => c.id as string);

  const { data: actions, error: actionsError } = await supabase
    .from('climate_actions')
    .select('city_id, annual_reduction')
    .in('city_id', cityIds);

  if (actionsError) {
    throw new Error(`Failed to fetch action stats: ${actionsError.message}`);
  }

  // Aggregate action count and total reduction per city
  const statsMap = new Map<string, { actionCount: number; totalAnnualReduction: number }>();
  for (const action of actions || []) {
    const cityId = action.city_id as string;
    const existing = statsMap.get(cityId) || { actionCount: 0, totalAnnualReduction: 0 };
    existing.actionCount += 1;
    existing.totalAnnualReduction += Number(action.annual_reduction);
    statsMap.set(cityId, existing);
  }

  // Map to CityWithStats
  return cities.map((row: Record<string, unknown>) => {
    const cityId = row.id as string;
    const stats = statsMap.get(cityId) || { actionCount: 0, totalAnnualReduction: 0 };
    // organizations is a joined object from Supabase
    const org = row.organizations as { name: string } | null;

    return {
      id: cityId,
      name: row.name as string,
      slug: row.slug as string,
      organizationName: org?.name ?? '',
      targetYear: row.target_year as number,
      actionCount: stats.actionCount,
      totalAnnualReduction: stats.totalAnnualReduction,
    };
  });
}

// ─── Admin Multi-City Queries ────────────────────────────────────────────────

/**
 * Admin: get all cities for an organization (tenant-scoped).
 * Returns all cities sorted alphabetically by name.
 */
export async function getCitiesByOrgId(orgId: string): Promise<City[]> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('organization_id', orgId)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch cities by organization: ${error.message}`);
  }

  return (data || []).map(mapRowToCity);
}

/**
 * Admin: get a specific city by slug within an organization (tenant-scoped).
 * Used for active city resolution in the Admin_Shell.
 */
export async function getCityBySlugWithinOrg(orgId: string, citySlug: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('organization_id', orgId)
    .eq('slug', citySlug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch city by slug within org: ${error.message}`);
  }

  return mapRowToCity(data);
}

// ─── Admin Org-Level KPI Helper ──────────────────────────────────────────────

/**
 * Admin: get all cities for an organization with computed stats.
 * Returns each city enriched with action count, total annual reduction,
 * and on-track status (computed via the calculations module).
 */
export async function getCitiesByOrgIdWithStats(orgId: string): Promise<CityWithOrgStats[]> {
  const cities = await getCitiesByOrgId(orgId);

  const results: CityWithOrgStats[] = await Promise.all(
    cities.map(async (city) => {
      const actions = await getActionsByCity(city.id);
      const totalReduction = totalEstimatedReduction(actions);
      const onTrackStatus = isOnTrack(city, actions);

      return {
        id: city.id,
        name: city.name,
        slug: city.slug,
        baselineEmissions: city.baselineEmissions,
        targetYear: city.targetYear,
        actionCount: actions.length,
        totalAnnualReduction: totalReduction,
        onTrackStatus,
      };
    })
  );

  return results;
}
