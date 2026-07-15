import { describe, expect, it } from "vitest";
import { class1EmployeeNI, class4NI, employerNI } from "./nationalInsurance";

describe("class1EmployeeNI", () => {
  it("is £0 at or below the primary threshold", () => {
    expect(class1EmployeeNI(12_570)).toBe(0);
  });

  it("charges 8% up to the upper earnings limit (£50,270)", () => {
    // 37,700 × 8% = 3,016
    expect(class1EmployeeNI(50_270)).toBeCloseTo(3_016, 2);
  });

  it("charges 2% above the upper earnings limit (£60,000)", () => {
    // 3,016 + 9,730×2% = 3,016 + 194.60
    expect(class1EmployeeNI(60_000)).toBeCloseTo(3_210.6, 2);
  });
});

describe("class4NI", () => {
  it("is £0 at or below the lower profits limit", () => {
    expect(class4NI(12_570)).toBe(0);
  });

  it("charges 6% up to the upper profits limit (£50,270)", () => {
    // 37,700 × 6% = 2,262
    expect(class4NI(50_270)).toBeCloseTo(2_262, 2);
  });

  it("charges 2% above the upper profits limit (£60,000)", () => {
    // 2,262 + 9,730×2% = 2,262 + 194.60
    expect(class4NI(60_000)).toBeCloseTo(2_456.6, 2);
  });
});

describe("employerNI", () => {
  it("is £0 at or below the secondary threshold (£5,000)", () => {
    expect(employerNI(5_000)).toBe(0);
  });

  it("charges 15% above the secondary threshold (£12,570 salary)", () => {
    // (12,570 - 5,000) × 15% = 1,135.50
    expect(employerNI(12_570)).toBeCloseTo(1_135.5, 2);
  });
});
