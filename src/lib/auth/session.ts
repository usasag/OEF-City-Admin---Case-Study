import { createSupabaseServerClient } from './supabase-auth';

/**
 * Reads the current Supabase session from cookies (server-side).
 * Returns the user's ID and email, or null if not authenticated.
 */
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
  };
}
