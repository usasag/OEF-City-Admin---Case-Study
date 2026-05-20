import { supabase } from '../supabase';
import type { ImportAttempt } from '@/types';

/**
 * Maps a snake_case database row to a camelCase ImportAttempt object.
 */
function mapRowToImportAttempt(row: Record<string, unknown>): ImportAttempt {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    cityId: row.city_id as string,
    inputText: row.input_text as string,
    provider: row.provider as string,
    model: row.model as string,
    parsedJson: row.parsed_json ?? null,
    status: row.status as 'success' | 'partial' | 'failed',
    createdAt: row.created_at as string,
  };
}

/**
 * Admin: create an import attempt record (tenant-scoped).
 */
export async function createImportAttempt(
  organizationId: string,
  cityId: string,
  data: {
    inputText: string;
    provider: string;
    model: string;
    parsedJson: unknown | null;
    status: 'success' | 'partial' | 'failed';
  }
): Promise<ImportAttempt> {
  const { data: created, error } = await supabase
    .from('import_attempts')
    .insert({
      organization_id: organizationId,
      city_id: cityId,
      input_text: data.inputText,
      provider: data.provider,
      model: data.model,
      parsed_json: data.parsedJson,
      status: data.status,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create import attempt: ${error.message}`);
  }

  return mapRowToImportAttempt(created);
}

/**
 * Admin: get import attempts for a city (tenant-scoped).
 */
export async function getImportAttemptsByCity(
  cityId: string,
  organizationId: string
): Promise<ImportAttempt[]> {
  const { data, error } = await supabase
    .from('import_attempts')
    .select('*')
    .eq('city_id', cityId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch import attempts: ${error.message}`);
  }

  return (data ?? []).map(mapRowToImportAttempt);
}
