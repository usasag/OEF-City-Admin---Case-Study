'use client';

import Plot from '@/components/charts/ChartWrapper';
import { toReductionBarTraces } from '@/lib/charts/chart-data-transforms';
import { createBaseLayout, getChartTheme } from '@/lib/charts/chart-config';
import { ChartControlTips } from './ChartControlTips';
import { useTheme } from '@/components/ui/ThemeProvider';
import type { AnnualReductionBarChartProps } from '@/types/charts';

export default function AnnualReductionBarChart({ actions }: AnnualReductionBarChartProps) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme;
  const chartTheme = getChartTheme(mode);

  if (actions.length === 0) {
    return <div className="p-4 text-ink-faint">No action data available</div>;
  }

  const traces = toReductionBarTraces(actions, chartTheme);
  const layout = {
    ...createBaseLayout('Annual Reductions by Year & Sector', mode),
    barmode: 'group' as const,
    xaxis: {
      ...createBaseLayout('', mode).xaxis,
      title: 'Start Year',
    },
    yaxis: {
      ...createBaseLayout('', mode).yaxis,
      title: 'Annual Reduction (tonnes CO2e)',
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
