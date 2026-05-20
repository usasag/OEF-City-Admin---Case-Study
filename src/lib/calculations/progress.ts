import type { City, ClimateAction } from '@/types';

/**
 * Sum of all annual_reduction values regardless of status.
 * Returns zero for empty array.
 */
export function totalEstimatedReduction(actions: ClimateAction[]): number {
  return actions.reduce((sum, action) => sum + action.annualReduction, 0);
}

/**
 * (total / baseline) * 100 without capping at 100.
 * Returns zero if baseline is zero or not set.
 */
export function percentOfBaselineReduced(
  baselineEmissions: number,
  actions: ClimateAction[]
): number {
  if (!baselineEmissions || baselineEmissions <= 0) return 0;
  const total = totalEstimatedReduction(actions);
  return (total / baselineEmissions) * 100;
}

/**
 * Determines on-track status:
 * - "indeterminate" if baseline is zero/not set OR targetYear equals baselineYear
 * - "on_track" if total >= baseline / (targetYear - baselineYear)
 * - "off_track" otherwise
 *
 * Note: baselineYear is the current year (the year the system is evaluating from)
 */
export function isOnTrack(
  city: City,
  actions: ClimateAction[]
): 'on_track' | 'off_track' | 'indeterminate' {
  const baselineYear = new Date().getFullYear();

  if (!city.baselineEmissions || city.baselineEmissions <= 0) return 'indeterminate';
  if (city.targetYear === baselineYear) return 'indeterminate';

  const requiredAnnual = city.baselineEmissions / (city.targetYear - baselineYear);
  const total = totalEstimatedReduction(actions);

  return total >= requiredAnnual ? 'on_track' : 'off_track';
}
