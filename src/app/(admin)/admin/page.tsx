import Link from 'next/link';
import { requireAuth } from '@/lib/auth/permissions';
import { supabase } from '@/lib/db/supabase';
import { getCitiesByOrgIdWithStats, type CityWithOrgStats } from '@/lib/db/queries/cities';
import { EmptyState } from '@/components/admin/EmptyState';
import OnTrackBadge from '@/components/dashboard/OnTrackBadge';
import { Icon } from '@/components/ui/Icon';

export default async function AdminHomePage() {
  const authCtx = await requireAuth();

  // Resolve internal org ID from user membership
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', authCtx.organizationId)
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

  const cities = await getCitiesByOrgIdWithStats(org.id);

  // Zero cities: render empty state with CTA to onboarding
  if (cities.length === 0) {
    return (
      <EmptyState
        icon="city"
        title="No cities yet"
        description="Add your first city to start tracking climate actions and progress."
        actionLabel="Add your first city"
        actionHref="/admin/onboarding"
      />
    );
  }

  // Compute org-level KPIs
  const totalCities = cities.length;
  const totalActionCount = cities.reduce((sum, c) => sum + c.actionCount, 0);
  const totalAnnualReduction = cities.reduce((sum, c) => sum + c.totalAnnualReduction, 0);

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Organization Overview</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Summary of all cities and climate actions in your organization.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon="city"
          label="Cities"
          value={totalCities.toString()}
          accent="forest"
        />
        <KpiCard
          icon="leaf"
          label="Total Actions"
          value={totalActionCount.toString()}
          accent="sky"
        />
        <KpiCard
          icon="gauge"
          label="Total Reduction"
          value={`${formatNumber(totalAnnualReduction)} t CO2e`}
          accent="sand"
        />
      </div>

      {/* City list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Cities</h2>
          <Link href="/admin/onboarding" className="btn-secondary text-sm">
            + Add City
          </Link>
        </div>
        <div className="space-y-3">
          {cities.map((city) => (
            <CityRow key={city.id} city={city} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, accent }: { icon: 'city' | 'leaf' | 'gauge'; label: string; value: string; accent: 'forest' | 'sky' | 'sand' }) {
  const accentColors = {
    forest: 'border-l-forest-500 bg-forest-50/50 dark:bg-forest-50/5',
    sky: 'border-l-sky-400 bg-sky-50/50 dark:bg-sky-50/5',
    sand: 'border-l-sand-700 bg-sand-50/50 dark:bg-sand-50/5',
  };

  const iconColors = {
    forest: 'text-forest-600 dark:text-forest-500',
    sky: 'text-sky-600 dark:text-sky-400',
    sand: 'text-sand-700',
  };

  return (
    <div className={`rounded-xl border border-border border-l-4 p-5 ${accentColors[accent]}`}>
      <div className="flex items-center gap-3">
        <div className={iconColors[accent]}>
          <Icon name={icon} size={20} />
        </div>
        <p className="text-sm font-medium text-ink-muted">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function CityRow({ city }: { city: CityWithOrgStats }) {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-forest-500/50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest-50 dark:bg-forest-50/10">
          <Icon name="city" size={20} className="text-forest-600 dark:text-forest-500" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{city.name}</p>
          <p className="text-sm text-ink-muted">
            {city.actionCount} action{city.actionCount !== 1 ? 's' : ''} · {formatNumber(city.totalAnnualReduction)} t CO2e/yr
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:shrink-0">
        <OnTrackBadge status={city.onTrackStatus} />
        <Link
          href="/admin/settings"
          className="btn-secondary text-sm px-3 py-1.5"
        >
          Manage
        </Link>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 1 });
}
