import { describe, it, expect } from 'vitest';
import {
  totalEstimatedReduction,
  percentOfBaselineReduced,
  isOnTrack,
} from './progress';
import type { City, ClimateAction } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAction(overrides: Partial<ClimateAction> = {}): ClimateAction {
  return {
    id: 'action-1',
    organizationId: 'org-1',
    cityId: 'city-1',
    title: 'Test Action',
    sector: 'transport',
    annualReduction: 100,
    status: 'planned',
    startYear: 2024,
    sourceText: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeCity(overrides: Partial<City> = {}): City {
  return {
    id: 'city-1',
    organizationId: 'org-1',
    name: 'Greenville',
    slug: 'greenville',
    baselineEmissions: 10000,
    targetYear: new Date().getFullYear() + 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// ─── totalEstimatedReduction ─────────────────────────────────────────────────

describe('totalEstimatedReduction', () => {
  it('returns zero for empty array', () => {
    expect(totalEstimatedReduction([])).toBe(0);
  });

  it('sums annual_reduction values from all actions', () => {
    const actions = [
      makeAction({ annualReduction: 100 }),
      makeAction({ annualReduction: 250 }),
      makeAction({ annualReduction: 50 }),
    ];
    expect(totalEstimatedReduction(actions)).toBe(400);
  });

  it('includes actions regardless of status', () => {
    const actions = [
      makeAction({ annualReduction: 100, status: 'planned' }),
      makeAction({ annualReduction: 200, status: 'in_progress' }),
      makeAction({ annualReduction: 300, status: 'completed' }),
    ];
    expect(totalEstimatedReduction(actions)).toBe(600);
  });

  it('handles a single action', () => {
    const actions = [makeAction({ annualReduction: 500 })];
    expect(totalEstimatedReduction(actions)).toBe(500);
  });
});

// ─── percentOfBaselineReduced ────────────────────────────────────────────────

describe('percentOfBaselineReduced', () => {
  it('returns zero if baseline is zero', () => {
    const actions = [makeAction({ annualReduction: 100 })];
    expect(percentOfBaselineReduced(0, actions)).toBe(0);
  });

  it('returns zero if baseline is negative', () => {
    const actions = [makeAction({ annualReduction: 100 })];
    expect(percentOfBaselineReduced(-500, actions)).toBe(0);
  });

  it('computes (total / baseline) * 100', () => {
    const actions = [
      makeAction({ annualReduction: 500 }),
      makeAction({ annualReduction: 500 }),
    ];
    // total = 1000, baseline = 10000 → 10%
    expect(percentOfBaselineReduced(10000, actions)).toBe(10);
  });

  it('does not cap at 100%', () => {
    const actions = [makeAction({ annualReduction: 15000 })];
    // total = 15000, baseline = 10000 → 150%
    expect(percentOfBaselineReduced(10000, actions)).toBe(150);
  });

  it('returns zero for empty actions with positive baseline', () => {
    expect(percentOfBaselineReduced(10000, [])).toBe(0);
  });
});

// ─── isOnTrack ───────────────────────────────────────────────────────────────

describe('isOnTrack', () => {
  it('returns indeterminate if baseline is zero', () => {
    const city = makeCity({ baselineEmissions: 0 });
    const actions = [makeAction({ annualReduction: 100 })];
    expect(isOnTrack(city, actions)).toBe('indeterminate');
  });

  it('returns indeterminate if baseline is negative', () => {
    const city = makeCity({ baselineEmissions: -100 });
    const actions = [makeAction({ annualReduction: 100 })];
    expect(isOnTrack(city, actions)).toBe('indeterminate');
  });

  it('returns indeterminate if targetYear equals current year', () => {
    const city = makeCity({ targetYear: new Date().getFullYear() });
    const actions = [makeAction({ annualReduction: 100 })];
    expect(isOnTrack(city, actions)).toBe('indeterminate');
  });

  it('returns on_track when total >= required annual', () => {
    // baseline = 10000, targetYear = currentYear + 10
    // requiredAnnual = 10000 / 10 = 1000
    const city = makeCity({ baselineEmissions: 10000, targetYear: new Date().getFullYear() + 10 });
    const actions = [makeAction({ annualReduction: 1000 })];
    expect(isOnTrack(city, actions)).toBe('on_track');
  });

  it('returns on_track when total exceeds required annual', () => {
    const city = makeCity({ baselineEmissions: 10000, targetYear: new Date().getFullYear() + 10 });
    const actions = [makeAction({ annualReduction: 2000 })];
    expect(isOnTrack(city, actions)).toBe('on_track');
  });

  it('returns off_track when total < required annual', () => {
    // baseline = 10000, targetYear = currentYear + 10
    // requiredAnnual = 10000 / 10 = 1000
    const city = makeCity({ baselineEmissions: 10000, targetYear: new Date().getFullYear() + 10 });
    const actions = [makeAction({ annualReduction: 500 })];
    expect(isOnTrack(city, actions)).toBe('off_track');
  });

  it('returns off_track for empty actions with valid city', () => {
    const city = makeCity({ baselineEmissions: 10000, targetYear: new Date().getFullYear() + 10 });
    expect(isOnTrack(city, [])).toBe('off_track');
  });
});
