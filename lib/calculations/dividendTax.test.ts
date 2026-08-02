import { describe, expect, it } from "vitest";
import { getRates } from "../constants";
import { dividendTax } from "./dividendTax";

const r2627 = getRates("2026/27");
const r2526 = getRates("2025/26");

describe("dividendTax — 2026/27", () => {
  it("returns £0 when there are no dividends", () => {
    expect(dividendTax(12_570, 0, r2627).total).toBe(0);
  });

  it("zero-rates dividends within the £500 allowance", () => {
    expect(dividendTax(12_570, 400, r2627).total).toBe(0);
  });

  it("taxes basic-band dividends at 10.75% after the allowance", () => {
    // 30,000 dividends: first 500 free, 29,500 x 10.75%
    expect(dividendTax(12_570, 30_000, r2627).total).toBeCloseTo(3_171.25, 2);
  });

  it("splits dividends across basic and upper bands", () => {
    // basic 37,700 - 500 allowance = 37,200 x 10.75% = 3,999
    // upper 12,300 x 35.75% = 4,397.25
    expect(dividendTax(12_570, 50_000, r2627).total).toBeCloseTo(8_396.25, 2);
  });

  it("uses leftover personal allowance to cover dividends", () => {
    // salary 5,000 leaves 7,570 of allowance; then 500 dividend allowance;
    // 1,930 x 10.75% = 207.475
    expect(dividendTax(5_000, 10_000, r2627).total).toBeCloseTo(207.475, 2);
  });

  it("reaches the additional dividend rate of 39.35%", () => {
    // PA fully tapered at total 142,570:
    // 24,630 x 10.75% + 87,440 x 35.75% + 17,430 x 39.35%
    expect(dividendTax(12_570, 130_000, r2627).total).toBeCloseTo(40_766.23, 2);
  });

  it("produces bands that sum to the total", () => {
    const result = dividendTax(12_570, 50_000, r2627);
    const summed = result.bands.reduce((s, b) => s + b.tax, 0);
    expect(summed).toBeCloseTo(result.total, 6);
  });
});

describe("dividendTax — earlier years use the lower rates", () => {
  it("charges 8.75% / 33.75% in 2025/26", () => {
    // basic 37,200 x 8.75% = 3,255; upper 12,300 x 33.75% = 4,151.25
    expect(dividendTax(12_570, 50_000, r2526).total).toBeCloseTo(7_406.25, 2);
  });

  it("is cheaper than 2026/27 for the same dividends", () => {
    expect(dividendTax(12_570, 50_000, r2526).total).toBeLessThan(
      dividendTax(12_570, 50_000, r2627).total,
    );
  });
});

describe("dividendTax — band boundaries", () => {
  it("charges dividends against UK band widths, not Scottish ones", () => {
    // Scottish rates apply to earned income only; dividends always use UK bands.
    // With salary exactly covering the personal allowance, dividends filling the
    // whole UK basic-rate band stay at the ordinary rate — the Scottish
    // higher-rate threshold (£43,662) must not pull any of it into the upper rate.
    const result = dividendTax(12_570, 37_700, r2627);
    expect(result.total).toBeCloseTo((37_700 - 500) * 0.1075, 2);
    expect(result.bands.every((b) => b.rate === 0 || b.rate === 0.1075)).toBe(true);
  });

  it("moves into the upper rate only once the UK basic band is full", () => {
    // One pound more than the basic band is charged at the upper rate.
    const result = dividendTax(12_570, 38_700, r2627);
    const upper = result.bands.find((b) => b.rate === 0.3575);
    expect(upper?.amount).toBeCloseTo(1_000, 6);
  });
});
