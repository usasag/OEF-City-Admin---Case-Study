import { describe, it, expect } from 'vitest';
import { toProjectionTraces, toSectorPieTrace, toReductionBarTraces } from './chart-data-transforms';
import { defaultChartTheme, getChartTheme } from './chart-config';
import type { ProjectionDataPoint } from '@/types/charts';
import type { ClimateAction, Sector } from '@/types';

describe('toProjectionTraces', () => {
  const projections: ProjectionDataPoint[] = [
    { year: 2024, projectedEmissions: 900, baselineEmissions: 1000, linearTarget: 1000 },
    { year: 2025, projectedEmissions: 800, baselineEmissions: 1000, linearTarget: 800 },
    { year: 2026, projectedEmissions: 700, baselineEmissions: 1000, linearTarget: 600 },
  ];

  it('returns exactly three traces', () => {
    const traces = toProjectionTraces(projections);
    expect(traces).toHaveLength(3);
  });

  it('first trace is projected emissions', () => {
    const traces = toProjectionTraces(projections);
    expect(traces[0].name).toBe('Projected Emissions');
    expect(traces[0].y).toEqual([900, 800, 700]);
  });

  it('second trace is baseline', () => {
    const traces = toProjectionTraces(projections);
    expect(traces[1].name).toBe('Baseline');
    expect(traces[1].y).toEqual([1000, 1000, 1000]);
    expect(traces[1].line?.dash).toBe('dash');
  });

  it('third trace is linear target', () => {
    const traces = toProjectionTraces(projections);
    expect(traces[2].name).toBe('Linear Target');
    expect(traces[2].y).toEqual([1000, 800, 600]);
    expect(traces[2].line?.dash).toBe('dot');
  });

  it('all traces share the same x-axis (years)', () => {
    const traces = toProjectionTraces(projections);
    const expectedYears = [2024, 2025, 2026];
    traces.forEach(trace => {
      expect(trace.x).toEqual(expectedYears);
    });
  });

  it('handles empty projections array', () => {
    const traces = toProjectionTraces([]);
    expect(traces).toHaveLength(3);
    traces.forEach(trace => {
      expect(trace.x).toEqual([]);
      expect(trace.y).toEqual([]);
    });
  });

  it('uses light mode colors by default', () => {
    const traces = toProjectionTraces(projections);
    const lightTheme = getChartTheme('light');
    expect(traces[0].line?.color).toBe(lightTheme.sectorColors.transport);
    expect(traces[2].line?.color).toBe(lightTheme.onTrackColor);
  });

  it('uses dark mode colors when mode is dark', () => {
    const traces = toProjectionTraces(projections, 'dark');
    const darkTheme = getChartTheme('dark');
    expect(traces[0].line?.color).toBe(darkTheme.sectorColors.transport);
    expect(traces[2].line?.color).toBe(darkTheme.onTrackColor);
  });
});

