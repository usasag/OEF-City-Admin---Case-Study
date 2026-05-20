import type { ProjectionDataPoint } from '@/types/charts';
import type { ClimateAction, Sector } from '@/types';
import { defaultChartTheme, type ChartTheme } from './chart-config';

/**
 * Transforms ProjectionDataPoint[] into Plotly trace data for the emissions projection chart.
 * Returns three traces: projected, baseline, and linear target.
 */
export function toProjectionTraces(projections: ProjectionDataPoint[]): Plotly.Data[] {
  const years = projections.map(p => p.year);

  return [
    {
      x: years,
      y: projections.map(p => p.projectedEmissions),
      type: 'scatter',
      mode: 'lines',
      name: 'Projected Emissions',
      line: { color: '#3B82F6', width: 3 },
    },
    {
      x: years,
      y: projections.map(p => p.baselineEmissions),
      type: 'scatter',
      mode: 'lines',
      name: 'Baseline',
      line: { color: '#9CA3AF', width: 2, dash: 'dash' },
    },
    {
      x: years,
      y: projections.map(p => p.linearTarget),
      type: 'scatter',
      mode: 'lines',
      name: 'Linear Target',
      line: { color: '#10B981', width: 2, dash: 'dot' },
    },
  ];
}

/**
 * Transforms sector breakdown record into Plotly pie/donut trace data.
 * Filters out sectors with zero reduction.
 */
export function toSectorPieTrace(
  sectorData: Record<Sector, number>,
  theme: ChartTheme = defaultChartTheme
): Plotly.Data {
  const entries = Object.entries(sectorData).filter(([_, value]) => value > 0);

  return {
    labels: entries.map(([sector]) => sector.replace('_', ' ')),
    values: entries.map(([_, value]) => value),
    type: 'pie',
    hole: 0.4,
    marker: {
      colors: entries.map(([sector]) => theme.colorPalette[sector as Sector]),
    },
    textinfo: 'label+percent',
    hoverinfo: 'label+value+percent',
  };
}

/**
 * Transforms climate actions into grouped bar chart traces by sector.
 * Groups actions by start_year and creates one trace per sector.
 */
export function toReductionBarTraces(
  actions: ClimateAction[],
  theme: ChartTheme = defaultChartTheme
): Plotly.Data[] {
  const sectors = [...new Set(actions.map(a => a.sector))];

  return sectors.map(sector => {
    const sectorActions = actions.filter(a => a.sector === sector);
    const years = [...new Set(sectorActions.map(a => a.startYear))].sort();

    return {
      x: years,
      y: years.map(year =>
        sectorActions
          .filter(a => a.startYear === year)
          .reduce((sum, a) => sum + a.annualReduction, 0)
      ),
      type: 'bar',
      name: sector.replace('_', ' '),
      marker: { color: theme.colorPalette[sector] },
    };
  });
}
