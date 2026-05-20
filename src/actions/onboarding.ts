'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import type { ActionResult } from '@/types';
import { requireAuth, requireRole } from '@/lib/auth/permissions';
import { supabase } from '@/lib/db/supabase';
import {
  createOrganizationWithFirstCity,
  type CreateOrgWithCityResult,
} from '@/lib/db/queries/organizations';
import { getCityBySlugWithinOrg } from '@/lib/db/queries/cities';

// ─── Combined Input Schema ──────────────────────────────────────────────────

const currentYear = new Date().getFullYear();

export const registerOrganizationInputSchema = z.object({
  organizationName: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be at most 100 characters'),
  organizationSlug: z
    .string()
    .min(1, 'Organization slug is required')
    .max(50, 'Organization slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  cityName: z
    .string()
    .min(1, 'City name is required')
    .max(100, 'City name must be at most 100 characters'),
  citySlug: z
    .string()
    .min(1, 'City slug is required')
    .max(50, 'City slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  baselineEmissions: z
    .number()
    .min(0.01, 'Baseline emissions must be at least 0.01')
    .max(999_999_999.99, 'Baseline emissions must not exceed 999,999,999.99'),
  targetYear: z
    .number()
    .int('Target year must be a whole number')
    .min(currentYear + 1, `Target year must be greater than ${currentYear}`),
});

export type RegisterOrganizationInput = z.infer<typeof registerOrganizationInputSchema>;

// ─── registerOrganization Server Action ─────────────────────────────────────

/**
 * Registers a new organization and creates its first city.
 * Pipeline: requireAuth → assert admin → reject if already registered → validate → create → return result.
 */
export async function registerOrganization(
  input: RegisterOrganizationInput
): Promise<ActionResult<CreateOrgWithCityResult>> {
  try {
    // 1. Authenticate
    const authCtx = await requireAuth();

    // 2. Assert Clerk org admin role (only admins can register)
    requireRole(authCtx, ['admin']);

    // 3. Reject if organization already exists for this clerk_org_id
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('clerk_org_id', authCtx.organizationId)
      .single();

    if (existingOrg) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Organization already registered',
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

    // 2. Verify the city belongs to the user's organization
    const city = await getCityBySlugWithinOrg(authCtx.organizationId, slug);
    if (!city) {
      return {
        success: false,
        error: {
          type: 'not_found',
          message: 'City not found in your organization',
        },
      };
    }

    // 3. Set the oef_active_city cookie
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
