import type { AuthContext } from '@/types';
import { getClerkAuth } from './clerk';

/**
 * Resolves the current user's auth context from Clerk session.
 * Throws a structured error if not authenticated or no organization is active.
 */
export async function requireAuth(): Promise<AuthContext> {
  const { userId, orgId, orgRole } = await getClerkAuth();

  if (!userId) {
    throw { type: 'authorization', message: 'Authentication required' };
  }

  if (!orgId) {
    throw { type: 'authorization', message: 'No active organization' };
  }

  // Map Clerk role to our role type
  const role = mapClerkRole(orgRole);

  return {
    userId,
    organizationId: orgId,
    role,
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

function mapClerkRole(clerkRole: string | null | undefined): 'admin' | 'editor' | 'viewer' {
  switch (clerkRole) {
    case 'org:admin':
      return 'admin';
    case 'org:editor':
      return 'editor';
    default:
      return 'viewer';
  }
}
