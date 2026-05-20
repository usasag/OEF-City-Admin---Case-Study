import { describe, it, expect } from 'vitest';
import { defaultChartTheme, createBaseLayout, getChartTheme, sectorPalette } from './chart-config';

describe('defaultChartTheme', () => {
  it('defines colors for all five sectors', () => {
    expect(defaultChartTheme.colorPalette).toHaveProperty('transport');
    expect(defaultChartTheme.colorPalette).toHaveProperty('energy');
    expect(defaultChartTheme.colorPalette).toHaveProperty('buildings');
    expect(defaultChartTheme.colorPalette).toHaveProperty('waste');
    expect(defaultChartTheme.colorPalette).toHaveProperty('land_use');
  });

  it('has a font family defined', () => {
    expect(defaultChartTheme.fontFamily).toContain('Inter');
  });

  it('uses light mode sector colors by default', () => {
    expect(defaultChartTheme.colorPalette.transport).toBe(sectorPalette.transport.light);
    expect(defaultChartTheme.colorPalette.energy).toBe(sectorPalette.energy.light);
  });

  it('defines on-track, off-track, and indeterminate colors', () => {
    expect(defaultChartTheme.onTrackColor).toBeTruthy();
    expect(defaultChartTheme.offTrackColor).toBeTruthy();
    expect(defaultChartTheme.indeterminateColor).toBeTruthy();
  });
});

describe('sectorPalette', () => {
  it('defines light and dark variants for all sectors', () => {
    const sectors = ['transport', 'energy', 'buildings', 'waste', 'land_use'] as const;
    sectors.forEach(sector => {
      expect(sectorPalette[sector].light).toBeTruthy();
      expect(sectorPalette[sector].dark).toBeTruthy();
      expect(sectorPalette[sector].light).not.toBe(sectorPalette[sector].dark);
    });
  });
});

describe('getChartTheme', () => {
  it('returns light theme with white backgrounds', () => {
    const theme = getChartTheme('light');
    expect(theme.mode).toBe('light');
    expect(theme.paperBg).toBe('#ffffff');
    expect(theme.plotBg).toBe('#ffffff');
    expect(theme.fontColor).toBe('#0f1f17');
    expect(theme.gridColor).toBe('#dbeadb');
  });

  it('returns dark theme with dark backgrounds', () => {
    const theme = getChartTheme('dark');
    expect(theme.mode).toBe('dark');
    expect(theme.paperBg).toBe('#11201a');
    expect(theme.plotBg).toBe('#11201a');
    expect(theme.fontColor).toBe('#f0fdf4');
    expect(theme.gridColor).toBe('#22382d');
  });

  it('uses light sector colors in light mode', () => {
    const theme = getChartTheme('light');
    expect(theme.sectorColors.transport).toBe(sectorPalette.transport.light);
    expect(theme.sectorColors.energy).toBe(sectorPalette.energy.light);
    expect(theme.sectorColors.buildings).toBe(sectorPalette.buildings.light);
    expect(theme.sectorColors.waste).toBe(sectorPalette.waste.light);
    expect(theme.sectorColors.land_use).toBe(sectorPalette.land_use.light);
  });

  it('uses dark sector colors in dark mode', () => {
    const theme = getChartTheme('dark');
    expect(theme.sectorColors.transport).toBe(sectorPalette.transport.dark);
    expect(theme.sectorColors.energy).toBe(sectorPalette.energy.dark);
    expect(theme.sectorColors.buildings).toBe(sectorPalette.buildings.dark);
    expect(theme.sectorColors.waste).toBe(sectorPalette.waste.dark);
    expect(theme.sectorColors.land_use).toBe(sectorPalette.land_use.dark);
  });

  it('defines font family as Inter', () => {
    const theme = getChartTheme('light');
    expect(theme.fontFamily).toContain('Inter');
  });

  it('defines on-track, off-track, and indeterminate colors', () => {
    const lightTheme = getChartTheme('light');
    const darkTheme = getChartTheme('dark');
    expect(lightTheme.onTrackColor).toBeTruthy();
    expect(lightTheme.offTrackColor).toBeTruthy();
    expect(lightTheme.indeterminateColor).toBeTruthy();
    expect(darkTheme.onTrackColor).toBeTruthy();
    expect(darkTheme.offTrackColor).toBeTruthy();
    expect(darkTheme.indeterminateColor).toBeTruthy();
  });
});

describe('createBaseLayout', () => {
  it('returns a layout with the given title', () => {
    const layout = createBaseLayout('Test Chart');
    expect(layout.title).toEqual({
      text: 'Test Chart',
      font: { family: 'Inter, system-ui, sans-serif', size: 16, color: '#0f1f17' },
    });
  });

  it('applies the theme font', () => {
    const layout = createBaseLayout('Chart');
    expect(layout.font?.family).toBe('Inter, system-ui, sans-serif');
  });

  it('sets autosize to true for responsive behavior', () => {
    const layout = createBaseLayout('Chart');
    expect(layout.autosize).toBe(true);
  });

  it('applies light mode colors by default', () => {
    const layout = createBaseLayout('Chart');
    expect(layout.paper_bgcolor).toBe('#ffffff');
    expect(layout.plot_bgcolor).toBe('#ffffff');
  });

  it('applies dark mode colors when mode is dark', () => {
    const layout = createBaseLayout('Chart', 'dark');
    expect(layout.paper_bgcolor).toBe('#11201a');
    expect(layout.plot_bgcolor).toBe('#11201a');
    expect(layout.font?.color).toBe('#f0fdf4');
  });

  it('sets grid color on axes for light mode', () => {
    const layout = createBaseLayout('Chart', 'light');
    expect(layout.xaxis?.gridcolor).toBe('#dbeadb');
    expect(layout.yaxis?.gridcolor).toBe('#dbeadb');
  });

  it('sets grid color on axes for dark mode', () => {
    const layout = createBaseLayout('Chart', 'dark');
    expect(layout.xaxis?.gridcolor).toBe('#22382d');
    expect(layout.yaxis?.gridcolor).toBe('#22382d');
  });
});
