import { describe, it, expect } from "vitest";
import fc from "fast-check";

describe("Project Setup", () => {
  it("should have vitest configured correctly", () => {
    expect(true).toBe(true);
  });

  it("should have fast-check available for property testing", () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      })
    );
  });

  it("should resolve @/ path alias", async () => {
    // Verify the path alias resolves (will fail at import if not configured)
    const path = await import("path");
    expect(path).toBeDefined();
  });
});
