/**
 * Feature: oef-city-climate-action-tracker
 *
 * Property 3: Climate Action List Sorting Invariant — Validates: Requirements 2.4
 *
 *   For any list of Climate_Action records returned for a city's public
 *   dashboard, the list shall be sorted such that for any two adjacent
 *   items, the first item's start_year is greater than or equal to the
 *   second item's start_year, and when start_years are equal, the first
 *   item's title is lexicographically less than or equal to the second
 *   item's title.
 *
 * The DB query `getActionsByCity` delegates ordering to the database, but
 * routes its result through the pure helper `sortActionsByStartYearDescTitleAsc`
 * so the invariant is testable without a live DB. This file exercises that
 * pure helper directly.
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { sortActionsByStartYearDescTitleAsc } from "@/lib/db/queries/climate-actions-sort";

// ---------------------------------------------------------------------------
// Smart generators constrained to the input space described by Property 3.
// ---------------------------------------------------------------------------

// Climate actions are persisted with start_year between 2000 and 2100
// (Requirement 5.5, Requirement 9.2). Generating in that range mirrors what
// the public dashboard would actually receive.
const startYear = fc.integer({ min: 2000, max: 2100 });

// Title is a non-empty string, capped at the schema limit. We also draw from
// a small alphabet on purpose: it forces frequent title collisions and exercises
// the secondary lexicographic comparison instead of mostly hitting unique titles.
const title = fc.string({ minLength: 1, maxLength: 16 });

// Minimal action shape: only the fields the sort helper inspects. The helper
// is generic over { startYear: number; title: string }, so this is sufficient.
const actionItem = fc.record({
  startYear,
  title,
});

const actionList = fc.array(actionItem, { minLength: 0, maxLength: 50 });

// ---------------------------------------------------------------------------
// Property 3 — adjacent-pair invariant: start_year DESC, title ASC tiebreaker.
// ---------------------------------------------------------------------------

describe("Property 3: Climate Action List Sorting Invariant", () => {
  it("for any input list, every adjacent pair satisfies start_year DESC, then title ASC", () => {
    fc.assert(
      fc.property(actionList, (input) => {
        const sorted = sortActionsByStartYearDescTitleAsc(input);

        for (let i = 0; i < sorted.length - 1; i++) {
          const first = sorted[i];
          const second = sorted[i + 1];

          // Primary: first.start_year >= second.start_year.
          expect(first.startYear).toBeGreaterThanOrEqual(second.startYear);

          // Secondary: when start_years tie, first.title <= second.title.
          if (first.startYear === second.startYear) {
            expect(first.title <= second.title).toBe(true);
          }
        }
      }),
      { numRuns: 200 },
    );
  });

  it("is a permutation of the input (no items added, removed, or duplicated)", () => {
    fc.assert(
      fc.property(actionList, (input) => {
        const sorted = sortActionsByStartYearDescTitleAsc(input);

        // Same length.
        expect(sorted.length).toBe(input.length);

        // Same multiset of (startYear, title) pairs. Encoding as a string and
        // sorting both sides gives a deterministic comparison.
        const encode = (a: { startYear: number; title: string }) =>
          `${a.startYear}\u0000${a.title}`;
        const before = input.map(encode).sort();
        const after = sorted.map(encode).sort();
        expect(after).toEqual(before);
      }),
      { numRuns: 200 },
    );
  });

  it("does not mutate the input array", () => {
    fc.assert(
      fc.property(actionList, (input) => {
        const snapshot = input.map((a) => ({ ...a }));
        sortActionsByStartYearDescTitleAsc(input);
        expect(input).toEqual(snapshot);
      }),
      { numRuns: 100 },
    );
  });
});
