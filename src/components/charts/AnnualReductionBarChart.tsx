'use client';

import Plot from '@/components/charts/ChartWrapper';
import { toReductionBarTraces } from '@/lib/charts/chart-data-transforms';
import { createBaseLayout } from '@/lib/charts/chart-config';
import type { AnnualReductionBarChartProps } from '@/types/charts';

export default function AnnualReductionBarChart({ actions }: AnnualReductionBarChartProps) {
  if (actions.length === 0) {
    return <div className="p-4 text-gray-500">No action data available</div>;
  }

  const traces = toReductionBarTraces(actions);
  const layout = {
    ...createBaseLayout('Annual Reductions by Year & Sector'),
    barmode: 'group' as const,
    xaxis: { title: 'Start Year', gridcolor: '#E5E7EB' },
    yaxis: { title: 'Annual Reduction (tonnes CO2e)', gridcolor: '#E5E7EB' },
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
