'use server';

import type { ActionResult, ClimateAction } from '@/types';
import type { ExtractedAction } from '@/lib/ai/schema';
import { requireAuth, requireRole } from '@/lib/auth/permissions';
import { importTextSchema } from '@/lib/validations/import';
import { getCityByOrgId } from '@/lib/db/queries/cities';

export interface ImportResult {
  actions: ExtractedAction[];
  provider: string;
  model: string;
}

export async function importClimateActions(
  text: string
): Promise<ActionResult<ImportResult>> {
  try {
    // 1. Authenticate
    const authCtx = await requireAuth();

    // 2. Check role (admin or editor)
    requireRole(authCtx, ['admin', 'editor']);

    // 3. Validate input text length
    const parsed = importTextSchema.safeParse({ text });
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

    // 5. Call LLM extractor (to be implemented in task 9.5)
    // For now, return a placeholder that will be replaced
    const { extractClimateActions } = await import('@/lib/ai/extract-climate-actions');
    const result = await extractClimateActions({ text, cityName: city.name });

    if (result.status === 'failed') {
      return {
        success: false,
        error: {
          type: 'server_error',
          message: result.error ?? 'Extraction failed due to a provider issue.',
        },
      };
    }

    return {
      success: true,
      data: {
        actions: result.actions,
        provider: result.provider,
        model: result.model,
      },
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
      error: {
        type: 'server_error',
        message: 'Extraction failed due to a provider issue.',
      },
    };
  }
}

export async function approveImportedActions(
  actions: ExtractedAction[]
): Promise<ActionResult<ClimateAction[]>> {
  try {
    // 1. Authenticate
    const authCtx = await requireAuth();

    // 2. Check role (admin or editor)
    requireRole(authCtx, ['admin', 'editor']);

    // 3. Get city for this org
    const city = await getCityByOrgId(authCtx.organizationId);
    if (!city) {
      return {
        success: false,
        error: { type: 'not_found', message: 'City not found for this organization' },
      };
    }

    // 4. Validate and persist each action
    const { createAction } = await import('@/lib/db/queries/climate-actions');
    const { climateActionSchema } = await import('@/lib/validations/climate-action');

    const created: ClimateAction[] = [];
    for (const action of actions) {
      const parsed = climateActionSchema.safeParse(action);
      if (!parsed.success) {
        return {
          success: false,
          error: {
            type: 'validation',
            message: `Invalid action "${action.title}": ${parsed.error.issues[0]?.message}`,
          },
        };
      }
      const record = await createAction(authCtx.organizationId, city.id, parsed.data);
      created.push(record);
    }

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
