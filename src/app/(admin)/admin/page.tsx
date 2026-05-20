import Link from 'next/link';
import { requireAuth } from '@/lib/auth/permissions';
import { supabase } from '@/lib/db/supabase';
import { getCitiesByOrgIdWithStats, type CityWithOrgStats } from '@/lib/db/queries/cities';
import { EmptyState } from '@/components/admin/EmptyState';
import OnTrackBadge from '@/components/dashboard/OnTrackBadge';

export default async function AdminHomePage() {
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
      <h1 className="text-h1">Organization Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Cities" value={totalCities.toString()} />
        <KpiCard label="Total Actions" value={totalActionCount.toString()} />
        <KpiCard
          label="Total Reduction"
          value={`${formatNumber(totalAnnualReduction)} t CO2e`}
        />
      </div>

      {/* City list */}
      <div className="space-y-3">
        <h2 className="text-h2">Cities</h2>
        <div className="space-y-2">
          {cities.map((city) => (
            <CityRow key={city.id} city={city} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-small text-ink-muted mb-1">{label}</p>
      <p className="text-h2 font-bold">{value}</p>
    </div>
  );
}

function CityRow({ city }: { city: CityWithOrgStats }) {
  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-body truncate">{city.name}</p>
        <p className="text-small text-ink-muted">
          {city.actionCount} action{city.actionCount !== 1 ? 's' : ''} · {formatNumber(city.totalAnnualReduction)} t CO2e/yr
        </p>
      </div>
      <div className="flex items-center gap-3">
        <OnTrackBadge status={city.onTrackStatus} />
        <Link
          href="/admin/settings"
          className="btn-secondary text-small"
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
