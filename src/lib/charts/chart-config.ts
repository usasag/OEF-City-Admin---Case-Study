import type { Sector } from '@/types';

// ─── Sector Palette (light + dark variants) ──────────────────────────────────

export const sectorPalette: Record<Sector, { light: string; dark: string }> = {
  transport:  { light: '#0284c7', dark: '#38bdf8' }, // sky
  energy:     { light: '#d97706', dark: '#f59e0b' }, // amber/sand
  buildings:  { light: '#7c3aed', dark: '#a78bfa' }, // violet
  waste:      { light: '#dc2626', dark: '#f87171' }, // danger-aligned
  land_use:   { light: '#16a34a', dark: '#22c55e' }, // forest
};

// ─── Chart Theme Interface ───────────────────────────────────────────────────

export interface ChartTheme {
  mode: 'light' | 'dark';
  sectorColors: Record<Sector, string>;
  fontFamily: string;
  paperBg: string;
  plotBg: string;
  gridColor: string;
  fontColor: string;
  onTrackColor: string;
  offTrackColor: string;
  indeterminateColor: string;
}

// Legacy interface kept for backward compatibility with chart-data-transforms
export interface LegacyChartTheme {
  colorPalette: Record<Sector, string>;
  fontFamily: string;
  backgroundColor: string;
  gridColor: string;
  onTrackColor: string;
  offTrackColor: string;
  indeterminateColor: string;
}

// ─── getChartTheme ───────────────────────────────────────────────────────────

/**
 * Returns a ChartTheme object with mode-appropriate colors.
 * Light mode: white backgrounds, dark text, light grid lines.
 * Dark mode: dark backgrounds, light text, subtle grid lines.
 */
export function getChartTheme(mode: 'light' | 'dark'): ChartTheme {
  const sectorColors = Object.fromEntries(
    Object.entries(sectorPalette).map(([sector, colors]) => [sector, colors[mode]])
  ) as Record<Sector, string>;

  if (mode === 'dark') {
    return {
      mode,
      sectorColors,
      fontFamily: 'Inter, system-ui, sans-serif',
      paperBg: '#11201a',
      plotBg: '#11201a',
      gridColor: '#22382d',
      fontColor: '#f0fdf4',
      onTrackColor: '#22c55e',
      offTrackColor: '#f87171',
      indeterminateColor: '#9CA3AF',
    };
  }

  return {
    mode,
    sectorColors,
    fontFamily: 'Inter, system-ui, sans-serif',
    paperBg: '#ffffff',
    plotBg: '#ffffff',
    gridColor: '#dbeadb',
    fontColor: '#0f1f17',
    onTrackColor: '#16a34a',
    offTrackColor: '#dc2626',
    indeterminateColor: '#9CA3AF',
  };
}

// ─── Legacy defaultChartTheme (for backward compat with data transforms) ─────

export const defaultChartTheme: LegacyChartTheme = {
  colorPalette: Object.fromEntries(
    Object.entries(sectorPalette).map(([sector, colors]) => [sector, colors.light])
  ) as Record<Sector, string>,
  fontFamily: 'Inter, system-ui, sans-serif',
  backgroundColor: '#ffffff',
  gridColor: '#dbeadb',
  onTrackColor: '#16a34a',
  offTrackColor: '#dc2626',
  indeterminateColor: '#9CA3AF',
};

// ─── createBaseLayout ────────────────────────────────────────────────────────

/**
 * Generates a Plotly Layout object with consistent theming.
 * Accepts a mode parameter to emit theme-appropriate colors.
 */
export function createBaseLayout(
  title: string,
  mode: 'light' | 'dark' = 'light'
): Partial<Plotly.Layout> {
  const theme = getChartTheme(mode);

  return {
    title: { text: title, font: { family: theme.fontFamily, size: 16, color: theme.fontColor } as Record<string, unknown> },
    font: { family: theme.fontFamily, color: theme.fontColor },
    paper_bgcolor: theme.paperBg,
    plot_bgcolor: theme.plotBg,
    autosize: true,
    margin: { l: 50, r: 30, t: 50, b: 50 },
    xaxis: { gridcolor: theme.gridColor, color: theme.fontColor },
    yaxis: { gridcolor: theme.gridColor, color: theme.fontColor },
  };
}
