// ─── Enums ───────────────────────────────────────────────────────────────────

export type Sector = 'transport' | 'energy' | 'buildings' | 'waste' | 'land_use';

export type ActionStatus = 'planned' | 'in_progress' | 'completed';

// ─── Entities ────────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  clerkOrgId: string;
  createdAt: string;
}

export interface City {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  baselineEmissions: number;
  targetYear: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClimateAction {
  id: string;
  organizationId: string;
  cityId: string;
  title: string;
  sector: Sector;
  annualReduction: number;
  status: ActionStatus;
  startYear: number;
  sourceText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportAttempt {
  id: string;
  organizationId: string;
  cityId: string;
  inputText: string;
  provider: string;
  model: string;
  parsedJson: unknown | null;
  status: 'success' | 'partial' | 'failed';
  createdAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthContext {
  userId: string;
  organizationId: string;
  role: 'admin' | 'editor' | 'viewer';
}

// ─── Server Action Result ────────────────────────────────────────────────────

export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        type: 'validation' | 'authorization' | 'not_found' | 'server_error';
        message: string;
        fieldErrors?: Record<string, string>;
      };
    };
