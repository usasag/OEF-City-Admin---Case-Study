import { redirect } from 'next/navigation';
import Link from 'next/link';
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
  const { data: membership } = await supabase
    .from('user_memberships')
    .select('organization_id, role')
    .eq('user_id', session.userId)
    .limit(1)
    .single();

  if (!membership) {
    // No org membership — render children without shell (onboarding page will show)
    return <>{children}</>;
  }

  // Resolve the organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('id', membership.organization_id)
    .single();

  if (!organization) {
    // Org record missing — render children without shell
    return <>{children}</>;
  }

  // Organization exists — fetch cities
  const cities = await getCitiesByOrgId(organization.id);

  if (cities.length === 0) {
    // Org registered but no cities yet — render children without shell (onboarding step 2)
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
