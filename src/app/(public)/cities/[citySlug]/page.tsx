import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
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
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Icon } from '@/components/ui/Icon';

interface PageProps {
  params: Promise<{ citySlug: string }>;
}

export default async function CityDashboardPage({ params }: PageProps) {
  const { citySlug } = await params;

  const { userId } = await auth();
  const signedIn = !!userId;

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
    <main className="min-h-screen bg-surface-alt dark:bg-slate-900">
      {/* Header */}
      <header className="border-b border-border bg-surface dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Brand mark and title */}
          <div className="flex items-center gap-3">
            <span className="text-forest-600 dark:text-forest-500">
              <Icon name="leaf" size={28} ariaLabel="OEF Tracker" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink">
                {city.name} <span className="text-forest-600 dark:text-forest-500">Climate Tracker</span>
              </h1>
              <p className="mt-0.5 text-sm text-ink-muted">
                Baseline: {city.baselineEmissions.toLocaleString()} tonnes CO2e · Target Year: {city.targetYear}
              </p>
            </div>
          </div>
          {/* Auth link + theme toggle */}
          <div className="flex items-center gap-4">
            {signedIn ? (
              <Link href="/admin" className="text-sm font-medium text-forest-600 hover:text-forest-700 dark:text-forest-500 dark:hover:text-forest-400">
                Open admin
              </Link>
            ) : (
              <Link href="/sign-in" className="text-sm font-medium text-forest-600 hover:text-forest-700 dark:text-forest-500 dark:hover:text-forest-400">
                Sign in
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* KPI Summary */}
        <KpiSummary
          totalReduction={totalReduction}
          percentReduced={percentReduced}
          actionCount={actions.length}
          onTrackStatus={onTrackStatus}
        />

        {/* Charts Row */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <EmissionsProjectionChart
              projections={projections}
              cityName={city.name}
              targetYear={city.targetYear}
            />
          </div>
          <div className="card">
            <SectorBreakdownChart
              sectorData={sectorData}
              totalReduction={totalReduction}
            />
          </div>
        </div>

        {/* Progress Gauge */}
        <div className="mt-6 card">
          <ProgressGaugeChart
            percentReduced={percentReduced}
            onTrackStatus={onTrackStatus}
          />
        </div>

        {/* Sector Breakdown */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-ink">Sector Breakdown</h2>
          <SectorBreakdown sectorData={sectorData} />
        </section>

        {/* Actions Table */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-ink">Climate Actions</h2>
          <ActionsList actions={actions} />
        </section>
      </div>
    </main>
  );
}
