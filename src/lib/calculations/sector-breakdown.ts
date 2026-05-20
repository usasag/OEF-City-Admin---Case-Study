import type { ClimateAction, Sector } from '@/types';

const ALL_SECTORS: Sector[] = ['transport', 'energy', 'buildings', 'waste', 'land_use'];

/**
 * Sum annual_reduction values grouped by sector.
 * Returns zero for sectors with no actions.
 */
export function reductionBySector(actions: ClimateAction[]): Record<Sector, number> {
  const result: Record<Sector, number> = {
    transport: 0,
    energy: 0,
    buildings: 0,
    waste: 0,
    land_use: 0,
  };

  for (const action of actions) {
    result[action.sector] += action.annualReduction;
  }

  return result;
}
