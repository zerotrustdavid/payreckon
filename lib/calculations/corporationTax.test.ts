import { describe, expect, it } from "vitest";
import { corporationTax } from "./corporationTax";

describe("corporationTax", () => {
  it("applies the 19% small profits rate at or below £50,000", () => {
    expect(corporationTax(40_000)).toBeCloseTo(7_600, 2);
    expect(corporationTax(50_000)).toBeCloseTo(9_500, 2);
  });

  it("applies the 25% main rate at or above £250,000", () => {
    expect(corporationTax(250_000)).toBeCloseTo(62_500, 2);
    expect(corporationTax(300_000)).toBeCloseTo(75_000, 2);
  });

  it("applies marginal relief between the limits (£100,000)", () => {
    // 25,000 - (250,000-100,000)×3/200 = 25,000 - 2,250 = 22,750
    expect(corporationTax(100_000)).toBeCloseTo(22_750, 2);
  });

  it("is continuous at the £50,000 boundary", () => {
    // Marginal-relief formula must equal the small-profits result at £50,000
    expect(corporationTax(50_000)).toBeCloseTo(50_000 * 0.19, 2);
  });

  it("returns 0 for zero or negative profit", () => {
    expect(corporationTax(0)).toBe(0);
    expect(corporationTax(-10_000)).toBe(0);
  });
});
