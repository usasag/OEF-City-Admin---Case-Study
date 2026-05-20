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
    return <p className="text-gray-500">No sector data available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeSectors.map(([sector, reduction]) => (
        <div key={sector} className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{SECTOR_LABELS[sector]}</p>
          <p className="text-xl font-semibold mt-1">
            {reduction.toLocaleString()} t CO2e/yr
          </p>
        </div>
      ))}
    </div>
  );
}
