'use server';

import { cookies } from 'next/headers';
import type { ActionResult } from '@/types';
import { requireAuth, requireRole } from '@/lib/auth/permissions';
import { getSession } from '@/lib/auth/session';
import { supabase } from '@/lib/db/supabase';
import {
  createOrganizationWithFirstCity,
  type CreateOrgWithCityResult,
} from '@/lib/db/queries/organizations';
import { getCityBySlug, getCityBySlugWithinOrg } from '@/lib/db/queries/cities';
import { grantCityAccess } from '@/lib/db/queries/city-access';
import {
  registerOrganizationInputSchema,
  joinCityInputSchema,
  type RegisterOrganizationInput,
  type JoinCityInput,
} from '@/lib/validations/onboarding';
import {
  createOrganization,
  createCityForOrg,
  type CreateOrgResult,
  type CreateCityResult,
} from '@/lib/db/queries/organizations';

// ─── registerOrganization Server Action ─────────────────────────────────────

/**
 * Registers a new organization and creates its first city.
 * Also creates a user_memberships row linking the current user to the new org.
 */
export async function registerOrganization(
  input: RegisterOrganizationInput
): Promise<ActionResult<CreateOrgWithCityResult>> {
  try {
    // 1. Authenticate
    const authCtx = await requireAuth();

    // 2. Assert admin role
    requireRole(authCtx, ['admin']);

    // 3. Reject if user already has an organization
    const { data: existingMembership } = await supabase
      .from('user_memberships')
      .select('id')
      .eq('user_id', authCtx.userId)
      .limit(1)
      .single();

    if (existingMembership) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'You already belong to an organization',
        },
      };
    }

    // 4. Validate input with combined schema
    const parsed = registerOrganizationInputSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field) {
          fieldErrors[field] = issue.message;
        }
      }
      return {
        success: false,
        error: { type: 'validation', message: 'Invalid input', fieldErrors },
      };
    }

    // 5. Call createOrganizationWithFirstCity
    const result = await createOrganizationWithFirstCity({
      organizationName: parsed.data.organizationName,
      organizationSlug: parsed.data.organizationSlug,
      clerkOrgId: authCtx.organizationId,
      cityName: parsed.data.cityName,
      citySlug: parsed.data.citySlug,
      baselineEmissions: parsed.data.baselineEmissions,
      targetYear: parsed.data.targetYear,
    });

    // 6. If successful, create user_memberships row
    if (result.success) {
      await supabase.from('user_memberships').insert({
        user_id: authCtx.userId,
        organization_id: result.data.organization.id,
        role: 'admin',
      });
    }

    return result;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'type' in err) {
      const authErr = err as { type: string; message: string };
      return {
        success: false,
        error: { type: 'authorization', message: authErr.message },
      };
    }
    return {
      success: false,
      error: { type: 'server_error', message: 'An unexpected error occurred' },
    };
  }
}

// ─── setActiveCity Server Action ────────────────────────────────────────────

/**
 * Sets the active city cookie after verifying the city belongs to the user's organization.
 */
export async function setActiveCity(
  slug: string
): Promise<ActionResult<{ slug: string }>> {
  try {
    // 1. Authenticate
    const authCtx = await requireAuth();

    // 2. Resolve internal org from membership
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', authCtx.organizationId)
      .single();

    if (!org) {
      return {
        success: false,
        error: { type: 'not_found', message: 'Organization not found' },
      };
    }

    // 3. Verify the city belongs to the user's organization
    const city = await getCityBySlugWithinOrg(org.id, slug);
    if (!city) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: 'City not found in your organization',
        },
      };
    }

    // 4. Set the oef_active_city cookie
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;

    cookieStore.set('oef_active_city', slug, {
      path: '/admin',
      sameSite: 'lax',
      secure: isProduction,
      maxAge: thirtyDaysInSeconds,
    });

    return { success: true, data: { slug } };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'type' in err) {
      const authErr = err as { type: string; message: string };
      return {
        success: false,
        error: { type: 'authorization', message: authErr.message },
      };
    }
    return {
      success: false,
      error: { type: 'server_error', message: 'An unexpected error occurred' },
    };
  }
}

// ─── joinExistingCity Server Action ─────────────────────────────────────────

/**
 * Allows an organization to join an existing city by its slug.
 * Creates a city_access grant so the org can read/write the city's data.
 */
