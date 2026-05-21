/**
 * Feature: oef-city-climate-action-tracker
 *
 * Property 14: Server Action Pipeline Ordering — Validates: Requirements 11.2
 *
 *   For any Server Action invocation, the execution pipeline shall follow
 *   strict ordering:
 *     1. authenticate via Clerk
 *     2. resolve the user's organization
 *     3. verify role is admin or editor
 *     4. validate input with the applicable Zod schema
 *     5. execute the database mutation
 *
 *   If any step fails, all subsequent steps shall not execute. Specifically:
 *     - an unauthenticated request shall not trigger role checks or validation
 *     - a role failure shall not trigger validation or mutation
 *     - a validation failure shall not trigger mutation
 *
 *   Error-type mapping observed at the action boundary:
 *     - auth fails        → ActionResult.error.type === 'authorization'
 *     - role denied       → ActionResult.error.type === 'authorization'
 *     - validation fails  → ActionResult.error.type === 'validation'
 *     - DB mutation fails → ActionResult.error.type === 'server_error'
 *
 * Test strategy:
 *   We mock the Clerk auth boundary and the Supabase query helpers, then
 *   inject failures at each pipeline stage. We assert that:
 *     a) The returned ActionResult error type matches the FIRST failing
 *        stage in the canonical order above.
 *     b) Mocks for stages strictly later than the failing stage were
 *        never invoked.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";

// ---------------------------------------------------------------------------
// Hoisted mock handles. vi.mock() is hoisted above imports, so the mock
// factories below need to reach these handles via vi.hoisted().
// ---------------------------------------------------------------------------

const {
  authMock,
  getCityByOrgIdMock,
  updateCityMock,
  createActionMock,
  updateActionMock,
  deleteActionMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  getCityByOrgIdMock: vi.fn(),
  updateCityMock: vi.fn(),
  createActionMock: vi.fn(),
  updateActionMock: vi.fn(),
  deleteActionMock: vi.fn(),
}));

// Mock the session boundary used by src/lib/auth/session.ts.
vi.mock("@/lib/auth/session", () => ({
  getSession: authMock,
}));

// Mock the supabase service-role client used by src/lib/auth/permissions.ts
// to look up user_memberships.
const supabaseMembershipMock = vi.hoisted(() => {
  const singleMock = vi.fn();
  const limitMock = vi.fn(() => ({ single: singleMock }));
  const eqMock = vi.fn(() => ({ limit: limitMock }));
  const selectMock = vi.fn(() => ({ eq: eqMock }));
  const fromMock = vi.fn(() => ({ select: selectMock }));
  return { fromMock, selectMock, eqMock, limitMock, singleMock };
});

vi.mock("@/lib/db/supabase", () => ({
  supabase: {
    from: supabaseMembershipMock.fromMock,
  },
}));

// Mock the city queries used by both src/actions/city.ts and
// src/actions/climate-actions.ts (the latter calls getCityByOrgId too).
vi.mock("@/lib/db/queries/cities", () => ({
  getCityByOrgId: getCityByOrgIdMock,
  updateCity: updateCityMock,
}));

// Mock the climate-action queries used by src/actions/climate-actions.ts.
// Re-export sortActionsByStartYearDescTitleAsc as a no-op identity since
// it is also re-exported from the queries module; nothing under test calls
// it, but the module barrel must still expose the symbol.
vi.mock("@/lib/db/queries/climate-actions", () => ({
  createAction: createActionMock,
  updateAction: updateActionMock,
  deleteAction: deleteActionMock,
  sortActionsByStartYearDescTitleAsc: <T,>(xs: T[]) => xs,
}));

// Imports MUST come after vi.mock() so the mocked modules are wired in.
import { updateCitySettings } from "@/actions/city";
import {
  createClimateAction,
  updateClimateAction,
} from "@/actions/climate-actions";

// ---------------------------------------------------------------------------
// Stage model + smart generators.
// ---------------------------------------------------------------------------

type Stage = "auth" | "role" | "validation" | "db";

const stageGen: fc.Arbitrary<Stage> = fc.constantFrom(
  "auth",
  "role",
  "validation",
  "db",
);

// Maps a stage to the ActionResult error type the action should surface
// when that stage is the FIRST to fail.
const expectedErrorType: Record<Stage, "authorization" | "validation" | "server_error"> = {
  auth: "authorization",
  role: "authorization",
  validation: "validation",
  db: "server_error",
};

const FUTURE_YEAR = new Date().getFullYear() + 5;

const validCityInput = {
  name: "Test City",
  baselineEmissions: 1000,
  targetYear: FUTURE_YEAR,
};

const invalidCityInput = {
  // Empty name fails the city Zod schema (name min length 1).
  name: "",
  baselineEmissions: 1000,
  targetYear: FUTURE_YEAR,
};

const validActionInput = {
  title: "Bus Electrification",
  sector: "transport",
  annualReduction: 100,
  status: "in_progress",
  startYear: 2030,
};

const invalidActionInput = {
  // Empty title fails the climate-action Zod schema (title min length 1).
  title: "",
  sector: "transport",
  annualReduction: 100,
  status: "in_progress",
  startYear: 2030,
};

const stubCity = {
  id: "city-1",
  organizationId: "org-1",
  name: "Test City",
  slug: "test-city",
  baselineEmissions: 1000,
  targetYear: FUTURE_YEAR,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const stubClimateAction = {
  id: "action-1",
  organizationId: "org-1",
  cityId: "city-1",
  title: "Bus Electrification",
  sector: "transport" as const,
  annualReduction: 100,
  status: "in_progress" as const,
  startYear: 2030,
  sourceText: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

// ---------------------------------------------------------------------------
// Mock configuration. We pin the FIRST failing stage and configure earlier
// stages to pass and later stages to "would-succeed-if-reached" so that any
// observed downstream activity (later mock invoked) is unambiguous evidence
// of a pipeline-ordering violation.
// ---------------------------------------------------------------------------

function configureStages(opts: {
  firstFailingStage: Stage;
  // Which DB mock should be the "mutation" terminal. Each action under test
  // has its own terminal mutation mock. Earlier stages share the same
  // requireAuth / requireRole / Zod stages.
  dbMutationMock: ReturnType<typeof vi.fn>;
}) {
  const { firstFailingStage, dbMutationMock } = opts;

  // Reset everything before configuring this scenario.
  authMock.mockReset();
  supabaseMembershipMock.fromMock.mockReset();
  supabaseMembershipMock.selectMock.mockReset();
  supabaseMembershipMock.eqMock.mockReset();
  supabaseMembershipMock.limitMock.mockReset();
  supabaseMembershipMock.singleMock.mockReset();
  getCityByOrgIdMock.mockReset();
  updateCityMock.mockReset();
  createActionMock.mockReset();
  updateActionMock.mockReset();
  deleteActionMock.mockReset();

  // Helper to configure the supabase membership chain
  function configureMembership(orgId: string | null, role: string | null) {
    supabaseMembershipMock.fromMock.mockReturnValue({ select: supabaseMembershipMock.selectMock });
    supabaseMembershipMock.selectMock.mockReturnValue({ eq: supabaseMembershipMock.eqMock });
    supabaseMembershipMock.eqMock.mockReturnValue({ limit: supabaseMembershipMock.limitMock });
    supabaseMembershipMock.limitMock.mockReturnValue({ single: supabaseMembershipMock.singleMock });
    if (orgId && role) {
      supabaseMembershipMock.singleMock.mockResolvedValue({
        data: { organization_id: orgId, role },
      });
    } else {
      supabaseMembershipMock.singleMock.mockResolvedValue({ data: null });
    }
  }

  // ---- Stage 1 + 2: authentication + org resolution (fused inside requireAuth)
  if (firstFailingStage === "auth") {
    // getSession returns null → requireAuth throws { type: 'authorization' }.
    authMock.mockResolvedValue(null);
    configureMembership(null, null);
  } else if (firstFailingStage === "role") {
    // Authenticated, org resolved, but role is viewer → requireRole throws.
    authMock.mockResolvedValue({ userId: "user-1", email: "test@example.com" });
    configureMembership("org-1", "viewer");
  } else {
    // Auth + role both pass for validation- and db-stage scenarios.
    authMock.mockResolvedValue({ userId: "user-1", email: "test@example.com" });
    configureMembership("org-1", "admin");
  }

  // ---- Stage 5: DB. getCityByOrgId is part of the "execute mutation" stage.
  getCityByOrgIdMock.mockResolvedValue(stubCity);

  if (firstFailingStage === "db") {
    dbMutationMock.mockRejectedValue(new Error("DB write failed"));
  } else {
    dbMutationMock.mockResolvedValue(stubClimateAction);
  }
}

// ---------------------------------------------------------------------------
// Property 14 — exercised against three Server Actions that share the same
// authenticate → resolve org → role → validate → mutate pipeline.
// ---------------------------------------------------------------------------

describe("Property 14: Server Action Pipeline Ordering", () => {
  beforeEach(() => {
    authMock.mockReset();
    supabaseMembershipMock.fromMock.mockReset();
    supabaseMembershipMock.selectMock.mockReset();
    supabaseMembershipMock.eqMock.mockReset();
    supabaseMembershipMock.limitMock.mockReset();
    supabaseMembershipMock.singleMock.mockReset();
    getCityByOrgIdMock.mockReset();
    updateCityMock.mockReset();
    createActionMock.mockReset();
    updateActionMock.mockReset();
    deleteActionMock.mockReset();
  });

  it("updateCitySettings: error type maps to the FIRST failing stage and downstream stages are never invoked", async () => {
    await fc.assert(
      fc.asyncProperty(stageGen, async (firstFailingStage) => {
        configureStages({ firstFailingStage, dbMutationMock: updateCityMock });

        const input =
          firstFailingStage === "validation" ? invalidCityInput : validCityInput;

        const result = await updateCitySettings(input);

        // (a) Result must be a failure with the expected error type.
        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error.type).toBe(expectedErrorType[firstFailingStage]);

        // (b) Downstream stages must never have been invoked.
        if (firstFailingStage === "auth") {
          // Role check has no separate mock; it reads from AuthContext synchronously.
          // Validation has no observable mock either — but if validation had run
          // on valid input, the DB stage would have been reached, which we
          // verify did not happen.
          expect(getCityByOrgIdMock).not.toHaveBeenCalled();
          expect(updateCityMock).not.toHaveBeenCalled();
        }
        if (firstFailingStage === "role") {
          // Auth ran (we observe its call), role rejected, nothing downstream.
          expect(authMock).toHaveBeenCalledTimes(1);
          expect(getCityByOrgIdMock).not.toHaveBeenCalled();
          expect(updateCityMock).not.toHaveBeenCalled();
        }
        if (firstFailingStage === "validation") {
          // Auth + role passed; validation rejected → DB stage never reached.
          expect(authMock).toHaveBeenCalledTimes(1);
          expect(getCityByOrgIdMock).not.toHaveBeenCalled();
          expect(updateCityMock).not.toHaveBeenCalled();
        }
        if (firstFailingStage === "db") {
          // Full pipeline ran: auth, role, validation, lookup, terminal mutation.
          expect(authMock).toHaveBeenCalledTimes(1);
          expect(getCityByOrgIdMock).toHaveBeenCalledTimes(1);
          expect(updateCityMock).toHaveBeenCalledTimes(1);
        }
      }),
      { numRuns: 64 },
    );
  });

  it("createClimateAction: error type maps to the FIRST failing stage and downstream stages are never invoked", async () => {
    await fc.assert(
      fc.asyncProperty(stageGen, async (firstFailingStage) => {
        configureStages({ firstFailingStage, dbMutationMock: createActionMock });

        const input =
          firstFailingStage === "validation"
            ? invalidActionInput
            : validActionInput;

        const result = await createClimateAction(input);

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error.type).toBe(expectedErrorType[firstFailingStage]);

        if (firstFailingStage === "auth") {
          expect(getCityByOrgIdMock).not.toHaveBeenCalled();
          expect(createActionMock).not.toHaveBeenCalled();
        }
        if (firstFailingStage === "role") {
          expect(authMock).toHaveBeenCalledTimes(1);
          expect(getCityByOrgIdMock).not.toHaveBeenCalled();
          expect(createActionMock).not.toHaveBeenCalled();
        }
        if (firstFailingStage === "validation") {
          expect(authMock).toHaveBeenCalledTimes(1);
          expect(getCityByOrgIdMock).not.toHaveBeenCalled();
          expect(createActionMock).not.toHaveBeenCalled();
        }
        if (firstFailingStage === "db") {
          expect(authMock).toHaveBeenCalledTimes(1);
          expect(getCityByOrgIdMock).toHaveBeenCalledTimes(1);
          expect(createActionMock).toHaveBeenCalledTimes(1);
        }
      }),
      { numRuns: 64 },
    );
  });

  it("updateClimateAction: error type maps to the FIRST failing stage and downstream stages are never invoked", async () => {
    await fc.assert(
      fc.asyncProperty(stageGen, async (firstFailingStage) => {
        configureStages({ firstFailingStage, dbMutationMock: updateActionMock });

        const input =
          firstFailingStage === "validation"
            ? invalidActionInput
            : validActionInput;

        const result = await updateClimateAction("action-1", input);

        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.error.type).toBe(expectedErrorType[firstFailingStage]);

        if (firstFailingStage === "auth") {
          // updateClimateAction does not call getCityByOrgId; tenant isolation
          // is enforced inside updateAction itself. The terminal mutation must
          // not run.
          expect(updateActionMock).not.toHaveBeenCalled();
        }
        if (firstFailingStage === "role") {
          expect(authMock).toHaveBeenCalledTimes(1);
          expect(updateActionMock).not.toHaveBeenCalled();
        }
        if (firstFailingStage === "validation") {
          expect(authMock).toHaveBeenCalledTimes(1);
          expect(updateActionMock).not.toHaveBeenCalled();
        }
        if (firstFailingStage === "db") {
          expect(authMock).toHaveBeenCalledTimes(1);
          expect(updateActionMock).toHaveBeenCalledTimes(1);
        }
      }),
      { numRuns: 64 },
    );
  });
});
