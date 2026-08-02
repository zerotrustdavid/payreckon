import { describe, expect, it } from "vitest";
import {
  annualise,
  perPeriod,
  periodsPerYear,
  workingDaysBetween,
} from "./annualise";

const pattern = {
  hoursPerWeek: 37.5,
  weeksPerYear: 46,
  daysPerYear: 230,
  monthsPerYear: 12,
};

describe("annualise", () => {
  it("annualises a day rate over days worked", () => {
    expect(annualise(500, "day", pattern)).toBe(115_000);
  });

  it("annualises an hourly rate over hours actually worked", () => {
    // 65 x 37.5 x 46 = 112,125
    expect(annualise(65, "hour", pattern)).toBeCloseTo(112_125, 6);
  });

  it("annualises weekly and monthly rates", () => {
    expect(annualise(2_500, "week", pattern)).toBe(115_000);
    expect(annualise(9_000, "month", pattern)).toBe(108_000);
  });

  it("passes an annual rate straight through", () => {
    expect(annualise(115_000, "year", pattern)).toBe(115_000);
  });

  it("returns 0 for invalid or non-positive input", () => {
    expect(annualise(0, "day", pattern)).toBe(0);
    expect(annualise(-500, "day", pattern)).toBe(0);
    expect(annualise(NaN, "day", pattern)).toBe(0);
  });

  it("falls back to defaults when the pattern is blank or zero", () => {
    // A zero weeks-per-year must not collapse the result to zero.
    expect(annualise(2_500, "week", { weeksPerYear: 0 })).toBe(2_500 * 46);
  });
});

describe("perPeriod", () => {
  it("round-trips with annualise", () => {
    const annual = annualise(500, "day", pattern);
    expect(perPeriod(annual, "day", pattern)).toBeCloseTo(500, 6);
  });

  it("divides by twelve for months", () => {
    expect(perPeriod(120_000, "month", pattern)).toBe(10_000);
  });

  it("uses hours actually worked, not a nominal year", () => {
    // 115,000 / (37.5 x 46) = 66.666...
    expect(perPeriod(115_000, "hour", pattern)).toBeCloseTo(66.6667, 3);
  });
});

describe("periodsPerYear", () => {
  it("reports the working pattern's own counts", () => {
    expect(periodsPerYear("day", pattern)).toBe(230);
    expect(periodsPerYear("week", pattern)).toBe(46);
    expect(periodsPerYear("year", pattern)).toBe(1);
  });
});

describe("workingDaysBetween", () => {
  it("counts weekdays inclusive", () => {
    // Mon 5 Jan 2026 to Fri 9 Jan 2026 = 5 working days.
    expect(workingDaysBetween(new Date(2026, 0, 5), new Date(2026, 0, 9))).toBe(5);
  });

  it("excludes weekends", () => {
    // Mon 5 Jan to Sun 11 Jan spans 7 days but only 5 are weekdays.
    expect(workingDaysBetween(new Date(2026, 0, 5), new Date(2026, 0, 11))).toBe(5);
  });

  it("handles a full contract span", () => {
    // 6 Apr 2026 (Mon) to 3 Jul 2026 (Fri) inclusive.
    expect(
      workingDaysBetween(new Date(2026, 3, 6), new Date(2026, 6, 3)),
    ).toBe(65);
  });

  it("returns 0 when the end precedes the start or dates are invalid", () => {
    expect(workingDaysBetween(new Date(2026, 0, 9), new Date(2026, 0, 5))).toBe(0);
    expect(workingDaysBetween(new Date("nope"), new Date(2026, 0, 5))).toBe(0);
  });
});