export async function joinExistingCity(
  input: JoinCityInput
): Promise<ActionResult<{ citySlug: string; cityName: string }>> {
  try {
    // 1. Authenticate
    const authCtx = await requireAuth();

    // 2. Assert admin role
    requireRole(authCtx, ['admin']);

    // 3. Resolve internal org
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', authCtx.organizationId)
      .single();

    if (!org) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Your organization must be registered first. Please complete onboarding.',
        },
      };
    }

    // 4. Validate input
    const parsed = joinCityInputSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field) fieldErrors[field] = issue.message;
      }
      return {
        success: false,
        error: { type: 'validation', message: 'Invalid input', fieldErrors },
      };
    }

    // 5. Find the city by slug
    const city = await getCityBySlug(parsed.data.citySlug);
    if (!city) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: `No city found with slug "${parsed.data.citySlug}". Check the slug and try again.`,
          fieldErrors: { citySlug: 'City not found' },
        },
      };
    }

    // 6. Check if org already owns this city
    if (city.organizationId === org.id) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Your organization already owns this city',
        },
      };
    }

    // 7. Grant access
    const grantResult = await grantCityAccess(city.id, org.id, authCtx.userId);
    if (!grantResult.success) {
      return grantResult as ActionResult<{ citySlug: string; cityName: string }>;
    }

    return {
      success: true,
      data: { citySlug: city.slug, cityName: city.name },
    };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'type' in err) {
      const authErr = err as { type: string; message: string };
      return {
        success: false,
        error: { type: 'authorization', message: authErr.message },
      };
    }
    return {
      success: false,
      error: { type: 'server_error', message: 'An unexpected error occurred' },
    };
  }
}

// ─── registerOrganizationOnly Server Action ─────────────────────────────────

import { z } from 'zod';

const registerOrgOnlySchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required').max(100),
  organizationSlug: z.string().min(1, 'Slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
});

export type RegisterOrgOnlyInput = z.infer<typeof registerOrgOnlySchema>;

/**
 * Step 1 of separated onboarding: register the organization only (no city).
 * Also creates a user_memberships row linking the current user to the new org.
 */
export async function registerOrganizationOnly(
  input: RegisterOrgOnlyInput
): Promise<ActionResult<CreateOrgResult>> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: { type: 'authorization', message: 'Authentication required' },
      };
    }

    // Check if user already has a membership
    const { data: existingMembership } = await supabase
      .from('user_memberships')
      .select('id')
      .eq('user_id', session.userId)
      .limit(1)
      .single();

    if (existingMembership) {
      return {
        success: false,
        error: { type: 'validation', message: 'You already belong to an organization' },
      };
    }

    // Validate
    const parsed = registerOrgOnlySchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field) fieldErrors[field] = issue.message;
      }
      return { success: false, error: { type: 'validation', message: 'Invalid input', fieldErrors } };
    }

    // Create organization (pass empty string for clerkOrgId since we no longer use it)
    const result = await createOrganization({
      name: parsed.data.organizationName,
      slug: parsed.data.organizationSlug,
      clerkOrgId: '',
    });

    // If successful, create user_memberships row
    if (result.success) {
      await supabase.from('user_memberships').insert({
        user_id: session.userId,
        organization_id: result.data.id,
        role: 'admin',
      });
    }

    return result;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'type' in err && 'message' in err) {
      return { success: false, error: { type: 'authorization', message: String((err as Record<string, unknown>).message) } };
    }
    return { success: false, error: { type: 'server_error', message: 'An unexpected error occurred' } };
  }
}

// ─── createFirstCity Server Action ──────────────────────────────────────────

const createCitySchema = z.object({
  cityName: z.string().min(1, 'City name is required').max(100),
  citySlug: z.string().min(1, 'Slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  baselineEmissions: z.number().min(0.01).max(999_999_999.99),
  targetYear: z.number().int().min(new Date().getFullYear() + 1),
});

export type CreateFirstCityInput = z.infer<typeof createCitySchema>;

/**
 * Step 2 of separated onboarding: create the first city for an already-registered org.
 */
export async function createFirstCity(
  input: CreateFirstCityInput
): Promise<ActionResult<CreateCityResult>> {
  try {
    const authCtx = await requireAuth();
    requireRole(authCtx, ['admin']);

    // Resolve internal org from membership
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', authCtx.organizationId)
      .single();

    if (!org) {
      return {
        success: false,
        error: { type: 'validation', message: 'Organization not registered. Please register first.' },
      };
    }

    // Validate
    const parsed = createCitySchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field) fieldErrors[field] = issue.message;
      }
      return { success: false, error: { type: 'validation', message: 'Invalid input', fieldErrors } };
    }

    // Create city
    return await createCityForOrg({
      organizationId: org.id,
      name: parsed.data.cityName,
      slug: parsed.data.citySlug,
      baselineEmissions: parsed.data.baselineEmissions,
      targetYear: parsed.data.targetYear,
    });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'type' in err && 'message' in err) {
      return { success: false, error: { type: 'authorization', message: String((err as Record<string, unknown>).message) } };
    }
    return { success: false, error: { type: 'server_error', message: 'An unexpected error occurred' } };
  }
}
