import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/permissions';
import { supabase } from '@/lib/db/supabase';
import { getActiveCity } from '@/lib/auth/active-city';
import { CitySettingsForm } from '@/components/admin/CitySettingsForm';

export default async function SettingsPage() {
  const authCtx = await requireAuth();
  const canEdit = authCtx.role === 'admin' || authCtx.role === 'editor';

  // Resolve internal org ID from Clerk org ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('clerk_org_id', authCtx.organizationId)
    .single();

  if (!org) {
    redirect('/admin/onboarding');
  }

  const activeCity = await getActiveCity(org.id);

  if (!activeCity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-ink">No City Found</h2>
        <p className="mt-2 text-ink-muted">
          No city is configured for your organization. Please create a city first.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">City Settings — {activeCity.name}</h2>
      <CitySettingsForm
        initialData={{
          name: activeCity.name,
          baselineEmissions: activeCity.baselineEmissions,
          targetYear: activeCity.targetYear,
        }}
        readOnly={!canEdit}
      />
    </div>
  );
}
