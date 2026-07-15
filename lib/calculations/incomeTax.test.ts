import { describe, expect, it } from "vitest";
import { incomeTax, personalAllowance } from "./incomeTax";

describe("personalAllowance (taper)", () => {
  it("is the full £12,570 up to £100,000", () => {
    expect(personalAllowance(50_000)).toBe(12_570);
    expect(personalAllowance(100_000)).toBe(12_570);
  });

  it("tapers by £1 for every £2 above £100,000", () => {
    // £115,000 -> 12,570 - (15,000/2) = 5,070
    expect(personalAllowance(115_000)).toBe(5_070);
  });

  it("reaches £0 at £125,140", () => {
    expect(personalAllowance(125_140)).toBe(0);
    expect(personalAllowance(200_000)).toBe(0);
  });
});

describe("incomeTax", () => {
  it("is £0 at or below the personal allowance", () => {
    expect(incomeTax(12_570)).toBe(0);
    expect(incomeTax(0)).toBe(0);
  });

  it("taxes the full basic-rate band at 20% (income £50,270)", () => {
    // 37,700 × 20% = 7,540
    expect(incomeTax(50_270)).toBeCloseTo(7_540, 2);
  });

  it("applies the 40% band above £50,270 (income £60,000)", () => {
    // basic 37,700×20% = 7,540; higher 9,730×40% = 3,892
    expect(incomeTax(60_000)).toBeCloseTo(11_432, 2);
  });

  it("handles the personal-allowance taper (income £115,000)", () => {
    // PA 5,070; basic 37,700×20% = 7,540; higher (115,000-42,770)=72,230×40% = 28,892
    expect(incomeTax(115_000)).toBeCloseTo(36_432, 2);
  });

  it("reaches the additional rate correctly at £125,140 (PA fully tapered)", () => {
    // PA 0; 37,700×20% + 87,440×40% = 7,540 + 34,976 = 42,516
    expect(incomeTax(125_140)).toBeCloseTo(42_516, 2);
  });
});
