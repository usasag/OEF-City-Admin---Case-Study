import { requireAuth } from '@/lib/auth/permissions';
import { supabase } from '@/lib/db/supabase';
import { getActiveCity } from '@/lib/auth/active-city';
import { getImportAttemptsByCity } from '@/lib/db/queries/import-attempts';
import ImportsHistoryTable from '@/components/admin/ImportsHistoryTable';
import { EmptyState } from '@/components/admin/EmptyState';

export default async function ImportsPage() {
  const authCtx = await requireAuth();

  // Resolve internal org ID from Clerk org ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('clerk_org_id', authCtx.organizationId)
    .single();

  if (!org) {
    return (
      <EmptyState
        icon="city"
        title="Organization not found"
        description="Your organization has not been set up yet."
        actionLabel="Set up organization"
        actionHref="/admin/onboarding"
      />
    );
  }

  // Resolve active city
  const activeCity = await getActiveCity(org.id);

  if (!activeCity) {
    return (
      <EmptyState
        icon="city"
        title="No city selected"
        description="Add a city to your organization to start importing climate actions."
        actionLabel="Set up your city"
        actionHref="/admin/onboarding"
      />
    );
  }

  // Fetch import attempts for the active city
  const attempts = await getImportAttemptsByCity(activeCity.id, org.id);

  return (
    <div className="space-y-6">
      <h1 className="text-h1">Import History</h1>

      {attempts.length === 0 ? (
        <EmptyState
          icon="cloud"
          title="No imports yet"
          description="Use the AI-assisted import to extract climate actions from free text."
          actionLabel="Start an import"
          actionHref="/admin/import"
        />
      ) : (
        <div className="card p-4">
          <ImportsHistoryTable attempts={attempts} />
        </div>
      )}
    </div>
  );
}
