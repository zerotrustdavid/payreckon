import { describe, expect, it } from "vitest";
import { getRates } from "../constants";
import { corporationTax } from "./corporationTax";

const rates = getRates("2026/27");

describe("corporationTax", () => {
  it("applies the 19% small profits rate at or below £50,000", () => {
    expect(corporationTax(40_000, rates).total).toBeCloseTo(7_600, 2);
    expect(corporationTax(50_000, rates).total).toBeCloseTo(9_500, 2);
    expect(corporationTax(40_000, rates).basis).toBe("small-profits");
  });

  it("applies the 25% main rate at or above £250,000", () => {
    expect(corporationTax(250_000, rates).total).toBeCloseTo(62_500, 2);
    expect(corporationTax(300_000, rates).total).toBeCloseTo(75_000, 2);
    expect(corporationTax(300_000, rates).basis).toBe("main-rate");
  });

  it("applies marginal relief between the limits (£100,000)", () => {
    // 25,000 - (250,000 - 100,000) x 3/200 = 25,000 - 2,250 = 22,750
    const result = corporationTax(100_000, rates);
    expect(result.total).toBeCloseTo(22_750, 2);
    expect(result.marginalRelief).toBeCloseTo(2_250, 2);
    expect(result.basis).toBe("marginal-relief");
  });

  it("reports an effective rate between the small-profits and main rates", () => {
    const { effectiveRate } = corporationTax(100_000, rates);
    expect(effectiveRate).toBeGreaterThan(0.19);
    expect(effectiveRate).toBeLessThan(0.25);
    expect(effectiveRate).toBeCloseTo(0.2275, 4);
  });

  it("is continuous at the £50,000 boundary", () => {
    expect(corporationTax(50_000, rates).total).toBeCloseTo(50_000 * 0.19, 2);
    // £1 more profit costs 26.5p — the known marginal rate between the limits —
    // so the two formulas meet without a step.
    expect(corporationTax(50_001, rates).total).toBeCloseTo(9_500.265, 3);
    expect(
      corporationTax(50_001, rates).total - corporationTax(50_000, rates).total,
    ).toBeCloseTo(0.265, 3);
  });

  it("is continuous at the £250,000 boundary", () => {
    expect(corporationTax(249_999, rates).total).toBeCloseTo(62_499.73, 1);
    expect(corporationTax(250_000, rates).total).toBeCloseTo(62_500, 2);
  });

  it("returns 0 for zero or negative profit", () => {
    expect(corporationTax(0, rates).total).toBe(0);
    expect(corporationTax(-10_000, rates).total).toBe(0);
    expect(corporationTax(0, rates).basis).toBe("none");
  });

  it("is the same across all three years (rates unchanged)", () => {
    for (const year of ["2024/25", "2025/26", "2026/27"] as const) {
      expect(corporationTax(100_000, getRates(year)).total).toBeCloseTo(22_750, 2);
    }
  });
});
