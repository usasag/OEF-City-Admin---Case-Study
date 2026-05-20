'use server';

import type { ActionResult, City } from '@/types';
import { requireAuth, requireRole } from '@/lib/auth/permissions';
import { citySchema } from '@/lib/validations/city';
import { getCityByOrgId, updateCity } from '@/lib/db/queries/cities';

export async function updateCitySettings(formData: {
  name: string;
  baselineEmissions: number;
  targetYear: number;
}): Promise<ActionResult<City>> {
  try {
    // 1. Authenticate
    const authCtx = await requireAuth();

    // 2. Check role (admin or editor)
    requireRole(authCtx, ['admin', 'editor']);

    // 3. Validate input
    const parsed = citySchema.safeParse(formData);
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

    // 4. Get city for this org
    const city = await getCityByOrgId(authCtx.organizationId);
    if (!city) {
      return {
        success: false,
        error: { type: 'not_found', message: 'City not found for this organization' },
      };
    }

    // 5. Execute mutation
    const updated = await updateCity(city.id, authCtx.organizationId, parsed.data);

    return { success: true, data: updated };
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
