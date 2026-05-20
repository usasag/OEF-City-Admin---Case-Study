import type { City, ClimateAction } from '@/types';
import type { ProjectionDataPoint } from '@/types/charts';

/**
 * Computes cumulative reduction for a given year by summing annual_reduction
 * for all actions with start_year <= year.
 */
export function cumulativeReductionAtYear(actions: ClimateAction[], year: number): number {
  return actions
    .filter(action => action.startYear <= year)
    .reduce((sum, action) => sum + action.annualReduction, 0);
}

/**
 * Generates year-by-year emission projections from the current year to the target year.
 * For each year, calculates:
 * - projectedEmissions: max(0, baseline - cumulative annual reductions from actions whose start_year <= that year)
 * - baselineEmissions: constant reference line
 * - linearTarget: linear interpolation from baseline to zero at target year
 *
 * Actions contribute their annual_reduction starting from their start_year onward.
 * Projected emissions are floored at zero (cannot go negative).
 */
export function projectEmissionsByYear(city: City, actions: ClimateAction[]): ProjectionDataPoint[] {
  const currentYear = new Date().getFullYear();
  const { baselineEmissions, targetYear } = city;

  if (targetYear <= currentYear) return [];

  const points: ProjectionDataPoint[] = [];
  const yearSpan = targetYear - currentYear;

  for (let year = currentYear; year <= targetYear; year++) {
    const cumulative = cumulativeReductionAtYear(actions, year);
    const projectedEmissions = Math.max(0, baselineEmissions - cumulative);
    const linearTarget = baselineEmissions * (1 - (year - currentYear) / yearSpan);

    points.push({
      year,
      projectedEmissions,
      baselineEmissions,
      linearTarget: Math.max(0, linearTarget),
    });
  }

  return points;
}
