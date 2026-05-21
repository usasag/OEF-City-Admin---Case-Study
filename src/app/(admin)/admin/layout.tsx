import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/permissions';
import { getSession } from '@/lib/auth/session';
import { supabase } from '@/lib/db/supabase';
import { AdminShell } from '@/components/admin/AdminShell';
import { Icon } from '@/components/ui/Icon';
import { getCitiesByOrgId } from '@/lib/db/queries/cities';
import { getActiveCity } from '@/lib/auth/active-city';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // First check if user is signed in at all
  const session = await getSession();

  if (!session) {
    redirect('/sign-in');
  }

  // Check if user has an organization membership
  let authCtx;
  try {
    authCtx = await requireAuth();
  } catch (err: unknown) {
    const authErr = err as { type?: string; message?: string };
    if (authErr?.message === 'No active organization') {
      // Signed in but no org membership — redirect to onboarding
      const headersList = await headers();
      const pathname = headersList.get('x-next-pathname') || '/admin';

      if (!pathname.startsWith('/admin/onboarding')) {
        redirect('/admin/onboarding');
      }
      return <>{children}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold text-danger">Access Denied</h1>
          <p className="mt-3 text-ink-muted">
            You must be signed in with an active organization to access the admin workspace.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-sky-400 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Resolve the organization from user_memberships
  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('id', authCtx.organizationId)
    .single();

  if (!organization) {
    // Organization not found — redirect to onboarding
    const headersList = await headers();
    const pathname = headersList.get('x-next-pathname') || '/admin';

    if (!pathname.startsWith('/admin/onboarding')) {
      redirect('/admin/onboarding');
    }
    return <>{children}</>;
  }

  // Organization exists — fetch cities and active city, then wrap children in AdminShell
  const cities = await getCitiesByOrgId(organization.id);

  if (cities.length === 0) {
    // Org registered but no cities yet — redirect to city setup
    const headersList = await headers();
    const pathname = headersList.get('x-next-pathname') || '/admin';

    if (!pathname.startsWith('/admin/onboarding')) {
      redirect('/admin/onboarding');
    }
    return <>{children}</>;
  }

  const activeCity = await getActiveCity(organization.id);

  const citiesForSwitcher = cities.map((c) => ({ slug: c.slug, name: c.name }));
  const activeCitySlug = activeCity?.slug ?? null;

  return (
    <AdminShell cities={citiesForSwitcher} activeCitySlug={activeCitySlug}>
      {children}
    </AdminShell>
  );
}
