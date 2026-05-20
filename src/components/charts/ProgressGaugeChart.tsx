'use client';

import Plot from '@/components/charts/ChartWrapper';
import { defaultChartTheme } from '@/lib/charts/chart-config';
import type { ProgressGaugeChartProps } from '@/types/charts';

export default function ProgressGaugeChart({ percentReduced, onTrackStatus }: ProgressGaugeChartProps) {
  const color = onTrackStatus === 'on_track'
    ? defaultChartTheme.onTrackColor
    : onTrackStatus === 'off_track'
      ? defaultChartTheme.offTrackColor
      : defaultChartTheme.indeterminateColor;

  const maxRange = Math.max(100, percentReduced);

  const data: Plotly.Data[] = [{
    type: 'indicator',
    mode: 'gauge+number',
    value: percentReduced,
    gauge: {
      axis: { range: [0, maxRange] },
      bar: { color },
      steps: [
        { range: [0, maxRange * 0.5], color: '#FEE2E2' },
        { range: [maxRange * 0.5, maxRange * 0.75], color: '#FEF3C7' },
        { range: [maxRange * 0.75, maxRange], color: '#D1FAE5' },
      ],
    },
    number: { suffix: '%', font: { size: 24 } },
  } as Plotly.Data];

  const layout: Partial<Plotly.Layout> = {
    title: { text: 'Progress: % of Baseline Reduced', font: { family: defaultChartTheme.fontFamily, size: 16 } },
    font: { family: defaultChartTheme.fontFamily },
    paper_bgcolor: 'transparent',
    autosize: true,
    margin: { l: 30, r: 30, t: 50, b: 20 },
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Plot
        data={data}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%', height: '300px' }}
      />
    </div>
  );
}
