import { supabase } from '../supabase';
import type { ClimateAction, Sector, ActionStatus } from '@/types';

/**
 * Maps a snake_case database row to a camelCase ClimateAction object.
 */
function mapRowToAction(row: Record<string, unknown>): ClimateAction {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    cityId: row.city_id as string,
    title: row.title as string,
    sector: row.sector as Sector,
    annualReduction: Number(row.annual_reduction),
    status: row.status as ActionStatus,
    startYear: row.start_year as number,
    sourceText: (row.source_text as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Public: get all actions for a city, sorted by start_year DESC then title ASC.
 */
export async function getActionsByCity(cityId: string): Promise<ClimateAction[]> {
  const { data, error } = await supabase
    .from('climate_actions')
    .select('*')
    .eq('city_id', cityId)
    .order('start_year', { ascending: false })
    .order('title', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch actions for city: ${error.message}`);
  }

  return (data ?? []).map(mapRowToAction);
}

/**
 * Admin: create a new climate action (tenant-scoped).
 */
export async function createAction(
  organizationId: string,
  cityId: string,
  data: {
    title: string;
    sector: Sector;
    annualReduction: number;
    status: ActionStatus;
    startYear: number;
  }
): Promise<ClimateAction> {
  const { data: created, error } = await supabase
    .from('climate_actions')
    .insert({
      organization_id: organizationId,
      city_id: cityId,
      title: data.title,
      sector: data.sector,
      annual_reduction: data.annualReduction,
      status: data.status,
      start_year: data.startYear,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create climate action: ${error.message}`);
  }

  return mapRowToAction(created);
}

/**
 * Admin: update an existing climate action (tenant-scoped, verifies org ownership).
 */
export async function updateAction(
  id: string,
  organizationId: string,
  data: {
    title: string;
    sector: Sector;
    annualReduction: number;
    status: ActionStatus;
    startYear: number;
  }
): Promise<ClimateAction> {
  const { data: updated, error } = await supabase
    .from('climate_actions')
    .update({
      title: data.title,
      sector: data.sector,
      annual_reduction: data.annualReduction,
      status: data.status,
      start_year: data.startYear,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update climate action: ${error.message}`);
  }

  return mapRowToAction(updated);
}

/**
 * Admin: delete a climate action (tenant-scoped, verifies org ownership).
 */
export async function deleteAction(
  id: string,
  organizationId: string
): Promise<void> {
  const { error } = await supabase
    .from('climate_actions')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId);

  if (error) {
    throw new Error(`Failed to delete climate action: ${error.message}`);
  }
}
