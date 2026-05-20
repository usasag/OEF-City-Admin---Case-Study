'use client';

import Plot from '@/components/charts/ChartWrapper';
import { toProjectionTraces } from '@/lib/charts/chart-data-transforms';
import { createBaseLayout } from '@/lib/charts/chart-config';
import { ChartControlTips } from './ChartControlTips';
import { useTheme } from '@/components/ui/ThemeProvider';
import type { EmissionsProjectionChartProps } from '@/types/charts';

export default function EmissionsProjectionChart({ projections, cityName }: EmissionsProjectionChartProps) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme;

  if (projections.length === 0) {
    return <div className="p-4 text-ink-faint">No projection data available</div>;
  }

  const traces = toProjectionTraces(projections, mode);
  const layout = {
    ...createBaseLayout(`${cityName} Emissions Projection`, mode),
    xaxis: {
      ...createBaseLayout('', mode).xaxis,
      title: 'Year',
    },
    yaxis: {
      ...createBaseLayout('', mode).yaxis,
      title: 'Emissions (tonnes CO2e)',
    },
    showlegend: true,
  };

  return (
    <div className="w-full">
      <Plot
        data={traces}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%', height: '380px' }}
      />
      <ChartControlTips />
    </div>
  );
}
