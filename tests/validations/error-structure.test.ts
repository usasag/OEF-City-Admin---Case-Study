import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { z } from 'zod';
import {
  citySchema,
  climateActionSchema,
  importTextSchema,
} from '@/lib/validations';

/**
 * Mirrors the fieldErrors construction used in src/actions/city.ts,
 * src/actions/climate-actions.ts, and src/actions/imports.ts.
 *
 * Maps Zod issues to the flat { field: message } record that is
 * surfaced inside ActionResult.error.fieldErrors.
 */
function buildFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0]?.toString();
    if (field) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

/**
 * Asserts the structural shape promised by Requirement 9.4:
 *   - one or more entries
 *   - each entry maps a string field name to a non-empty human-readable string
 *   - every field name is a defined field of the source schema
 */
function assertValidationErrorShape(
  fieldErrors: Record<string, string>,
  schemaKeys: readonly string[]
): void {
  const entries = Object.entries(fieldErrors);

  // ≥1 field-level entry
  expect(entries.length).toBeGreaterThanOrEqual(1);

  for (const [field, message] of entries) {
    // Field name is a string
    expect(typeof field).toBe('string');
    expect(field.length).toBeGreaterThan(0);

    // Reason is a non-empty human-readable string
    expect(typeof message).toBe('string');
    expect(message.trim().length).toBeGreaterThan(0);

    // Field name is a subset of the schema's defined fields
    expect(schemaKeys).toContain(field);
  }
}

/**
 * Broad scalar generator that mixes types and edge cases to
 * reliably produce inputs that violate Zod constraints across
 * string, number, enum, and integer fields.
 */
const arbitraryScalar = () =>
  fc.oneof(
    fc.string(),
    fc.integer(),
    fc.double(),
    fc.boolean(),
    fc.constant(null),
    fc.constant(undefined),
    fc.array(fc.integer(), { maxLength: 3 })
  );

describe('Property 10: Validation Error Structure', () => {
  // **Validates: Requirements 9.4**

  const cityKeys = Object.keys(citySchema.shape);
  const climateActionKeys = Object.keys(climateActionSchema.shape);
  const importTextKeys = Object.keys(importTextSchema.shape);

  it('citySchema: failing inputs produce a structured fieldErrors object whose keys are a subset of the schema', () => {
    fc.assert(
      fc.property(
        fc.record(
          {
            name: arbitraryScalar(),
            baselineEmissions: arbitraryScalar(),
            targetYear: arbitraryScalar(),
          },
          { requiredKeys: [] }
        ),
        (input) => {
          const result = citySchema.safeParse(input);
          // Property scope: only inputs that fail validation
          fc.pre(!result.success);
          if (result.success) return;

          const fieldErrors = buildFieldErrors(result.error);
          assertValidationErrorShape(fieldErrors, cityKeys);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('climateActionSchema: failing inputs produce a structured fieldErrors object whose keys are a subset of the schema', () => {
    fc.assert(
      fc.property(
        fc.record(
          {
            title: arbitraryScalar(),
            sector: arbitraryScalar(),
            annualReduction: arbitraryScalar(),
            status: arbitraryScalar(),
            startYear: arbitraryScalar(),
          },
          { requiredKeys: [] }
        ),
        (input) => {
          const result = climateActionSchema.safeParse(input);
          fc.pre(!result.success);
          if (result.success) return;

          const fieldErrors = buildFieldErrors(result.error);
          assertValidationErrorShape(fieldErrors, climateActionKeys);
        }
      ),
      { numRuns: 300 }
    );
  });

  it('importTextSchema: failing inputs produce a structured fieldErrors object whose keys are a subset of the schema', () => {
    fc.assert(
      fc.property(
        fc.record(
          {
            // Mix of: empty string, wrong types, and oversized strings
            text: fc.oneof(
              fc.constant(''),
              fc.integer(),
              fc.boolean(),
              fc.constant(null),
              fc.constant(undefined),
              fc.array(fc.string(), { maxLength: 3 }),
              fc.string({ minLength: 10_001, maxLength: 10_050 })
            ),
          },
          { requiredKeys: [] }
        ),
        (input) => {
          const result = importTextSchema.safeParse(input);
          fc.pre(!result.success);
          if (result.success) return;

          const fieldErrors = buildFieldErrors(result.error);
          assertValidationErrorShape(fieldErrors, importTextKeys);
        }
      ),
      { numRuns: 200 }
    );
  });
});
