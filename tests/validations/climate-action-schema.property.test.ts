import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { climateActionSchema } from '@/lib/validations/climate-action';

/**
 * Property 9: Climate Action Schema Validation
 *
 * For any input object, the climate action Zod schema shall accept the input
 * if and only if:
 *  - title is a non-empty string of at most 200 characters
 *  - sector is one of the five defined Sector values
 *  - annualReduction is a number between 0 and 999,999,999.99 (inclusive)
 *  - status is one of the three defined Action_Status values
 *  - startYear is an integer between 2000 and 2100 inclusive
 *
 * All other inputs shall be rejected with field-level errors.
 *
 * Validates: Requirements 5.5, 9.2, 9.3
 */

const MAX_REDUCTION = 999_999_999.99;
const SECTORS = ['transport', 'energy', 'buildings', 'waste', 'land_use'] as const;
const STATUSES = ['planned', 'in_progress', 'completed'] as const;

// ---------- Smart generators -------------------------------------------------

/** Strings between 1 and 200 chars (inclusive) made from Unicode characters. */
const validTitleArb = fc
  .string({ minLength: 1, maxLength: 200 })
  // Filter is a safety net: fast-check string lengths are by JS .length but
  // Zod's .max() also counts code units, so this is sound. Keep filter to
  // guarantee the invariant in case fc.string semantics change.
  .filter((s) => s.length >= 1 && s.length <= 200);

const validSectorArb = fc.constantFrom(...SECTORS);
const validStatusArb = fc.constantFrom(...STATUSES);

const validAnnualReductionArb = fc.double({
  min: 0,
  max: MAX_REDUCTION,
  noNaN: true,
  noDefaultInfinity: true,
});

const validStartYearArb = fc.integer({ min: 2000, max: 2100 });

const validInputArb = fc.record({
  title: validTitleArb,
  sector: validSectorArb,
  annualReduction: validAnnualReductionArb,
  status: validStatusArb,
  startYear: validStartYearArb,
});

// ---------- Invalid generators ----------------------------------------------

/** Titles that are not non-empty strings of at most 200 chars. */
const invalidTitleArb = fc.oneof(
  fc.constant(''), // empty
  fc.string({ minLength: 201, maxLength: 400 }), // too long
  fc.integer().map((n) => n as unknown as string), // not a string
  fc.constant(null as unknown as string),
  fc.constant(undefined as unknown as string),
  fc.boolean().map((b) => b as unknown as string)
);

/** Sectors that are not one of the five defined values. */
const invalidSectorArb = fc.oneof(
  fc.string({ minLength: 1, maxLength: 30 }).filter(
    (s) => !(SECTORS as readonly string[]).includes(s)
  ),
  fc.integer().map((n) => n as unknown as string),
  fc.constant(null as unknown as string),
  fc.constant(undefined as unknown as string)
);

/** Annual reductions outside [0, 999_999_999.99] or non-numeric. */
const invalidAnnualReductionArb = fc.oneof(
  fc.double({ max: -0.0001, noNaN: true, noDefaultInfinity: true }), // negative
  fc.double({ min: MAX_REDUCTION + 0.011, noNaN: true, noDefaultInfinity: true }), // too large
  fc.string({ minLength: 1, maxLength: 10 }).map((s) => s as unknown as number),
  fc.constant(null as unknown as number),
  fc.constant(undefined as unknown as number),
  fc.constant(Number.NaN)
);

/** Statuses that are not one of the three defined values. */
const invalidStatusArb = fc.oneof(
  fc.string({ minLength: 1, maxLength: 30 }).filter(
    (s) => !(STATUSES as readonly string[]).includes(s)
  ),
  fc.integer().map((n) => n as unknown as string),
  fc.constant(null as unknown as string),
  fc.constant(undefined as unknown as string)
);

/** Start years outside [2000, 2100] or not integers. */
const invalidStartYearArb = fc.oneof(
  fc.integer({ min: 0, max: 1999 }), // too small
  fc.integer({ min: 2101, max: 9999 }), // too large
  fc
    .double({ min: 2000, max: 2100, noNaN: true, noDefaultInfinity: true })
    .filter((n) => !Number.isInteger(n)), // non-integer in range
  fc.string({ minLength: 1, maxLength: 4 }).map((s) => s as unknown as number),
  fc.constant(null as unknown as number),
  fc.constant(undefined as unknown as number)
);

/**
 * Build an input where exactly one field has been replaced by an invalid
 * value drawn from that field's invalid generator. The other fields are valid.
 *
 * This shape is what we need to reason about field-level errors: a single
 * known-bad field should always yield a validation error mentioning at least
 * that field.
 */
