import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/permissions';
import { supabase } from '@/lib/db/supabase';
import { getActiveCity } from '@/lib/auth/active-city';
import { getActionsByCity } from '@/lib/db/queries/climate-actions';
import ActionsTable from '@/components/admin/ActionsTable';

export default async function ActionsPage() {
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
      <main className="p-6">
        <h1 className="text-2xl font-bold text-ink">Climate Actions</h1>
        <p className="mt-4 text-ink-muted">
          No city has been configured for this organization. Please set up your
          city first.
        </p>
      </main>
    );
  }

  const actions = await getActionsByCity(activeCity.id);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-ink">
        Climate Actions — {activeCity.name}
      </h1>
      <div className="mt-6">
        <ActionsTable actions={actions} canEdit={canEdit} />
      </div>
    </main>
  );
}
