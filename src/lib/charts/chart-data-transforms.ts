import type { ProjectionDataPoint } from '@/types/charts';
import type { ClimateAction, Sector } from '@/types';
import { getChartTheme, type ChartTheme, type LegacyChartTheme, defaultChartTheme } from './chart-config';

/**
 * Transforms ProjectionDataPoint[] into Plotly trace data for the emissions projection chart.
 * Returns three traces: projected, baseline, and linear target.
 */
export function toProjectionTraces(
  projections: ProjectionDataPoint[],
  mode: 'light' | 'dark' = 'light'
): Plotly.Data[] {
  const years = projections.map(p => p.year);
  const theme = getChartTheme(mode);

  return [
    {
      x: years,
      y: projections.map(p => p.projectedEmissions),
      type: 'scatter',
      mode: 'lines',
      name: 'Projected Emissions',
      line: { color: theme.sectorColors.transport, width: 3 },
    },
    {
      x: years,
      y: projections.map(p => p.baselineEmissions),
      type: 'scatter',
      mode: 'lines',
      name: 'Baseline',
      line: { color: theme.indeterminateColor, width: 2, dash: 'dash' },
    },
    {
      x: years,
      y: projections.map(p => p.linearTarget),
      type: 'scatter',
      mode: 'lines',
      name: 'Linear Target',
      line: { color: theme.onTrackColor, width: 2, dash: 'dot' },
    },
  ];
}

/**
 * Transforms sector breakdown record into Plotly pie/donut trace data.
 * Filters out sectors with zero reduction.
 */
export function toSectorPieTrace(
  sectorData: Record<Sector, number>,
  themeOrLegacy?: ChartTheme | LegacyChartTheme
): Plotly.Data {
  const entries = Object.entries(sectorData).filter(([_, value]) => value > 0);

  // Resolve sector colors from either new ChartTheme or legacy
  let sectorColors: Record<Sector, string>;
  if (themeOrLegacy && 'sectorColors' in themeOrLegacy) {
    sectorColors = themeOrLegacy.sectorColors;
  } else if (themeOrLegacy && 'colorPalette' in themeOrLegacy) {
    sectorColors = themeOrLegacy.colorPalette;
  } else {
    sectorColors = defaultChartTheme.colorPalette;
  }

  return {
    labels: entries.map(([sector]) => sector.replace('_', ' ')),
    values: entries.map(([_, value]) => value),
    type: 'pie',
    hole: 0.4,
    marker: {
      colors: entries.map(([sector]) => sectorColors[sector as Sector]),
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
  themeOrLegacy?: ChartTheme | LegacyChartTheme
): Plotly.Data[] {
  const sectors = [...new Set(actions.map(a => a.sector))];

  // Resolve sector colors from either new ChartTheme or legacy
  let sectorColors: Record<Sector, string>;
  if (themeOrLegacy && 'sectorColors' in themeOrLegacy) {
    sectorColors = themeOrLegacy.sectorColors;
  } else if (themeOrLegacy && 'colorPalette' in themeOrLegacy) {
    sectorColors = themeOrLegacy.colorPalette;
  } else {
    sectorColors = defaultChartTheme.colorPalette;
  }

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
      marker: { color: sectorColors[sector] },
    };
  });
}
