/**
 * Feature: oef-city-climate-action-tracker
 *
 * Property-based tests for calculation functions in
 *   src/lib/calculations/progress.ts
 *   src/lib/calculations/sector-breakdown.ts
 *
 * Properties covered:
 *   Property 4: Total Estimated Reduction is Sum of All Annual Reductions
 *   Property 5: Sector Breakdown Sums to Total
 *   Property 6: Percent of Baseline Reduced Formula
 *   Property 7: On-Track Indicator Determination
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  totalEstimatedReduction,
  percentOfBaselineReduced,
  isOnTrack,
} from '@/lib/calculations/progress';
import { reductionBySector } from '@/lib/calculations/sector-breakdown';
import type { City, ClimateAction, Sector, ActionStatus } from '@/types';

// ---------------------------------------------------------------------------
// Domain constants (mirroring the schemas / spec)
// ---------------------------------------------------------------------------

const SECTORS: readonly Sector[] = [
  'transport',
  'energy',
  'buildings',
  'waste',
  'land_use',
];
const STATUSES: readonly ActionStatus[] = ['planned', 'in_progress', 'completed'];

const MAX_REDUCTION = 999_999_999.99;
const MAX_BASELINE = 999_999_999.99;
const MIN_BASELINE = 0.01;

const BASELINE_YEAR = new Date().getFullYear();

// ---------------------------------------------------------------------------
// Floating-point tolerance helpers
// ---------------------------------------------------------------------------

/** True when |a - b| <= max(absTol, relTol * max(|a|, |b|)). */
function approxEqual(a: number, b: number, absTol = 1e-6, relTol = 1e-9): boolean {
  if (a === b) return true;
  const diff = Math.abs(a - b);
  if (diff <= absTol) return true;
  const scale = Math.max(Math.abs(a), Math.abs(b));
  return diff <= relTol * scale;
}

// ---------------------------------------------------------------------------
// Smart generators that match the ClimateAction / City shapes
// ---------------------------------------------------------------------------

const sectorArb: fc.Arbitrary<Sector> = fc.constantFrom(...SECTORS);
const statusArb: fc.Arbitrary<ActionStatus> = fc.constantFrom(...STATUSES);

const annualReductionArb = fc.double({
  min: 0,
  max: MAX_REDUCTION,
  noNaN: true,
  noDefaultInfinity: true,
});

const startYearArb = fc.integer({ min: 2000, max: 2100 });

const climateActionArb: fc.Arbitrary<ClimateAction> = fc.record({
  id: fc.uuid(),
  organizationId: fc.uuid(),
  cityId: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  sector: sectorArb,
  annualReduction: annualReductionArb,
  status: statusArb,
  startYear: startYearArb,
  sourceText: fc.option(fc.string({ maxLength: 200 }), { nil: null }),
  createdAt: fc.constant('2024-01-01T00:00:00Z'),
  updatedAt: fc.constant('2024-01-01T00:00:00Z'),
});

/** A list of actions sized to keep summed reductions well within float precision. */
const actionsArb = fc.array(climateActionArb, { minLength: 0, maxLength: 30 });

const positiveBaselineArb = fc.double({
  min: MIN_BASELINE,
  max: MAX_BASELINE,
  noNaN: true,
  noDefaultInfinity: true,
});

/** Baselines that should yield "indeterminate" / 0 percent (zero or negative). */
const nonPositiveBaselineArb = fc.oneof(
  fc.constant(0),
  fc.double({ min: -1_000_000, max: -0.0001, noNaN: true, noDefaultInfinity: true }),
);

const cityWithPositiveBaselineArb = (
  baselineArb: fc.Arbitrary<number>,
  targetYearArb: fc.Arbitrary<number>,
): fc.Arbitrary<City> =>
  fc.record({
    id: fc.uuid(),
    organizationId: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    slug: fc.string({ minLength: 1, maxLength: 50 }),
    baselineEmissions: baselineArb,
    targetYear: targetYearArb,
    createdAt: fc.constant('2024-01-01T00:00:00Z'),
    updatedAt: fc.constant('2024-01-01T00:00:00Z'),
  });

