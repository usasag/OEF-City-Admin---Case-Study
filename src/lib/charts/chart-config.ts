import type { Sector } from '@/types';

export interface ChartTheme {
  colorPalette: Record<Sector, string>;
  fontFamily: string;
  backgroundColor: string;
  gridColor: string;
  onTrackColor: string;
  offTrackColor: string;
  indeterminateColor: string;
}

export const defaultChartTheme: ChartTheme = {
  colorPalette: {
    transport: '#3B82F6',    // Blue
    energy: '#F59E0B',       // Amber
    buildings: '#8B5CF6',    // Purple
    waste: '#EF4444',        // Red
    land_use: '#10B981',     // Emerald
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  backgroundColor: 'transparent',
  gridColor: '#E5E7EB',
  onTrackColor: '#10B981',
  offTrackColor: '#EF4444',
  indeterminateColor: '#9CA3AF',
};

/**
 * Generates a Plotly Layout object with consistent theming.
 * Applies responsive sizing, font, and color settings.
 */
export function createBaseLayout(
  title: string,
  theme: ChartTheme = defaultChartTheme
): Partial<Plotly.Layout> {
  return {
    title: { text: title, font: { family: theme.fontFamily, size: 16 } },
    font: { family: theme.fontFamily },
    paper_bgcolor: theme.backgroundColor,
    plot_bgcolor: theme.backgroundColor,
    autosize: true,
    margin: { l: 50, r: 30, t: 50, b: 50 },
    xaxis: { gridcolor: theme.gridColor },
    yaxis: { gridcolor: theme.gridColor },
  };
}
