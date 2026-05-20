import { supabase } from '../supabase';
import type { ActionResult } from '@/types';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface CreateOrgWithCityInput {
  organizationName: string;
  organizationSlug: string;
  clerkOrgId: string;
  cityName: string;
  citySlug: string;
  baselineEmissions: number;
  targetYear: number;
}

export interface CreateOrgWithCityResult {
  organization: { id: string; name: string; slug: string; clerkOrgId: string };
  city: { id: string; name: string; slug: string };
}

// ─── Transactional Onboarding Query ─────────────────────────────────────────

/**
 * Creates an Organization and its first City atomically.
 *
 * Since the Supabase JS client does not support explicit transactions,
 * this uses sequential inserts with manual rollback:
 * 1. Insert organization → on unique constraint violation, return field error.
 * 2. Insert city → on unique constraint violation, delete the org and return field error.
 * 3. On success, return both records.
 *
 * Unique constraint codes:
 * - Postgres error code '23505' = unique_violation
 */
export async function createOrganizationWithFirstCity(
  input: CreateOrgWithCityInput
): Promise<ActionResult<CreateOrgWithCityResult>> {
  // Step 1: Insert organization
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: input.organizationName,
      slug: input.organizationSlug,
      clerk_org_id: input.clerkOrgId,
    })
    .select('id, name, slug, clerk_org_id')
    .single();

  if (orgError) {
    // Check for unique constraint violations
    if (orgError.code === '23505') {
      // Determine which field caused the conflict
      if (orgError.message.includes('organizations_slug_unique')) {
        return {
          success: false,
          error: {
            type: 'validation',
            message: 'Organization slug is already in use',
            fieldErrors: { organizationSlug: 'already in use' },
          },
        };
      }
      if (orgError.message.includes('organizations_clerk_org_id_unique')) {
        return {
          success: false,
          error: {
            type: 'validation',
            message: 'This Clerk organization is already registered',
            fieldErrors: { organizationSlug: 'organization already registered' },
          },
        };
      }
      // Generic unique violation fallback
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Organization slug is already in use',
          fieldErrors: { organizationSlug: 'already in use' },
        },
      };
    }

    return {
      success: false,
      error: {
        type: 'server_error',
        message: 'Failed to create organization',
      },
    };
  }

  const organizationId = orgData.id as string;

  // Step 2: Insert city under the new organization
  const { data: cityData, error: cityError } = await supabase
    .from('cities')
    .insert({
      organization_id: organizationId,
      name: input.cityName,
      slug: input.citySlug,
      baseline_emissions: input.baselineEmissions,
      target_year: input.targetYear,
    })
    .select('id, name, slug')
    .single();

  if (cityError) {
    // Rollback: delete the organization we just created
    await supabase.from('organizations').delete().eq('id', organizationId);

    if (cityError.code === '23505') {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'City slug is already in use for this organization',
          fieldErrors: { citySlug: 'already in use' },
        },
      };
    }

    return {
      success: false,
      error: {
        type: 'server_error',
        message: 'Failed to create city',
      },
    };
  }

  // Step 3: Return both records on success
  return {
    success: true,
    data: {
      organization: {
        id: organizationId,
        name: orgData.name as string,
        slug: orgData.slug as string,
        clerkOrgId: orgData.clerk_org_id as string,
      },
      city: {
        id: cityData.id as string,
        name: cityData.name as string,
        slug: cityData.slug as string,
      },
    },
  };
}
