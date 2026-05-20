/**
 * Feature: oef-city-climate-action-tracker
 *
 * Property-based tests for Zod schema validation.
 *
 * Property 8: City Schema Validation — Validates: Requirements 4.4, 9.1
 *   For any input object, the city Zod schema shall accept the input if and
 *   only if: name is a non-empty string of at most 100 characters,
 *   baselineEmissions is a number between 0.01 and 999,999,999.99, and
 *   targetYear is a four-digit integer greater than the current year. All
 *   other inputs shall be rejected with field-level errors.
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { citySchema } from "@/lib/validations/city";

const CURRENT_YEAR = new Date().getFullYear();
const MIN_VALID_YEAR = CURRENT_YEAR + 1;
const MAX_VALID_YEAR = 9999;
const MIN_BASELINE = 0.01;
const MAX_BASELINE = 999_999_999.99;
const MAX_NAME_LEN = 100;

// ---------------------------------------------------------------------------
// Smart generators constrained to the input space described by Property 8.
// ---------------------------------------------------------------------------

const validName = fc.string({ minLength: 1, maxLength: MAX_NAME_LEN });

const validBaselineEmissions = fc.double({
  min: MIN_BASELINE,
  max: MAX_BASELINE,
  noNaN: true,
  noDefaultInfinity: true,
});

const validTargetYear = fc.integer({
  min: MIN_VALID_YEAR,
  max: MAX_VALID_YEAR,
});

const validCity = fc.record({
  name: validName,
  baselineEmissions: validBaselineEmissions,
  targetYear: validTargetYear,
});

// Names that violate Property 8's name predicate: empty, or longer than 100.
const invalidName = fc.oneof(
  fc.constant(""),
  fc.string({ minLength: MAX_NAME_LEN + 1, maxLength: MAX_NAME_LEN + 50 }),
);

// Baseline values that violate Property 8's baseline predicate: outside the
// inclusive [0.01, 999_999_999.99] range, or NaN.
const invalidBaselineEmissions = fc.oneof(
  // strictly less than 0.01 (covers zero, negatives, tiny positives)
  fc.double({
    min: -1e9,
    max: MIN_BASELINE - Number.EPSILON,
    noNaN: true,
    noDefaultInfinity: true,
  }),
  // strictly greater than 999_999_999.99
  fc.double({
    min: MAX_BASELINE + 1,
    max: 1e15,
    noNaN: true,
    noDefaultInfinity: true,
  }),
  fc.constant(Number.NaN),
);

// Target years that violate Property 8's year predicate: not a 4-digit integer,
// or <= currentYear, or > 9999, or non-integer.
const invalidTargetYear = fc.oneof(
  // <= current year (still an integer)
  fc.integer({ min: -1000, max: CURRENT_YEAR }),
  // > 9999
  fc.integer({ min: MAX_VALID_YEAR + 1, max: 99_999 }),
  // non-integer within an otherwise-plausible numeric range
  fc
    .double({
      min: MIN_VALID_YEAR,
      max: MAX_VALID_YEAR,
      noNaN: true,
      noDefaultInfinity: true,
    })
    .filter((n) => !Number.isInteger(n)),
);

// ---------------------------------------------------------------------------
// Property 8 — bidirectional: accept iff all field predicates hold.
// ---------------------------------------------------------------------------

describe("Property 8: City Schema Validation", () => {
  it("accepts every input where name, baselineEmissions, and targetYear all satisfy the predicates", () => {
    fc.assert(
      fc.property(validCity, (input) => {
        const result = citySchema.safeParse(input);
        // Property 8 acceptance branch: all three predicates hold => accepted.
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe(input.name);
          expect(result.data.baselineEmissions).toBe(input.baselineEmissions);
          expect(result.data.targetYear).toBe(input.targetYear);
        }
      }),
      { numRuns: 200 },
    );
  });

  it("rejects every input whose name fails the predicate, with a field-level error on `name`", () => {
    fc.assert(
      fc.property(
        invalidName,
        validBaselineEmissions,
        validTargetYear,
        (name, baselineEmissions, targetYear) => {
          const result = citySchema.safeParse({
            name,
            baselineEmissions,
            targetYear,
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            const fieldsWithErrors = new Set(
              result.error.issues.map((issue) => String(issue.path[0])),
            );
            expect(fieldsWithErrors.has("name")).toBe(true);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it("rejects every input whose baselineEmissions fails the predicate, with a field-level error on `baselineEmissions`", () => {
    fc.assert(
      fc.property(
        validName,
        invalidBaselineEmissions,
        validTargetYear,
        (name, baselineEmissions, targetYear) => {
          const result = citySchema.safeParse({
            name,
            baselineEmissions,
            targetYear,
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            const fieldsWithErrors = new Set(
              result.error.issues.map((issue) => String(issue.path[0])),
            );
            expect(fieldsWithErrors.has("baselineEmissions")).toBe(true);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it("rejects every input whose targetYear fails the predicate, with a field-level error on `targetYear`", () => {
    fc.assert(
      fc.property(
        validName,
        validBaselineEmissions,
        invalidTargetYear,
        (name, baselineEmissions, targetYear) => {
          const result = citySchema.safeParse({
            name,
            baselineEmissions,
            targetYear,
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            const fieldsWithErrors = new Set(
              result.error.issues.map((issue) => String(issue.path[0])),
            );
            expect(fieldsWithErrors.has("targetYear")).toBe(true);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it("only reports field-level errors for fields defined on the city schema", () => {
    // Sanity check tied to the "rejected with field-level errors" clause:
    // any rejection's reported paths must be a subset of {name, baselineEmissions, targetYear}.
    const allowedFields = new Set(["name", "baselineEmissions", "targetYear"]);
    fc.assert(
      fc.property(
        fc.oneof(
          fc.record({
            name: invalidName,
            baselineEmissions: validBaselineEmissions,
            targetYear: validTargetYear,
          }),
          fc.record({
            name: validName,
            baselineEmissions: invalidBaselineEmissions,
            targetYear: validTargetYear,
          }),
          fc.record({
            name: validName,
            baselineEmissions: validBaselineEmissions,
            targetYear: invalidTargetYear,
          }),
        ),
        (input) => {
          const result = citySchema.safeParse(input);
          expect(result.success).toBe(false);
          if (!result.success) {
            for (const issue of result.error.issues) {
              expect(allowedFields.has(String(issue.path[0]))).toBe(true);
              // Property 10 hint: each error has a non-empty human-readable reason.
              expect(typeof issue.message).toBe("string");
              expect(issue.message.length).toBeGreaterThan(0);
            }
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});
