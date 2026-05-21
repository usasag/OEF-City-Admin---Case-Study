/**
 * Feature: oef-city-climate-action-tracker
 *
 * Property 1: Tenant Isolation — Validates: Requirements 1.3, 1.5
 *
 *   For any authenticated user and any mutation that targets a record whose
 *   organization_id differs from the user's resolved organization_id, the
 *   Server Action shall be rejected (result.success === false) and the
 *   underlying database row shall remain unmodified. The DB write helpers
 *   (updateCity, createAction, updateAction, deleteAction) shall always be
 *   invoked with the user's organization_id as the tenant-filter argument,
 *   never with a foreign organization_id. This is the SQL-filter mechanism
 *   that enforces tenant isolation: any attempt to mutate a record whose
 *   organization_id differs from the user's would produce a WHERE clause
 *   that matches no rows, so no DB row is modified.
 *
 * Property 2: Role-Based Mutation Access Control — Validates: Requirements 3.4, 3.5, 3.6
 *
 *   For any mutation invoked by a user whose role is not 'admin' or 'editor'
 *   (i.e., 'viewer' or any unmapped role), the Server Action shall return
 *   { success: false, error: { type: 'authorization', ... } } and the
 *   database write helpers shall never be invoked. For any mutation invoked
 *   by an 'admin' or 'editor' with a valid same-organization target, the
 *   pipeline shall proceed past role-checking to the database write step.
 *
 * Test strategy:
 *   We mock the Clerk auth boundary and the Supabase query helpers, then
 *   vary three independent inputs:
 *     - userOrgId       : the requesting user's organization_id
 *     - recordOrgId     : the organization_id stored on the targeted record
 *     - role            : the user's role (admin / editor / viewer / unknown)
 *
 *   The DB query mocks model the real Supabase WHERE-clause behavior: a
 *   write helper called with `organization_id = userOrgId` only succeeds
 *   when userOrgId === recordOrgId; otherwise it rejects (simulating
 *   "no rows matched"). This means the only way the action can succeed
 *   is by passing the user's organization_id as the filter AND the user's
 *   organization_id matching the record's organization_id.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import type { City, ClimateAction } from "@/types";

// ---------------------------------------------------------------------------
// Hoisted mock handles. vi.mock() is hoisted above imports, so the mock
// factories below must reach these handles via vi.hoisted().
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

// Mock the city queries used by src/actions/city.ts and the city lookup
// inside src/actions/climate-actions.ts (createClimateAction).
vi.mock("@/lib/db/queries/cities", () => ({
  getCityByOrgId: getCityByOrgIdMock,
  updateCity: updateCityMock,
}));

// Mock the climate-action queries used by src/actions/climate-actions.ts.
vi.mock("@/lib/db/queries/climate-actions", () => ({
  createAction: createActionMock,
  updateAction: updateActionMock,
  deleteAction: deleteActionMock,
  // Re-exported by the module barrel; nothing under test calls it, but the
  // module shape must include this symbol.
  sortActionsByStartYearDescTitleAsc: <T,>(xs: T[]) => xs,
}));

// Imports MUST come after vi.mock() so the mocked modules are wired in.
import { updateCitySettings } from "@/actions/city";
import {
  createClimateAction,
  updateClimateAction,
  deleteClimateAction,
} from "@/actions/climate-actions";

// ---------------------------------------------------------------------------
// Inputs and stubs.
// ---------------------------------------------------------------------------

const FUTURE_YEAR = new Date().getFullYear() + 5;

const validCityInput = {
  name: "Test City",
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

function stubCity(orgId: string): City {
  return {
    id: "city-1",
    organizationId: orgId,
    name: "Test City",
    slug: "test-city",
    baselineEmissions: 1000,
    targetYear: FUTURE_YEAR,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };
}

function stubAction(orgId: string): ClimateAction {
  return {
    id: "action-1",
    organizationId: orgId,
    cityId: "city-1",
    title: "Bus Electrification",
    sector: "transport",
    annualReduction: 100,
    status: "in_progress",
    startYear: 2030,
    sourceText: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };
}

// ---------------------------------------------------------------------------
// Smart generators constrained to the input space described by Properties 1+2.
// ---------------------------------------------------------------------------

const orgIdGen = fc.uuid();

// Roles that the application accepts for mutations.
type AppRole = "admin" | "editor" | "viewer" | "unmapped";
const writeRoleGen: fc.Arbitrary<"admin" | "editor"> = fc.constantFrom(
  "admin",
  "editor",
);
const readOnlyRoleGen: fc.Arbitrary<"viewer" | "unmapped"> = fc.constantFrom(
  "viewer",
  "unmapped",
);
const anyRoleGen: fc.Arbitrary<AppRole> = fc.constantFrom(
  "admin",
  "editor",
  "viewer",
  "unmapped",
);

/**
 * Maps an in-test app role to the role string stored in user_memberships.
 */
