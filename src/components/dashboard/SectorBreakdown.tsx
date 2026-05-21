import type { Sector } from '@/types';

interface SectorBreakdownProps {
  sectorData: Record<Sector, number>;
}

const SECTOR_LABELS: Record<Sector, string> = {
  transport: 'Transport',
  energy: 'Energy',
  buildings: 'Buildings',
  waste: 'Waste',
  land_use: 'Land Use',
};

export default function SectorBreakdown({ sectorData }: SectorBreakdownProps) {
  const activeSectors = (Object.entries(sectorData) as [Sector, number][]).filter(
    ([, value]) => value > 0
  );

  if (activeSectors.length === 0) {
    return <p className="text-ink-faint">No sector data available.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {activeSectors.map(([sector, reduction]) => (
        <div key={sector} className="card">
          <p className="text-sm font-medium text-ink-muted">{SECTOR_LABELS[sector]}</p>
          <p className="mt-1 text-xl font-semibold text-forest-700 dark:text-forest-500">
            {reduction.toLocaleString()} <span className="text-sm font-normal text-ink-faint">t CO2e/yr</span>
          </p>
        </div>
      ))}
    </div>
  );
}