// Target years strictly greater than the current year (baseline year).
const futureTargetYearArb = fc.integer({
  min: BASELINE_YEAR + 1,
  max: BASELINE_YEAR + 100,
});

// Target years equal to the baseline year (current year).
const equalTargetYearArb = fc.constant(BASELINE_YEAR);

// ---------------------------------------------------------------------------
// Property 4: Total Estimated Reduction is Sum of All Annual Reductions
// ---------------------------------------------------------------------------

describe('Property 4: Total Estimated Reduction is Sum of All Annual Reductions', () => {
  it('equals the arithmetic sum of every action.annualReduction (status-agnostic)', () => {
    fc.assert(
      fc.property(actionsArb, (actions) => {
        const expected = actions.reduce((s, a) => s + a.annualReduction, 0);
        const actual = totalEstimatedReduction(actions);
        expect(approxEqual(actual, expected)).toBe(true);
      }),
      { numRuns: 200 },
    );
  });

  it('returns exactly zero for the empty set', () => {
    expect(totalEstimatedReduction([])).toBe(0);
  });

  it('is invariant under permutation of the action list (sum is order-independent up to fp tolerance)', () => {
    fc.assert(
      fc.property(actionsArb, fc.array(fc.nat(), { maxLength: 30 }), (actions, perm) => {
        // Build a deterministic permutation of `actions` from `perm`.
        const indices = actions.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = (perm[i] ?? 0) % (i + 1);
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const shuffled = indices.map((i) => actions[i]);
        const a = totalEstimatedReduction(actions);
        const b = totalEstimatedReduction(shuffled);
        expect(approxEqual(a, b)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: Sector Breakdown Sums to Total
// ---------------------------------------------------------------------------

describe('Property 5: Sector Breakdown Sums to Total', () => {
  it('the sum of all per-sector values equals totalEstimatedReduction', () => {
    fc.assert(
      fc.property(actionsArb, (actions) => {
        const breakdown = reductionBySector(actions);
        const breakdownSum = SECTORS.reduce((s, sector) => s + breakdown[sector], 0);
        const total = totalEstimatedReduction(actions);
        expect(approxEqual(breakdownSum, total)).toBe(true);
      }),
      { numRuns: 200 },
    );
  });

  it("each sector's value equals the sum of annualReduction for actions in that sector", () => {
    fc.assert(
      fc.property(actionsArb, (actions) => {
        const breakdown = reductionBySector(actions);
        for (const sector of SECTORS) {
          const expected = actions
            .filter((a) => a.sector === sector)
            .reduce((s, a) => s + a.annualReduction, 0);
          expect(approxEqual(breakdown[sector], expected)).toBe(true);
        }
      }),
      { numRuns: 200 },
    );
  });

  it('returns zero for sectors with no associated actions', () => {
    fc.assert(
      fc.property(actionsArb, (actions) => {
        const breakdown = reductionBySector(actions);
        const presentSectors = new Set(actions.map((a) => a.sector));
        for (const sector of SECTORS) {
          if (!presentSectors.has(sector)) {
            expect(breakdown[sector]).toBe(0);
          }
        }
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Percent of Baseline Reduced Formula
// ---------------------------------------------------------------------------

describe('Property 6: Percent of Baseline Reduced Formula', () => {
  it('equals (total / baseline) * 100 for any positive baseline (no cap at 100)', () => {
    fc.assert(
      fc.property(positiveBaselineArb, actionsArb, (baseline, actions) => {
        const total = totalEstimatedReduction(actions);
        const expected = (total / baseline) * 100;
        const actual = percentOfBaselineReduced(baseline, actions);
        expect(approxEqual(actual, expected)).toBe(true);
      }),
      { numRuns: 200 },
    );
  });

  it('does not cap at 100 when total reduction exceeds baseline', () => {
    // Construct cases where total > baseline by sampling small baselines and
    // forcing at least one large-ish action.
    const smallBaselineArb = fc.double({
      min: MIN_BASELINE,
      max: 100,
      noNaN: true,
      noDefaultInfinity: true,
    });
    const largeAction = climateActionArb.map((a) => ({
      ...a,
      annualReduction: 1_000, // ensures total >> small baseline
    }));
    const mixedActionsArb = fc
      .tuple(largeAction, fc.array(climateActionArb, { maxLength: 5 }))
      .map(([first, rest]) => [first, ...rest]);

    fc.assert(
      fc.property(smallBaselineArb, mixedActionsArb, (baseline, actions) => {
        const result = percentOfBaselineReduced(baseline, actions);
        // We expect well over 100 here, and result must equal the raw formula
        // — i.e., it is not clamped.
        const expected = (totalEstimatedReduction(actions) / baseline) * 100;
        expect(approxEqual(result, expected)).toBe(true);
        expect(result).toBeGreaterThan(100);
      }),
      { numRuns: 100 },
    );
  });

  it('returns zero when baseline is zero or non-positive (covers "not set")', () => {
    fc.assert(
      fc.property(nonPositiveBaselineArb, actionsArb, (baseline, actions) => {
        const result = percentOfBaselineReduced(baseline, actions);
        expect(result).toBe(0);
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: On-Track Indicator Determination
// ---------------------------------------------------------------------------

describe('Property 7: On-Track Indicator Determination', () => {
  it('returns "on_track" iff total >= baseline / (targetYear - baselineYear), else "off_track" (positive baseline, future target year)', () => {
    fc.assert(
      fc.property(
        cityWithPositiveBaselineArb(positiveBaselineArb, futureTargetYearArb),
        actionsArb,
        (city, actions) => {
          const total = totalEstimatedReduction(actions);
          const required = city.baselineEmissions / (city.targetYear - BASELINE_YEAR);
          const result = isOnTrack(city, actions);

          // Avoid asserting on values right at the boundary where float
          // comparison would be ambiguous; instead, check the implementation
          // matches the same comparison the spec uses (>=).
          const expected: 'on_track' | 'off_track' =
            total >= required ? 'on_track' : 'off_track';
          expect(result).toBe(expected);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('returns "indeterminate" when baselineEmissions is zero or non-positive (regardless of target year)', () => {
    fc.assert(
      fc.property(
        cityWithPositiveBaselineArb(
          nonPositiveBaselineArb,
          fc.oneof(futureTargetYearArb, equalTargetYearArb),
        ),
        actionsArb,
        (city, actions) => {
          expect(isOnTrack(city, actions)).toBe('indeterminate');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns "indeterminate" when targetYear equals baselineYear (current year), even with positive baseline', () => {
    fc.assert(
      fc.property(
        cityWithPositiveBaselineArb(positiveBaselineArb, equalTargetYearArb),
        actionsArb,
        (city, actions) => {
          expect(isOnTrack(city, actions)).toBe('indeterminate');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('boundary cases anchor the >= comparison', () => {
    // total exactly equal to required -> on_track.
    const baseline = 1000;
    const targetYear = BASELINE_YEAR + 10;
    const required = baseline / (targetYear - BASELINE_YEAR); // = 100
    const city: City = {
      id: 'c1',
      organizationId: 'o1',
      name: 'X',
      slug: 'x',
      baselineEmissions: baseline,
      targetYear,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };
    const action = (annualReduction: number): ClimateAction => ({
      id: 'a1',
      organizationId: 'o1',
      cityId: 'c1',
      title: 't',
      sector: 'transport',
      annualReduction,
      status: 'planned',
      startYear: 2025,
      sourceText: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });

    expect(isOnTrack(city, [action(required)])).toBe('on_track');
    expect(isOnTrack(city, [action(required - 0.0001)])).toBe('off_track');
    expect(isOnTrack(city, [action(required + 0.0001)])).toBe('on_track');
  });
});