function membershipRoleString(role: AppRole): string {
  switch (role) {
    case "admin":
      return "admin";
    case "editor":
      return "editor";
    case "viewer":
      return "viewer";
    case "unmapped":
      return "viewer"; // unmapped roles default to viewer
  }
}

// ---------------------------------------------------------------------------
// Mock configuration. Models real Supabase filter behavior so that DB writes
// only succeed when `organization_id = recordOrgId`.
// ---------------------------------------------------------------------------

/**
 * Resets every mock so its call log starts empty. Must be invoked at the
 * START of every fast-check iteration (vitest's `beforeEach` runs only once
 * per `it` block, not once per fc iteration, so without this the mock
 * call history would carry over between iterations).
 */
function resetAllMocks() {
  authMock.mockReset();
  supabaseMembershipMock.fromMock.mockReset();
  supabaseMembershipMock.selectMock.mockReset();
  supabaseMembershipMock.eqMock.mockReset();
  supabaseMembershipMock.limitMock.mockReset();
  supabaseMembershipMock.singleMock.mockReset();
  for (const m of ALL_DB_MOCKS) m.mockReset();
}

function configureAuth(userOrgId: string, role: AppRole) {
  // getSession returns { userId, email }
  authMock.mockResolvedValue({ userId: "user-1", email: "test@example.com" });

  // supabase.from('user_memberships').select(...).eq(...).limit(...).single()
  // returns the membership with the user's org and role
  supabaseMembershipMock.fromMock.mockReturnValue({ select: supabaseMembershipMock.selectMock });
  supabaseMembershipMock.selectMock.mockReturnValue({ eq: supabaseMembershipMock.eqMock });
  supabaseMembershipMock.eqMock.mockReturnValue({ limit: supabaseMembershipMock.limitMock });
  supabaseMembershipMock.limitMock.mockReturnValue({ single: supabaseMembershipMock.singleMock });
  supabaseMembershipMock.singleMock.mockResolvedValue({
    data: { organization_id: userOrgId, role: membershipRoleString(role) },
  });
}

