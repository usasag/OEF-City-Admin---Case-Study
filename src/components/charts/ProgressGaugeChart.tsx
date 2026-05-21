'use client';

import Plot from '@/components/charts/ChartWrapper';
import { getChartTheme } from '@/lib/charts/chart-config';
import { useTheme } from '@/components/ui/ThemeProvider';
import type { ProgressGaugeChartProps } from '@/types/charts';

export default function ProgressGaugeChart({ percentReduced, onTrackStatus }: ProgressGaugeChartProps) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme;
  const chartTheme = getChartTheme(mode);

  const color = onTrackStatus === 'on_track'
    ? chartTheme.onTrackColor
    : onTrackStatus === 'off_track'
      ? chartTheme.offTrackColor
      : chartTheme.indeterminateColor;

  const maxRange = Math.max(100, percentReduced);

  const data: Plotly.Data[] = [{
    type: 'indicator',
    mode: 'gauge+number',
    value: percentReduced,
    gauge: {
      axis: { range: [0, maxRange] },
      bar: { color },
      steps: [
        { range: [0, maxRange * 0.5], color: mode === 'dark' ? '#3b1111' : '#FEE2E2' },
        { range: [maxRange * 0.5, maxRange * 0.75], color: mode === 'dark' ? '#3b2e11' : '#FEF3C7' },
        { range: [maxRange * 0.75, maxRange], color: mode === 'dark' ? '#113b2e' : '#D1FAE5' },
      ],
    },
    number: { suffix: '%', font: { size: 24, color: chartTheme.fontColor } },
  } as Plotly.Data];

  const layout: Partial<Plotly.Layout> = {
    title: { text: 'Progress: % of Baseline Reduced', font: { family: chartTheme.fontFamily, size: 16, color: chartTheme.fontColor } as Record<string, unknown> },
    font: { family: chartTheme.fontFamily, color: chartTheme.fontColor },
    paper_bgcolor: chartTheme.paperBg,
    autosize: true,
    margin: { l: 30, r: 30, t: 50, b: 20 },
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Plot
        data={data}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%', height: '280px' }}
      />
    </div>
  );
}
