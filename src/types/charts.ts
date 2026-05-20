import type { ClimateAction, Sector } from './index';

// ─── Projection Data ─────────────────────────────────────────────────────────

export interface ProjectionDataPoint {
  year: number;
  projectedEmissions: number;
  baselineEmissions: number;
  linearTarget: number;
}

// ─── Chart Props ─────────────────────────────────────────────────────────────

export interface EmissionsProjectionChartProps {
  projections: ProjectionDataPoint[];
  cityName: string;
  targetYear: number;
}

export interface SectorBreakdownChartProps {
  sectorData: Record<Sector, number>;
  totalReduction: number;
}

export interface ProgressGaugeChartProps {
  percentReduced: number;
  onTrackStatus: 'on_track' | 'off_track' | 'indeterminate';
}

export interface AnnualReductionBarChartProps {
  actions: ClimateAction[];
}
