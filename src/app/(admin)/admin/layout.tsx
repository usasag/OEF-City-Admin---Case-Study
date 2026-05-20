import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { requireAuth } from '@/lib/auth/permissions';
import { supabase } from '@/lib/db/supabase';
import { AdminShell } from '@/components/admin/AdminShell';
import { Icon } from '@/components/ui/Icon';
import { getCitiesByOrgId } from '@/lib/db/queries/cities';
import { getActiveCity } from '@/lib/auth/active-city';
import { NoOrgSelector } from '@/components/admin/NoOrgSelector';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // First check if user is signed in at all
  const { userId, orgId } = await auth();

  if (!userId) {
    // Not signed in — redirect to sign-in (middleware should handle this,
    // but this is a safety net)
    redirect('/sign-in');
  }

  if (!orgId) {
    // Signed in but no active Clerk organization selected.
    // Show a page with OrganizationSwitcher so they can create/select one.
    return <NoOrgSelector />;
  }

  // Now we know we have both userId and orgId — safe to call requireAuth
  let authCtx;
  try {
    authCtx = await requireAuth();
  } catch {
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

  // Resolve the Clerk org ID to an internal organizations row
  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('clerk_org_id', authCtx.organizationId)
    .single();

  if (!organization) {
    // Organization not registered — gate based on role
    if (authCtx.role === 'admin') {
      // Clerk-org admin: redirect to onboarding (unless already there)
      const headersList = await headers();
      const pathname = headersList.get('x-next-pathname') || '/admin';

      if (!pathname.startsWith('/admin/onboarding')) {
        redirect('/admin/onboarding');
      }

      // Already on onboarding page — render children without AdminShell
      return <>{children}</>;
    }

    // Non-admin user: show "contact your org admin" panel
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="card max-w-md text-center p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-50">
            <Icon name="alert" size={24} className="text-forest-600" />
          </div>
          <h1 className="text-xl font-bold text-ink">Organization Not Set Up</h1>
          <p className="mt-3 text-ink-muted">
            Your organization has not been registered in the Climate Action Tracker yet.
            Please contact your organization admin to complete the onboarding process.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-forest-600 px-4 py-2 text-sm font-medium text-white hover:bg-forest-700 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Organization exists — fetch cities and active city, then wrap children in AdminShell
  const cities = await getCitiesByOrgId(organization.id);

  if (cities.length === 0) {
    // Org registered but no cities yet — redirect to city setup (unless already there)
    const headersList = await headers();
    const pathname = headersList.get('x-next-pathname') || '/admin';

    if (!pathname.startsWith('/admin/onboarding')) {
      redirect('/admin/onboarding');
    }
    // Already on onboarding — render without shell so the city setup form shows
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
