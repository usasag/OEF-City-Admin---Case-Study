'use client';

import Plot from '@/components/charts/ChartWrapper';
import { toSectorPieTrace } from '@/lib/charts/chart-data-transforms';
import { createBaseLayout, getChartTheme } from '@/lib/charts/chart-config';
import { ChartControlTips } from './ChartControlTips';
import { useTheme } from '@/components/ui/ThemeProvider';
import type { SectorBreakdownChartProps } from '@/types/charts';

export default function SectorBreakdownChart({ sectorData, totalReduction }: SectorBreakdownChartProps) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme;
  const chartTheme = getChartTheme(mode);

  if (totalReduction === 0) {
    return <div className="p-4 text-ink-faint">No sector data available</div>;
  }

  const trace = toSectorPieTrace(sectorData, chartTheme);
  const layout = {
    ...createBaseLayout('Reductions by Sector', mode),
    showlegend: true,
  };

  return (
    <div className="w-full">
      <Plot
        data={[trace]}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%', height: '380px' }}
      />
      <ChartControlTips />
    </div>
  );
}
