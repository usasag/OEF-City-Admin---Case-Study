/**
 * Pure ordering helper for climate-action lists.
 *
 * Extracted from `climate-actions.ts` so it can be imported without dragging
 * in the Supabase client (which is initialized at module load and requires
 * environment variables to be set). This makes the sorting invariant
 * (Property 3, Requirements 2.4) testable without a live database or env.
 */

/**
 * Public dashboard ordering: start_year DESC, then title ASC.
 *
 * Non-mutating: returns a new array. Generic over any item shape that exposes
 * `startYear` and `title`, so it can be reused in tests with minimal fixtures.
 */
export function sortActionsByStartYearDescTitleAsc<
  T extends { startYear: number; title: string },
>(actions: readonly T[]): T[] {
  return [...actions].sort((a, b) => {
    if (a.startYear !== b.startYear) {
      // start_year DESC: larger year first.
      return b.startYear - a.startYear;
    }
    // title ASC: lexicographic JS string compare.
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
  });
}
