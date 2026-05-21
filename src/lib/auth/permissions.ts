import type { AuthContext } from '@/types';
import { getSession } from './session';
import { supabase } from '@/lib/db/supabase';

/**
 * Resolves the current user's auth context from Supabase session + user_memberships.
 * Throws a structured error if not authenticated or no organization membership exists.
 */
export async function requireAuth(): Promise<AuthContext> {
  const session = await getSession();

  if (!session) {
    throw { type: 'authorization', message: 'Authentication required' };
  }

  // Look up the user's organization membership
  const { data: membership } = await supabase
    .from('user_memberships')
    .select('organization_id, role')
    .eq('user_id', session.userId)
    .limit(1)
    .single();

  if (!membership) {
    throw { type: 'authorization', message: 'No active organization' };
  }

  return {
    userId: session.userId,
    organizationId: membership.organization_id,
    role: membership.role as 'admin' | 'editor' | 'viewer',
  };
}

/**
 * Checks if user role is in the allowed set.
 * Throws structured error if not.
 */
export function requireRole(ctx: AuthContext, roles: ('admin' | 'editor')[]): void {
  if (!roles.includes(ctx.role as 'admin' | 'editor')) {
    throw { type: 'authorization', message: 'Insufficient permissions' };
  }
}