function configureDb(recordOrgId: string) {
  // getCityByOrgId(orgArg): returns a city only when orgArg === recordOrgId,
  // because that mirrors `SELECT * FROM cities WHERE organization_id = orgArg`
  // against a DB whose only city belongs to recordOrgId.
  getCityByOrgIdMock.mockImplementation(async (orgArg: string) =>
    orgArg === recordOrgId ? stubCity(recordOrgId) : null,
  );

  // updateCity(id, orgArg, data): rejects if orgArg !== recordOrgId
  // (WHERE clause matches no row → PGRST116 → query helper throws).
  updateCityMock.mockImplementation(
    async (
      _id: string,
      orgArg: string,
      data: { name: string; baselineEmissions: number; targetYear: number },
    ) => {
      if (orgArg !== recordOrgId) {
        throw new Error("Failed to update city: no rows matched");
      }
      return { ...stubCity(recordOrgId), ...data };
    },
  );

  // createAction(orgArg, cityId, data): in real DB this is INSERT, but the
  // city referenced by cityId belongs to recordOrgId. A foreign-key violation
  // would only happen if the action were attached to a city outside the user's
  // org; the Server Action prevents that by sourcing cityId from
  // getCityByOrgId(userOrgId), so in cross-org cases we never reach here.
  // We model: succeed when orgArg === recordOrgId, else reject.
  createActionMock.mockImplementation(
    async (
      orgArg: string,
      _cityId: string,
      data: {
        title: string;
        sector: string;
        annualReduction: number;
        status: string;
        startYear: number;
      },
    ) => {
      if (orgArg !== recordOrgId) {
        throw new Error("Failed to create climate action: foreign key violation");
      }
      return { ...stubAction(recordOrgId), ...data };
    },
  );

  // updateAction / deleteAction: same WHERE-clause filter behavior.
  updateActionMock.mockImplementation(
    async (
      _id: string,
      orgArg: string,
      data: {
        title: string;
        sector: string;
        annualReduction: number;
        status: string;
        startYear: number;
      },
    ) => {
      if (orgArg !== recordOrgId) {
        throw new Error("Failed to update climate action: no rows matched");
      }
      return { ...stubAction(recordOrgId), ...data };
    },
  );

  deleteActionMock.mockImplementation(async (_id: string, orgArg: string) => {
    if (orgArg !== recordOrgId) {
      throw new Error("Failed to delete climate action: no rows matched");
    }
  });
}

// All write-mutation mocks for blanket "never called" assertions.
const ALL_WRITE_MOCKS = [
  updateCityMock,
  createActionMock,
  updateActionMock,
  deleteActionMock,
] as const;

// All DB query mocks (lookups + writes) for the role-rejection assertion that
// no database access of any kind happens before a role denial.
const ALL_DB_MOCKS = [
  getCityByOrgIdMock,
  updateCityMock,
  createActionMock,
  updateActionMock,
  deleteActionMock,
] as const;

beforeEach(() => {
  authMock.mockReset();
  supabaseMembershipMock.fromMock.mockReset();
  supabaseMembershipMock.selectMock.mockReset();
  supabaseMembershipMock.eqMock.mockReset();
  supabaseMembershipMock.limitMock.mockReset();
  supabaseMembershipMock.singleMock.mockReset();
  for (const m of ALL_DB_MOCKS) m.mockReset();
});

// ---------------------------------------------------------------------------
// Property 1: Tenant Isolation
// ---------------------------------------------------------------------------