type InvalidField =
  | 'title'
  | 'sector'
  | 'annualReduction'
  | 'status'
  | 'startYear';

const oneInvalidFieldArb = fc
  .tuple(validInputArb, fc.constantFrom<InvalidField>(
    'title',
    'sector',
    'annualReduction',
    'status',
    'startYear'
  ))
  .chain(([base, field]) => {
    const invalidArb =
      field === 'title'
        ? invalidTitleArb
        : field === 'sector'
        ? invalidSectorArb
        : field === 'annualReduction'
        ? invalidAnnualReductionArb
        : field === 'status'
        ? invalidStatusArb
        : invalidStartYearArb;
    return invalidArb.map((badValue) => ({
      input: { ...base, [field]: badValue },
      invalidField: field,
    }));
  });

const SCHEMA_FIELDS: ReadonlySet<string> = new Set([
  'title',
  'sector',
  'annualReduction',
  'status',
  'startYear',
]);

// ---------- Properties -------------------------------------------------------

describe('Property 9: Climate Action Schema Validation', () => {
  it('accepts every input that satisfies all field constraints', () => {
    fc.assert(
      fc.property(validInputArb, (input) => {
        const result = climateActionSchema.safeParse(input);
        if (!result.success) {
          // Surface a useful counter-example payload via expect.
          expect.fail(
            `Expected valid input to be accepted, got errors: ${JSON.stringify(
              result.error.issues
            )} for input ${JSON.stringify(input)}`
          );
        }
        return result.success;
      })
    );
  });

  it('rejects every input that violates exactly one field constraint and reports an error on that field', () => {
    fc.assert(
      fc.property(oneInvalidFieldArb, ({ input, invalidField }) => {
        const result = climateActionSchema.safeParse(input);
        if (result.success) {
          expect.fail(
            `Expected input with invalid ${invalidField} to be rejected: ${JSON.stringify(
              input
            )}`
          );
        }
        // At least one issue must point at the invalid field.
        const fields = result.error.issues.map((issue) => issue.path[0]);
        expect(fields).toContain(invalidField);
        return true;
      })
    );
  });

  it('produces only field-level errors whose paths are within the schema field set', () => {
    fc.assert(
      fc.property(oneInvalidFieldArb, ({ input }) => {
        const result = climateActionSchema.safeParse(input);
        if (result.success) {
          // Acceptable for this property: nothing to assert.
          return true;
        }
        for (const issue of result.error.issues) {
          const top = issue.path[0];
          // Top-level path must be a known schema field name.
          expect(typeof top).toBe('string');
          expect(SCHEMA_FIELDS.has(top as string)).toBe(true);
          // Each issue must carry a non-empty human-readable message.
          expect(typeof issue.message).toBe('string');
          expect(issue.message.length).toBeGreaterThan(0);
        }
        return true;
      })
    );
  });

  it('boundary cases: accepts limits and rejects just-outside-limits', () => {
    // These boundary cases anchor the property test against the exact
    // numeric/length thresholds from Property 9.
    const validBoundaries = [
      {
        title: 'a',
        sector: 'transport' as const,
        annualReduction: 0,
        status: 'planned' as const,
        startYear: 2000,
      },
      {
        title: 'a'.repeat(200),
        sector: 'land_use' as const,
        annualReduction: MAX_REDUCTION,
        status: 'completed' as const,
        startYear: 2100,
      },
    ];
    for (const v of validBoundaries) {
      expect(climateActionSchema.safeParse(v).success).toBe(true);
    }

    const invalidBoundaries = [
      { field: 'title', value: '' },
      { field: 'title', value: 'a'.repeat(201) },
      { field: 'annualReduction', value: -0.01 },
      { field: 'annualReduction', value: MAX_REDUCTION + 0.01 },
      { field: 'startYear', value: 1999 },
      { field: 'startYear', value: 2101 },
      { field: 'startYear', value: 2025.5 },
      { field: 'sector', value: 'industry' },
      { field: 'status', value: 'cancelled' },
    ] as const;

    const baseValid = {
      title: 'Test',
      sector: 'transport' as const,
      annualReduction: 100,
      status: 'planned' as const,
      startYear: 2025,
    };

    for (const { field, value } of invalidBoundaries) {
      const candidate = { ...baseValid, [field]: value } as unknown;
      const result = climateActionSchema.safeParse(candidate);
      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path[0]);
        expect(fields).toContain(field);
      }
    }
  });
});
