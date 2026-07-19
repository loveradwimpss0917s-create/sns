import { describe, expect, it } from "vitest";
import { BRAND_COLORS, PLATFORM_LABELS } from "./brand";

describe("BRAND_COLORS", () => {
  it("exposes exactly the 4 palette colors from the design doc (§1-5)", () => {
    expect(Object.keys(BRAND_COLORS)).toEqual(["cream", "moss", "ember", "ink"]);
    for (const hex of Object.values(BRAND_COLORS)) {
      expect(hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});

describe("PLATFORM_LABELS", () => {
  it("covers all three platforms", () => {
    expect(Object.keys(PLATFORM_LABELS).sort()).toEqual(["instagram", "tiktok", "youtube"]);
  });
});
