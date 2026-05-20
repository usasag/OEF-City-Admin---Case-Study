import { describe, it, expect } from 'vitest';
import { defaultChartTheme, createBaseLayout } from './chart-config';

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

  it('has transparent background', () => {
    expect(defaultChartTheme.backgroundColor).toBe('transparent');
  });

  it('defines on-track, off-track, and indeterminate colors', () => {
    expect(defaultChartTheme.onTrackColor).toBeTruthy();
    expect(defaultChartTheme.offTrackColor).toBeTruthy();
    expect(defaultChartTheme.indeterminateColor).toBeTruthy();
  });
});

describe('createBaseLayout', () => {
  it('returns a layout with the given title', () => {
    const layout = createBaseLayout('Test Chart');
    expect(layout.title).toEqual({
      text: 'Test Chart',
      font: { family: defaultChartTheme.fontFamily, size: 16 },
    });
  });

  it('applies the default theme font', () => {
    const layout = createBaseLayout('Chart');
    expect(layout.font?.family).toBe(defaultChartTheme.fontFamily);
  });

  it('sets autosize to true for responsive behavior', () => {
    const layout = createBaseLayout('Chart');
    expect(layout.autosize).toBe(true);
  });

  it('applies transparent background from default theme', () => {
    const layout = createBaseLayout('Chart');
    expect(layout.paper_bgcolor).toBe('transparent');
    expect(layout.plot_bgcolor).toBe('transparent');
  });

  it('sets grid color on axes', () => {
    const layout = createBaseLayout('Chart');
    expect(layout.xaxis?.gridcolor).toBe(defaultChartTheme.gridColor);
    expect(layout.yaxis?.gridcolor).toBe(defaultChartTheme.gridColor);
  });

  it('accepts a custom theme', () => {
    const customTheme = {
      ...defaultChartTheme,
      backgroundColor: '#ffffff',
      fontFamily: 'Roboto, sans-serif',
    };
    const layout = createBaseLayout('Custom', customTheme);
    expect(layout.paper_bgcolor).toBe('#ffffff');
    expect(layout.font?.family).toBe('Roboto, sans-serif');
  });
});
