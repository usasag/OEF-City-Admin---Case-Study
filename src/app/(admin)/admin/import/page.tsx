import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/permissions';
import { supabase } from '@/lib/db/supabase';
import { getActiveCity } from '@/lib/auth/active-city';
import { getImportAttemptsByCity } from '@/lib/db/queries/import-attempts';
import ImportForm from '@/components/admin/ImportForm';
import { ImportHistorySection } from '@/components/admin/ImportHistorySection';

export default async function ImportPage() {
  const authCtx = await requireAuth();
  const canEdit = authCtx.role === 'admin' || authCtx.role === 'editor';

  // Resolve internal org ID from user membership
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', authCtx.organizationId)
    .single();

  if (!org) {
    redirect('/admin/onboarding');
  }

  const activeCity = await getActiveCity(org.id);

  if (!activeCity) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-ink">Import Climate Actions</h1>
        <p className="mt-4 text-ink-muted">
          No city has been configured for this organization. Please set up your
          city first.
        </p>
      </main>
    );
  }

  // Fetch import history for this city
  const importAttempts = await getImportAttemptsByCity(activeCity.id, org.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Import Climate Actions — {activeCity.name}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Paste free-text descriptions of climate actions below. The AI will extract
          structured data for your review before importing.
        </p>
      </div>

      <div>
        {canEdit ? (
          <ImportForm />
        ) : (
          <div className="rounded-lg border border-border bg-surface-card p-6 text-center">
            <p className="text-ink-muted">
              You have read-only access. Only admins and editors can import climate actions.
            </p>
          </div>
        )}
      </div>

      {/* Import History — collapsible section */}
      <ImportHistorySection attempts={importAttempts} />
    </main>
  );
}
