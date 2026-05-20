'use client';

import Plot from '@/components/charts/ChartWrapper';
import { toProjectionTraces } from '@/lib/charts/chart-data-transforms';
import { createBaseLayout } from '@/lib/charts/chart-config';
import type { EmissionsProjectionChartProps } from '@/types/charts';

export default function EmissionsProjectionChart({ projections, cityName, targetYear }: EmissionsProjectionChartProps) {
  if (projections.length === 0) {
    return <div className="p-4 text-gray-500">No projection data available</div>;
  }

  const traces = toProjectionTraces(projections);
  const layout = {
    ...createBaseLayout(`${cityName} Emissions Projection`),
    xaxis: { title: 'Year', gridcolor: '#E5E7EB' },
    yaxis: { title: 'Emissions (tonnes CO2e)', gridcolor: '#E5E7EB' },
    showlegend: true,
  };

  return (
    <div className="w-full">
      <Plot
        data={traces}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%', height: '400px' }}
      />
    </div>
  );
}
