import { supabase } from '../supabase';
import type { ActionResult } from '@/types';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface CityAccessGrant {
  id: string;
  cityId: string;
  organizationId: string;
  grantedAt: string;
  grantedBy: string | null;
}

// ─── Query Helpers ───────────────────────────────────────────────────────────

/**
 * Grant an organization access to a city.
 * Returns a validation error if the grant already exists.
 */
export async function grantCityAccess(
  cityId: string,
  organizationId: string,
  grantedBy?: string
): Promise<ActionResult<CityAccessGrant>> {
  const { data, error } = await supabase
    .from('city_access')
    .insert({
      city_id: cityId,
      organization_id: organizationId,
      granted_by: grantedBy ?? null,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Your organization already has access to this city',
        },
      };
    }
    // Table might not exist yet (migration 007 not applied)
    if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
      return {
        success: false,
        error: {
          type: 'server_error',
          message: 'City access feature is not yet configured. Please run migration 007_create_city_access.sql in your Supabase SQL editor.',
        },
      };
    }
    return {
      success: false,
      error: {
        type: 'server_error',
        message: 'Failed to grant city access',
      },
    };
  }

  return {
    success: true,
    data: {
      id: data.id,
      cityId: data.city_id,
      organizationId: data.organization_id,
      grantedAt: data.granted_at,
      grantedBy: data.granted_by,
    },
  };
}

/**
 * Check if an organization has access to a city (either owns it or has a grant).
 */
export async function hasAccessToCity(
  cityId: string,
  organizationId: string
): Promise<boolean> {
  // Check ownership
  const { data: city } = await supabase
    .from('cities')
    .select('id')
    .eq('id', cityId)
    .eq('organization_id', organizationId)
    .single();

  if (city) return true;

  // Check access grant
  const { data: grant } = await supabase
    .from('city_access')
    .select('id')
    .eq('city_id', cityId)
    .eq('organization_id', organizationId)
    .single();

  return !!grant;
}

/**
 * Revoke an organization's access to a city.
 */
export async function revokeCityAccess(
  cityId: string,
  organizationId: string
): Promise<void> {
  await supabase
    .from('city_access')
    .delete()
    .eq('city_id', cityId)
    .eq('organization_id', organizationId);
}
