import { notFound } from 'next/navigation';
import { getCityBySlug } from '@/lib/db/queries/cities';
import { getActionsByCity } from '@/lib/db/queries/climate-actions';
import { totalEstimatedReduction, percentOfBaselineReduced, isOnTrack } from '@/lib/calculations/progress';
import { reductionBySector } from '@/lib/calculations/sector-breakdown';
import { projectEmissionsByYear } from '@/lib/calculations/projections';
import KpiSummary from '@/components/dashboard/KpiSummary';
import SectorBreakdown from '@/components/dashboard/SectorBreakdown';
import ActionsList from '@/components/dashboard/ActionsList';
import EmissionsProjectionChart from '@/components/charts/EmissionsProjectionChart';
import SectorBreakdownChart from '@/components/charts/SectorBreakdownChart';
import ProgressGaugeChart from '@/components/charts/ProgressGaugeChart';

interface PageProps {
  params: Promise<{ citySlug: string }>;
}

export default async function CityDashboardPage({ params }: PageProps) {
  const { citySlug } = await params;

  const city = await getCityBySlug(citySlug);
  if (!city) {
    notFound();
  }

  const actions = await getActionsByCity(city.id);

  // Compute KPIs
  const totalReduction = totalEstimatedReduction(actions);
  const percentReduced = percentOfBaselineReduced(city.baselineEmissions, actions);
  const onTrackStatus = isOnTrack(city, actions);
  const sectorData = reductionBySector(actions);
  const projections = projectEmissionsByYear(city, actions);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{city.name} Climate Action Tracker</h1>
        <p className="text-gray-600 mt-2">
          Baseline: {city.baselineEmissions.toLocaleString()} tonnes CO2e · Target Year: {city.targetYear}
        </p>
      </header>

      <KpiSummary
        totalReduction={totalReduction}
        percentReduced={percentReduced}
        actionCount={actions.length}
        onTrackStatus={onTrackStatus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <EmissionsProjectionChart
          projections={projections}
          cityName={city.name}
          targetYear={city.targetYear}
        />
        <SectorBreakdownChart
          sectorData={sectorData}
          totalReduction={totalReduction}
        />
      </div>

      <div className="mt-8">
        <ProgressGaugeChart
          percentReduced={percentReduced}
          onTrackStatus={onTrackStatus}
        />
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Sector Breakdown</h2>
        <SectorBreakdown sectorData={sectorData} />
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Climate Actions</h2>
        <ActionsList actions={actions} />
      </section>
    </main>
  );
}
