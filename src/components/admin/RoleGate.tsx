import { requireAuth } from '@/lib/auth/permissions';

interface RoleGateProps {
  roles: ('admin' | 'editor' | 'viewer')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Server Component that conditionally renders children based on the user's role.
 * If the user's role is not in the allowed `roles` array, renders the fallback (or nothing).
 */
export async function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const authCtx = await requireAuth();

  if (!roles.includes(authCtx.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
