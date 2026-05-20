import { requireAuth } from '@/lib/auth/permissions';
import { getCityByOrgId } from '@/lib/db/queries/cities';
import { getActionsByCity } from '@/lib/db/queries/climate-actions';
import { projectEmissionsByYear } from '@/lib/calculations/projections';
import { reductionBySector } from '@/lib/calculations/sector-breakdown';
import { totalEstimatedReduction } from '@/lib/calculations/progress';
import EmissionsProjectionChart from '@/components/charts/EmissionsProjectionChart';
import SectorBreakdownChart from '@/components/charts/SectorBreakdownChart';
import AnnualReductionBarChart from '@/components/charts/AnnualReductionBarChart';

export default async function AnalyticsPage() {
  const authCtx = await requireAuth();
  const city = await getCityByOrgId(authCtx.organizationId);

  if (!city) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No city configured for your organization.</p>
      </div>
    );
  }

  const actions = await getActionsByCity(city.id);
  const projections = projectEmissionsByYear(city, actions);
  const sectorData = reductionBySector(actions);
  const totalReduction = totalEstimatedReduction(actions);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{city.name} Analytics</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4">Emissions Projection</h2>
        <EmissionsProjectionChart
          projections={projections}
          cityName={city.name}
          targetYear={city.targetYear}
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
    </div>
  );
}
