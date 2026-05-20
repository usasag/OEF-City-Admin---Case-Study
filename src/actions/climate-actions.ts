'use server';

import type { ActionResult, ClimateAction } from '@/types';
import { requireAuth, requireRole } from '@/lib/auth/permissions';
import { climateActionSchema } from '@/lib/validations/climate-action';
import {
  createAction,
  updateAction,
  deleteAction,
} from '@/lib/db/queries/climate-actions';
import { getCityByOrgId } from '@/lib/db/queries/cities';

export async function createClimateAction(formData: {
  title: string;
  sector: string;
  annualReduction: number;
  status: string;
  startYear: number;
}): Promise<ActionResult<ClimateAction>> {
  try {
    // 1. Authenticate
    const authCtx = await requireAuth();

    // 2. Check role (admin or editor)
    requireRole(authCtx, ['admin', 'editor']);

    // 3. Validate input
    const parsed = climateActionSchema.safeParse(formData);
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

    // 5. Create the climate action
    const created = await createAction(authCtx.organizationId, city.id, parsed.data);

    return { success: true, data: created };
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

export async function updateClimateAction(
  id: string,
  formData: {
    title: string;
    sector: string;
    annualReduction: number;
    status: string;
    startYear: number;
  }
): Promise<ActionResult<ClimateAction>> {
  try {
    // 1. Authenticate
    const authCtx = await requireAuth();

    // 2. Check role (admin or editor)
    requireRole(authCtx, ['admin', 'editor']);

    // 3. Validate input
    const parsed = climateActionSchema.safeParse(formData);
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

    // 4. Update with org verification (query filters by organization_id for tenant isolation)
    const updated = await updateAction(id, authCtx.organizationId, parsed.data);

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

export async function deleteClimateAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Authenticate
    const authCtx = await requireAuth();

    // 2. Check role (admin or editor)
    requireRole(authCtx, ['admin', 'editor']);

    // 3. Delete with org verification (query filters by organization_id for tenant isolation)
    await deleteAction(id, authCtx.organizationId);

    return { success: true, data: { id } };
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
