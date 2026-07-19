import { describe, expect, it } from "vitest";
import { postInputSchema, revenueEntryInputSchema } from "./schemas";

describe("postInputSchema", () => {
  it("accepts a minimal valid post", () => {
    const result = postInputSchema.safeParse({
      platform: "youtube",
      title: "雨の日の、長い午後。",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown platform", () => {
    const result = postInputSchema.safeParse({ platform: "facebook", title: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = postInputSchema.safeParse({ platform: "tiktok", title: "" });
    expect(result.success).toBe(false);
  });
});

describe("revenueEntryInputSchema", () => {
  it("accepts a valid revenue entry", () => {
    const result = revenueEntryInputSchema.safeParse({
      source: "lut_sale",
      amountJpy: 3000,
      occurredAt: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown source", () => {
    const result = revenueEntryInputSchema.safeParse({
      source: "patreon",
      amountJpy: 100,
      occurredAt: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });
});
