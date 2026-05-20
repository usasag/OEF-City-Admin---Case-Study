'use client';

import Plot from '@/components/charts/ChartWrapper';
import { toSectorPieTrace } from '@/lib/charts/chart-data-transforms';
import { createBaseLayout } from '@/lib/charts/chart-config';
import type { SectorBreakdownChartProps } from '@/types/charts';

export default function SectorBreakdownChart({ sectorData, totalReduction }: SectorBreakdownChartProps) {
  if (totalReduction === 0) {
    return <div className="p-4 text-gray-500">No sector data available</div>;
  }

  const trace = toSectorPieTrace(sectorData);
  const layout = {
    ...createBaseLayout('Reductions by Sector'),
    showlegend: true,
  };

  return (
    <div className="w-full">
      <Plot
        data={[trace]}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%', height: '400px' }}
      />
    </div>
  );
}
