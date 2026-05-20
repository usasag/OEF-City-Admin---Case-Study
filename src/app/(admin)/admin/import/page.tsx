import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/permissions';
import { supabase } from '@/lib/db/supabase';
import { getActiveCity } from '@/lib/auth/active-city';
import ImportForm from '@/components/admin/ImportForm';

export default async function ImportPage() {
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
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-ink">Import Climate Actions</h1>
        <p className="mt-4 text-ink-muted">
          No city has been configured for this organization. Please set up your
          city first.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-ink">Import Climate Actions — {activeCity.name}</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Paste free-text descriptions of climate actions below. The AI will extract
        structured data for your review before importing.
      </p>
      <div className="mt-6">
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
    </main>
  );
}