describe('toSectorPieTrace', () => {
  it('filters out sectors with zero reduction', () => {
    const sectorData: Record<Sector, number> = {
      transport: 100,
      energy: 200,
      buildings: 0,
      waste: 0,
      land_use: 50,
    };
    const trace = toSectorPieTrace(sectorData);
    expect(trace.labels).toHaveLength(3);
    expect(trace.values).toHaveLength(3);
    expect(trace.labels).not.toContain('buildings');
    expect(trace.labels).not.toContain('waste');
  });

  it('creates a donut chart (hole > 0)', () => {
    const sectorData: Record<Sector, number> = {
      transport: 100,
      energy: 0,
      buildings: 0,
      waste: 0,
      land_use: 0,
    };
    const trace = toSectorPieTrace(sectorData);
    expect(trace.hole).toBe(0.4);
    expect(trace.type).toBe('pie');
  });

  it('applies sector colors from legacy theme', () => {
    const sectorData: Record<Sector, number> = {
      transport: 100,
      energy: 200,
      buildings: 0,
      waste: 0,
      land_use: 0,
    };
    const trace = toSectorPieTrace(sectorData, defaultChartTheme);
    expect(trace.marker?.colors).toContain(defaultChartTheme.colorPalette.transport);
    expect(trace.marker?.colors).toContain(defaultChartTheme.colorPalette.energy);
  });

  it('applies sector colors from new ChartTheme', () => {
    const sectorData: Record<Sector, number> = {
      transport: 100,
      energy: 200,
      buildings: 0,
      waste: 0,
      land_use: 0,
    };
    const darkTheme = getChartTheme('dark');
    const trace = toSectorPieTrace(sectorData, darkTheme);
    expect(trace.marker?.colors).toContain(darkTheme.sectorColors.transport);
    expect(trace.marker?.colors).toContain(darkTheme.sectorColors.energy);
  });

  it('replaces underscores with spaces in labels', () => {
    const sectorData: Record<Sector, number> = {
      transport: 0,
      energy: 0,
      buildings: 0,
      waste: 0,
      land_use: 50,
    };
    const trace = toSectorPieTrace(sectorData);
    expect(trace.labels).toContain('land use');
  });

  it('returns empty arrays when all sectors are zero', () => {
    const sectorData: Record<Sector, number> = {
      transport: 0,
      energy: 0,
      buildings: 0,
      waste: 0,
      land_use: 0,
    };
    const trace = toSectorPieTrace(sectorData);
    expect(trace.labels).toHaveLength(0);
    expect(trace.values).toHaveLength(0);
  });
});

describe('toReductionBarTraces', () => {
  const makeAction = (overrides: Partial<ClimateAction>): ClimateAction => ({
    id: '1',
    organizationId: 'org-1',
    cityId: 'city-1',
    title: 'Test Action',
    sector: 'transport',
    annualReduction: 100,
    status: 'planned',
    startYear: 2024,
    sourceText: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    ...overrides,
  });

  it('creates one trace per unique sector', () => {
    const actions = [
      makeAction({ sector: 'transport', startYear: 2024 }),
      makeAction({ sector: 'energy', startYear: 2024 }),
      makeAction({ sector: 'transport', startYear: 2025 }),
    ];
    const traces = toReductionBarTraces(actions);
    expect(traces).toHaveLength(2);
    expect(traces.map(t => t.name)).toContain('transport');
    expect(traces.map(t => t.name)).toContain('energy');
  });

  it('sums reductions for same sector and year', () => {
    const actions = [
      makeAction({ sector: 'transport', startYear: 2024, annualReduction: 50 }),
      makeAction({ sector: 'transport', startYear: 2024, annualReduction: 75 }),
    ];
    const traces = toReductionBarTraces(actions);
    expect(traces).toHaveLength(1);
    expect(traces[0].y).toEqual([125]);
  });

  it('applies sector colors from legacy theme', () => {
    const actions = [makeAction({ sector: 'energy' })];
    const traces = toReductionBarTraces(actions, defaultChartTheme);
    expect(traces[0].marker?.color).toBe(defaultChartTheme.colorPalette.energy);
  });

  it('applies sector colors from new ChartTheme', () => {
    const actions = [makeAction({ sector: 'energy' })];
    const darkTheme = getChartTheme('dark');
    const traces = toReductionBarTraces(actions, darkTheme);
    expect(traces[0].marker?.color).toBe(darkTheme.sectorColors.energy);
  });

  it('sorts years in ascending order', () => {
    const actions = [
      makeAction({ sector: 'transport', startYear: 2026 }),
      makeAction({ sector: 'transport', startYear: 2024 }),
      makeAction({ sector: 'transport', startYear: 2025 }),
    ];
    const traces = toReductionBarTraces(actions);
    expect(traces[0].x).toEqual([2024, 2025, 2026]);
  });

  it('returns empty array for no actions', () => {
    const traces = toReductionBarTraces([]);
    expect(traces).toHaveLength(0);
  });

  it('all traces have type bar', () => {
    const actions = [
      makeAction({ sector: 'transport' }),
      makeAction({ sector: 'waste' }),
    ];
    const traces = toReductionBarTraces(actions);
    traces.forEach(trace => {
      expect(trace.type).toBe('bar');
    });
  });
});
