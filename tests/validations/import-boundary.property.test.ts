// Property 12 measures length in UTF-16 code units (`String.prototype.length`),
// matching Zod `.max(10000)` and HTML `<textarea maxlength>` semantics.
//
// Implementation note: fast-check's default `fc.string()` generator uses
// printable-ASCII units, so each character occupies exactly one UTF-16 code
// unit. That means `text.length` (the metric Zod measures) equals the
// generator's requested length. We deliberately do NOT use
// `unit: 'binary'`, because that variant can emit astral characters
// (e.g. '𐀀') which count as one code point but two UTF-16 code units —
// which would make the test disagree with the implementation purely on
// encoding semantics, not on actual behavior.

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { importTextSchema } from '@/lib/validations/import';

/**
 * Property 12: Import Text Boundary Validation
 *
 * For any string submitted to the import form, the system shall reject the
 * submission with a validation error (without invoking the LLM) if the string
 * is empty (length 0) or exceeds 10,000 characters. All strings with length
 * between 1 and 10,000 inclusive shall pass this boundary check.
 *
 * Length is measured in UTF-16 code units (`String.prototype.length`),
 * matching Zod's `.max()` and HTML `<textarea maxlength>` semantics.
 *
 * Validates: Requirements 7.7
 */
describe('Property 12: Import Text Boundary Validation', () => {
  const MAX_LEN = 10_000;

  it('rejects strings of length 0 (empty input)', () => {
    // Single deterministic check covers the entire "length 0" input space:
    // there is exactly one string of length 0.
    const result = importTextSchema.safeParse({ text: '' });
    expect(result.success).toBe(false);
  });

  it('accepts every string whose length is in [1, 10000] inclusive', () => {
    fc.assert(
      fc.property(
        // Default `fc.string()` emits BMP printable-ASCII characters, so
        // `text.length` (code units) === the requested length.
        fc.string({ minLength: 1, maxLength: MAX_LEN }),
        (text) => {
          // Precondition: fast-check honors the length bounds we requested.
          if (text.length < 1 || text.length > MAX_LEN) return true;

          const result = importTextSchema.safeParse({ text });
          return result.success === true;
        }
      ),
      { numRuns: 200 }
    );
  });

  it('rejects every string whose length exceeds 10000', () => {
    fc.assert(
      fc.property(
        // Strings strictly longer than the upper bound. Cap at MAX_LEN + 200
        // to keep the test fast while still exercising the >10000 boundary.
        fc.string({ minLength: MAX_LEN + 1, maxLength: MAX_LEN + 200 }),
        (text) => {
          if (text.length <= MAX_LEN) return true;

          const result = importTextSchema.safeParse({ text });
          return result.success === false;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('accepts the exact lower boundary (length 1)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 1 }),
        (text) => {
          // Defensive guard: only assert on inputs that actually hit the
          // intended UTF-16 code-unit length.
          if (text.length !== 1) return true;

          const result = importTextSchema.safeParse({ text });
          return result.success === true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('accepts the exact upper boundary (length 10000)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: MAX_LEN, maxLength: MAX_LEN }),
        (text) => {
          if (text.length !== MAX_LEN) return true;

          const result = importTextSchema.safeParse({ text });
          return result.success === true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('rejects the string immediately past the upper boundary (length 10001)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: MAX_LEN + 1, maxLength: MAX_LEN + 1 }),
        (text) => {
          if (text.length !== MAX_LEN + 1) return true;

          const result = importTextSchema.safeParse({ text });
          return result.success === false;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('boundary outcome depends only on length, not content', () => {
    // For every generated length in [0, 10001], any string of that length
    // must yield the same accept/reject outcome — i.e., the validation is
    // purely a length-based boundary check.
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: MAX_LEN + 1 }),
        // Ample-length pool of single-code-unit characters from which we
        // slice/pad to the desired UTF-16 code-unit length.
        fc.string({ minLength: 0, maxLength: MAX_LEN + 1 }),
        (len, sample) => {
          const text =
            sample.length >= len ? sample.slice(0, len) : sample.padEnd(len, 'x');
          if (text.length !== len) return true; // padding edge cases on empty samples

          const expectedSuccess = len >= 1 && len <= MAX_LEN;
          const result = importTextSchema.safeParse({ text });
          return result.success === expectedSuccess;
        }
      ),
      { numRuns: 200 }
    );
  });
});
