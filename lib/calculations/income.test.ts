import { describe, expect, it } from "vitest";
import { grossAnnualRevenue } from "./income";

describe("grossAnnualRevenue", () => {
  it("multiplies day rate by days/week by weeks/year", () => {
    // £500/day × 5 days × 46 weeks = £115,000
    expect(
      grossAnnualRevenue({ dayRate: 500, daysPerWeek: 5, weeksPerYear: 46 }),
    ).toBe(115_000);
  });

  it("handles fractional working days (e.g. 4.5 days/week)", () => {
    // £400/day × 4.5 days × 48 weeks = £86,400
    expect(
      grossAnnualRevenue({ dayRate: 400, daysPerWeek: 4.5, weeksPerYear: 48 }),
    ).toBe(86_400);
  });

  it("returns 0 when any input is 0", () => {
    expect(
      grossAnnualRevenue({ dayRate: 0, daysPerWeek: 5, weeksPerYear: 46 }),
    ).toBe(0);
    expect(
      grossAnnualRevenue({ dayRate: 500, daysPerWeek: 0, weeksPerYear: 46 }),
    ).toBe(0);
    expect(
      grossAnnualRevenue({ dayRate: 500, daysPerWeek: 5, weeksPerYear: 0 }),
    ).toBe(0);
  });

  it("returns 0 for negative inputs rather than a negative revenue", () => {
    expect(
      grossAnnualRevenue({ dayRate: -500, daysPerWeek: 5, weeksPerYear: 46 }),
    ).toBe(0);
  });

  it("returns 0 for non-finite inputs (NaN / Infinity)", () => {
    expect(
      grossAnnualRevenue({ dayRate: NaN, daysPerWeek: 5, weeksPerYear: 46 }),
    ).toBe(0);
    expect(
      grossAnnualRevenue({
        dayRate: Infinity,
        daysPerWeek: 5,
        weeksPerYear: 46,
      }),
    ).toBe(0);
  });
});
