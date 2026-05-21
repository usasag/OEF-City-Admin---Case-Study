import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/permissions';
import { supabase } from '@/lib/db/supabase';
import { getActiveCity } from '@/lib/auth/active-city';
import { getActionsByCity } from '@/lib/db/queries/climate-actions';
import { getImportAttemptsByCity } from '@/lib/db/queries/import-attempts';
import { projectEmissionsByYear } from '@/lib/calculations/projections';
import { reductionBySector } from '@/lib/calculations/sector-breakdown';
import { totalEstimatedReduction } from '@/lib/calculations/progress';
import EmissionsProjectionChart from '@/components/charts/EmissionsProjectionChart';
import SectorBreakdownChart from '@/components/charts/SectorBreakdownChart';
import AnnualReductionBarChart from '@/components/charts/AnnualReductionBarChart';
import ImportsHistoryTable from '@/components/admin/ImportsHistoryTable';

export default async function AnalyticsPage() {
  const authCtx = await requireAuth();

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
      <div className="text-center py-12">
        <p className="text-ink-muted">No city configured for your organization.</p>
      </div>
    );
  }

  const actions = await getActionsByCity(activeCity.id);
  const importAttempts = await getImportAttemptsByCity(activeCity.id, org.id);
  const recentImports = importAttempts.slice(0, 5);
  const projections = projectEmissionsByYear(activeCity, actions);
  const sectorData = reductionBySector(actions);
  const totalReduction = totalEstimatedReduction(actions);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{activeCity.name} Analytics</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4">Emissions Projection</h2>
        <EmissionsProjectionChart
          projections={projections}
          cityName={activeCity.name}
          targetYear={activeCity.targetYear}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Sector Breakdown</h2>
        <SectorBreakdownChart
          sectorData={sectorData}
          totalReduction={totalReduction}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Annual Reductions by Year</h2>
        <AnnualReductionBarChart actions={actions} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Imports</h2>
        {recentImports.length > 0 ? (
          <>
            <ImportsHistoryTable attempts={recentImports} />
            <div className="mt-4">
              <Link href="/admin/imports" className="text-sm text-sky-400 hover:underline">
                View all imports
              </Link>
            </div>
          </>
        ) : (
          <p className="text-ink-muted text-sm">
            No imports yet.{' '}
            <Link href="/admin/import" className="text-sky-400 hover:underline">
              Import climate actions
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
