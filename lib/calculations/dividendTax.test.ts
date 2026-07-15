import { describe, expect, it } from "vitest";
import { dividendTax } from "./dividendTax";

describe("dividendTax", () => {
  it("returns £0 when there are no dividends", () => {
    expect(dividendTax(12_570, 0)).toBe(0);
  });

  it("zero-rates dividends within the £500 allowance", () => {
    expect(dividendTax(12_570, 400)).toBe(0);
  });

  it("taxes basic-band dividends at 10.75% after the allowance", () => {
    // salary 12,570 uses the PA; dividends 30,000: first 500 free, 29,500 × 10.75%
    expect(dividendTax(12_570, 30_000)).toBeCloseTo(3_171.25, 2);
  });

  it("splits dividends across basic and upper bands", () => {
    // salary 12,570, dividends 50,000:
    //  basic 12,570->50,270 = 37,700, minus 500 allowance = 37,200 × 10.75% = 3,999
    //  upper 50,270->62,570 = 12,300 × 35.75% = 4,397.25
    expect(dividendTax(12_570, 50_000)).toBeCloseTo(8_396.25, 2);
  });

  it("uses leftover personal allowance to cover dividends when salary is below the PA", () => {
    // salary 5,000, dividends 10,000: PA covers up to 12,570, so 7,570 of dividends free,
    // then 500 allowance, leaving 1,930 × 10.75% = 207.475
    expect(dividendTax(5_000, 10_000)).toBeCloseTo(207.475, 2);
  });

  it("reaches the additional dividend rate of 39.35%", () => {
    // salary 12,570, dividends 130,000 (total 142,570 -> PA fully tapered to 0):
    //  basic 12,570->37,700 = 25,130, minus 500 = 24,630 × 10.75% = 2,647.725
    //  upper 37,700->125,140 = 87,440 × 35.75% = 31,259.8
    //  additional 125,140->142,570 = 17,430 × 39.35% = 6,858.705
    expect(dividendTax(12_570, 130_000)).toBeCloseTo(40_766.23, 2);
  });
});