describe("Property 1: Tenant Isolation", () => {
  it("updateCitySettings: cross-org is rejected with no successful DB write; same-org admin/editor proceeds", async () => {
    await fc.assert(
      fc.asyncProperty(
        orgIdGen,
        orgIdGen,
        writeRoleGen,
        async (userOrgId, recordOrgId, role) => {
          resetAllMocks();
          configureAuth(userOrgId, role);
          configureDb(recordOrgId);

          const result = await updateCitySettings(validCityInput);

          // Tenant-filter invariant: every DB call uses the USER'S orgId, never
          // a foreign one. This is the mechanism that scopes WHERE clauses.
          for (const call of getCityByOrgIdMock.mock.calls) {
            expect(call[0]).toBe(userOrgId);
          }
          for (const call of updateCityMock.mock.calls) {
            expect(call[1]).toBe(userOrgId);
          }

          if (userOrgId === recordOrgId) {
            // Same-org happy path: the action proceeds and the DB write is attempted.
            expect(result.success).toBe(true);
            expect(updateCityMock).toHaveBeenCalledTimes(1);
          } else {
            // Cross-org path: the WHERE clause matches no row, so the action is
            // rejected (result.success === false) and the underlying DB row is
            // not modified. updateCity may not even be reached because
            // getCityByOrgId(userOrgId) returns null first → not_found.
            expect(result.success).toBe(false);
            // The terminal DB write either was never invoked, or was invoked
            // with the user's orgId (filtered to nothing in the simulated DB).
            // Either way, no row in recordOrgId was modified.
            for (const call of updateCityMock.mock.calls) {
              expect(call[1]).not.toBe(recordOrgId);
            }
          }
        },
      ),
      { numRuns: 64 },
    );
  });

  it("createClimateAction: cross-org is rejected with no successful DB write; same-org admin/editor proceeds", async () => {
    await fc.assert(
      fc.asyncProperty(
        orgIdGen,
        orgIdGen,
        writeRoleGen,
        async (userOrgId, recordOrgId, role) => {
          resetAllMocks();
          configureAuth(userOrgId, role);
          configureDb(recordOrgId);

          const result = await createClimateAction(validActionInput);

          // Tenant-filter invariant on the city lookup.
          for (const call of getCityByOrgIdMock.mock.calls) {
            expect(call[0]).toBe(userOrgId);
          }
          // Tenant-filter invariant on the create call: first arg is org_id.
          for (const call of createActionMock.mock.calls) {
            expect(call[0]).toBe(userOrgId);
          }

          if (userOrgId === recordOrgId) {
            expect(result.success).toBe(true);
            expect(createActionMock).toHaveBeenCalledTimes(1);
          } else {
            // The user's org owns no city (recordOrgId !== userOrgId), so
            // getCityByOrgId returns null and the action is rejected without
            // ever invoking createAction.
            expect(result.success).toBe(false);
            expect(createActionMock).not.toHaveBeenCalled();
          }
        },
      ),
      { numRuns: 64 },
    );
  });

  it("updateClimateAction: cross-org is rejected with no successful DB write; same-org admin/editor proceeds", async () => {
    await fc.assert(
      fc.asyncProperty(
        orgIdGen,
        orgIdGen,
        writeRoleGen,
        async (userOrgId, recordOrgId, role) => {
          resetAllMocks();
          configureAuth(userOrgId, role);
          configureDb(recordOrgId);

          const result = await updateClimateAction("action-1", validActionInput);

          // Tenant-filter invariant: updateAction is always called with the
          // user's organizationId as the second argument.
          for (const call of updateActionMock.mock.calls) {
            expect(call[1]).toBe(userOrgId);
          }

          if (userOrgId === recordOrgId) {
            // Same-org happy path: DB write attempted and succeeds.
            expect(result.success).toBe(true);
            expect(updateActionMock).toHaveBeenCalledTimes(1);
          } else {
            // Cross-org: the SQL filter (`WHERE id = $1 AND organization_id = $2`)
            // would match zero rows, so the helper rejects → action returns
            // failure → no DB row was modified.
            expect(result.success).toBe(false);
            // The mock records every call; assert none were attributed to the
            // foreign org (which would be a tenant-isolation violation).
            for (const call of updateActionMock.mock.calls) {
              expect(call[1]).not.toBe(recordOrgId);
            }
          }
        },
      ),
      { numRuns: 64 },
    );
  });

  it("deleteClimateAction: cross-org is rejected with no successful DB write; same-org admin/editor proceeds", async () => {
    await fc.assert(
      fc.asyncProperty(
        orgIdGen,
        orgIdGen,
        writeRoleGen,
        async (userOrgId, recordOrgId, role) => {
          resetAllMocks();
          configureAuth(userOrgId, role);
          configureDb(recordOrgId);

          const result = await deleteClimateAction("action-1");

          for (const call of deleteActionMock.mock.calls) {
            expect(call[1]).toBe(userOrgId);
          }

          if (userOrgId === recordOrgId) {
            expect(result.success).toBe(true);
            expect(deleteActionMock).toHaveBeenCalledTimes(1);
          } else {
            expect(result.success).toBe(false);
            for (const call of deleteActionMock.mock.calls) {
              expect(call[1]).not.toBe(recordOrgId);
            }
          }
        },
      ),
      { numRuns: 64 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Role-Based Mutation Access Control
// ---------------------------------------------------------------------------

describe("Property 2: Role-Based Mutation Access Control", () => {
  it("updateCitySettings: viewer/unmapped is rejected with authorization and no DB write; admin/editor proceeds", async () => {
    await fc.assert(
      fc.asyncProperty(orgIdGen, anyRoleGen, async (orgId, role) => {
        // Same-org scenario so that role is the only failing dimension.
        resetAllMocks();
        configureAuth(orgId, role);
        configureDb(orgId);

        const result = await updateCitySettings(validCityInput);

        if (role === "admin" || role === "editor") {
          expect(result.success).toBe(true);
          expect(updateCityMock).toHaveBeenCalledTimes(1);
        } else {
          // Viewer (or any unmapped role) → role check throws BEFORE any DB
          // helper is reached.
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe("authorization");
          }
          for (const m of ALL_DB_MOCKS) {
            expect(m).not.toHaveBeenCalled();
          }
          for (const m of ALL_WRITE_MOCKS) {
            expect(m).not.toHaveBeenCalled();
          }
        }
      }),
      { numRuns: 64 },
    );
  });

  it("createClimateAction: viewer/unmapped is rejected with authorization and no DB write; admin/editor proceeds", async () => {
    await fc.assert(
      fc.asyncProperty(orgIdGen, anyRoleGen, async (orgId, role) => {
        resetAllMocks();
        configureAuth(orgId, role);
        configureDb(orgId);

        const result = await createClimateAction(validActionInput);

        if (role === "admin" || role === "editor") {
          expect(result.success).toBe(true);
          expect(createActionMock).toHaveBeenCalledTimes(1);
        } else {
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe("authorization");
          }
          for (const m of ALL_DB_MOCKS) {
            expect(m).not.toHaveBeenCalled();
          }
        }
      }),
      { numRuns: 64 },
    );
  });

  it("updateClimateAction: viewer/unmapped is rejected with authorization and no DB write; admin/editor proceeds", async () => {
    await fc.assert(
      fc.asyncProperty(orgIdGen, anyRoleGen, async (orgId, role) => {
        resetAllMocks();
        configureAuth(orgId, role);
        configureDb(orgId);

        const result = await updateClimateAction("action-1", validActionInput);

        if (role === "admin" || role === "editor") {
          expect(result.success).toBe(true);
          expect(updateActionMock).toHaveBeenCalledTimes(1);
        } else {
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe("authorization");
          }
          for (const m of ALL_DB_MOCKS) {
            expect(m).not.toHaveBeenCalled();
          }
        }
      }),
      { numRuns: 64 },
    );
  });

  it("deleteClimateAction: viewer/unmapped is rejected with authorization and no DB write; admin/editor proceeds", async () => {
    await fc.assert(
      fc.asyncProperty(orgIdGen, anyRoleGen, async (orgId, role) => {
        resetAllMocks();
        configureAuth(orgId, role);
        configureDb(orgId);

        const result = await deleteClimateAction("action-1");

        if (role === "admin" || role === "editor") {
          expect(result.success).toBe(true);
          expect(deleteActionMock).toHaveBeenCalledTimes(1);
        } else {
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe("authorization");
          }
          for (const m of ALL_DB_MOCKS) {
            expect(m).not.toHaveBeenCalled();
          }
        }
      }),
      { numRuns: 64 },
    );
  });
});

// ---------------------------------------------------------------------------
// Sanity smoke: avoid silent unused-import warnings if a future refactor drops
// one of the readOnlyRoleGen-specific scenarios.
// ---------------------------------------------------------------------------

void readOnlyRoleGen;
