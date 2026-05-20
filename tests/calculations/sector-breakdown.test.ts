import { describe, it, expect } from "vitest";
import { reductionBySector } from "@/lib/calculations/sector-breakdown";
import type { ClimateAction } from "@/types";

function makeAction(overrides: Partial<ClimateAction> = {}): ClimateAction {
  return {
    id: "test-id",
    organizationId: "org-1",
    cityId: "city-1",
    title: "Test Action",
    sector: "transport",
    annualReduction: 100,
    status: "planned",
    startYear: 2025,
    sourceText: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("reductionBySector", () => {
  it("returns zero for all sectors when given an empty array", () => {
    const result = reductionBySector([]);
    expect(result).toEqual({
      transport: 0,
      energy: 0,
      buildings: 0,
      waste: 0,
      land_use: 0,
    });
  });

  it("sums annual_reduction values grouped by sector", () => {
    const actions: ClimateAction[] = [
      makeAction({ sector: "transport", annualReduction: 100 }),
      makeAction({ sector: "transport", annualReduction: 50 }),
      makeAction({ sector: "energy", annualReduction: 200 }),
      makeAction({ sector: "buildings", annualReduction: 75 }),
    ];

    const result = reductionBySector(actions);
    expect(result).toEqual({
      transport: 150,
      energy: 200,
      buildings: 75,
      waste: 0,
      land_use: 0,
    });
  });

  it("returns zero for sectors with no actions", () => {
    const actions: ClimateAction[] = [
      makeAction({ sector: "waste", annualReduction: 300 }),
    ];

    const result = reductionBySector(actions);
    expect(result.transport).toBe(0);
    expect(result.energy).toBe(0);
    expect(result.buildings).toBe(0);
    expect(result.waste).toBe(300);
    expect(result.land_use).toBe(0);
  });

  it("handles actions across all sectors", () => {
    const actions: ClimateAction[] = [
      makeAction({ sector: "transport", annualReduction: 10 }),
      makeAction({ sector: "energy", annualReduction: 20 }),
      makeAction({ sector: "buildings", annualReduction: 30 }),
      makeAction({ sector: "waste", annualReduction: 40 }),
      makeAction({ sector: "land_use", annualReduction: 50 }),
    ];

    const result = reductionBySector(actions);
    expect(result).toEqual({
      transport: 10,
      energy: 20,
      buildings: 30,
      waste: 40,
      land_use: 50,
    });
  });

  it("includes actions regardless of status", () => {
    const actions: ClimateAction[] = [
      makeAction({ sector: "energy", annualReduction: 100, status: "planned" }),
      makeAction({ sector: "energy", annualReduction: 200, status: "in_progress" }),
      makeAction({ sector: "energy", annualReduction: 300, status: "completed" }),
    ];

    const result = reductionBySector(actions);
    expect(result.energy).toBe(600);
  });
});
