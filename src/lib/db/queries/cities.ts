import { supabase } from '../supabase';
import type { City } from '@/types';

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
