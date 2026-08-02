import { describe, expect, it } from "vitest";
import { getRates } from "../constants";
import { class1EmployeeNI, class4NI, employerNI } from "./nationalInsurance";

const r2627 = getRates("2026/27");
const r2526 = getRates("2025/26");
const r2425 = getRates("2024/25");

describe("class1EmployeeNI", () => {
  it("is £0 at or below the primary threshold", () => {
    expect(class1EmployeeNI(12_570, r2627)).toBe(0);
  });

  it("charges 8% up to the upper earnings limit (£50,270)", () => {
    // 37,700 x 8% = 3,016
    expect(class1EmployeeNI(50_270, r2627)).toBeCloseTo(3_016, 2);
  });

  it("charges 2% above the upper earnings limit (£60,000)", () => {
    // 3,016 + 9,730 x 2% = 3,210.60
    expect(class1EmployeeNI(60_000, r2627)).toBeCloseTo(3_210.6, 2);
  });

  it("is unchanged across all three years for category A", () => {
    for (const rates of [r2425, r2526, r2627]) {
      expect(class1EmployeeNI(60_000, rates)).toBeCloseTo(3_210.6, 2);
    }
  });

  it("charges nothing for category C (over State Pension age)", () => {
    expect(class1EmployeeNI(60_000, r2627, "C")).toBe(0);
  });

  it("charges the reduced rate for category B", () => {
    // 37,700 x 1.85% + 9,730 x 2% = 697.45 + 194.60
    expect(class1EmployeeNI(60_000, r2627, "B")).toBeCloseTo(892.05, 2);
  });

  it("charges the upper rate only for deferred categories (J)", () => {
    // 37,700 x 2% + 9,730 x 2% = 754 + 194.60 = 948.60
    expect(class1EmployeeNI(60_000, r2627, "J")).toBeCloseTo(948.6, 2);
  });
});

describe("employerNI", () => {
  it("is £0 at or below the secondary threshold", () => {
    expect(employerNI(5_000, r2627)).toBe(0);
    expect(employerNI(9_100, r2425)).toBe(0);
  });

  it("charges 15% above the £5,000 threshold in 2026/27", () => {
    // (12,570 - 5,000) x 15% = 1,135.50
    expect(employerNI(12_570, r2627)).toBeCloseTo(1_135.5, 2);
  });

  it("charges 13.8% above the £9,100 threshold in 2024/25", () => {
    // (12,570 - 9,100) x 13.8% = 478.86
    expect(employerNI(12_570, r2425)).toBeCloseTo(478.86, 2);
  });

  it("matches 2026/27 in 2025/26 (same rate and threshold)", () => {
    expect(employerNI(12_570, r2526)).toBeCloseTo(1_135.5, 2);
  });

  it("is £0 below the upper secondary threshold for under-21s (M)", () => {
    expect(employerNI(50_270, r2627, "M")).toBe(0);
    // Above the UST the standard rate applies to the excess only.
    expect(employerNI(60_000, r2627, "M")).toBeCloseTo((60_000 - 50_270) * 0.15, 2);
  });

  it("treats apprentices (H) and veterans (V) the same way", () => {
    expect(employerNI(45_000, r2627, "H")).toBe(0);
    expect(employerNI(45_000, r2627, "V")).toBe(0);
  });
});

describe("class4NI", () => {
  it("is £0 at or below the lower profits limit", () => {
    expect(class4NI(12_570, r2627)).toBe(0);
  });

  it("charges 6% up to the upper profits limit (£50,270)", () => {
    // 37,700 x 6% = 2,262
    expect(class4NI(50_270, r2627)).toBeCloseTo(2_262, 2);
  });

  it("charges 2% above the upper profits limit (£60,000)", () => {
    // 2,262 + 9,730 x 2% = 2,456.60
    expect(class4NI(60_000, r2627)).toBeCloseTo(2_456.6, 2);
  });

  it("is unchanged across all three years", () => {
    for (const rates of [r2425, r2526, r2627]) {
      expect(class4NI(60_000, rates)).toBeCloseTo(2_456.6, 2);
    }
  });
});
