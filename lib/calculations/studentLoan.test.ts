import { describe, expect, it } from "vitest";
import { getRates } from "../constants";
import { studentLoanRepayment } from "./studentLoan";

const r2627 = getRates("2026/27");
const r2425 = getRates("2024/25");

describe("studentLoanRepayment", () => {
  it("is £0 with no plan selected", () => {
    expect(studentLoanRepayment(60_000, r2627).total).toBe(0);
  });

  it("is £0 below the threshold", () => {
    expect(studentLoanRepayment(26_900, r2627, { plan: "plan1" }).total).toBe(0);
  });

  it("charges 9% above the Plan 1 threshold (2026/27)", () => {
    // (60,000 - 26,900) x 9% = 2,979
    expect(studentLoanRepayment(60_000, r2627, { plan: "plan1" }).total).toBeCloseTo(
      2_979,
      2,
    );
  });

  it("charges 9% above the Plan 2 threshold (2026/27)", () => {
    // (60,000 - 29,385) x 9% = 2,755.35
    expect(studentLoanRepayment(60_000, r2627, { plan: "plan2" }).total).toBeCloseTo(
      2_755.35,
      2,
    );
  });

  it("uses each year's own threshold", () => {
    // 2024/25 Plan 2 threshold was £27,295, not £29,385.
    expect(studentLoanRepayment(60_000, r2425, { plan: "plan2" }).total).toBeCloseTo(
      (60_000 - 27_295) * 0.09,
      2,
    );
  });

  it("charges 6% for postgraduate loans", () => {
    // (60,000 - 21,000) x 6% = 2,340
    expect(
      studentLoanRepayment(60_000, r2627, { plan: "postgraduate" }).total,
    ).toBeCloseTo(2_340, 2);
  });

  it("charges both when an undergraduate and postgraduate loan are held", () => {
    const result = studentLoanRepayment(60_000, r2627, {
      plan: "plan2",
      hasPostgraduateLoan: true,
    });
    expect(result.planRepayment).toBeCloseTo(2_755.35, 2);
    expect(result.postgraduateRepayment).toBeCloseTo(2_340, 2);
    expect(result.total).toBeCloseTo(5_095.35, 2);
  });

  it("flags Plan 5 as unavailable before 2026/27 rather than charging nothing", () => {
    const before = studentLoanRepayment(60_000, r2425, { plan: "plan5" });
    expect(before.planUnavailable).toBe(true);
    expect(before.total).toBe(0);

    const now = studentLoanRepayment(60_000, r2627, { plan: "plan5" });
    expect(now.planUnavailable).toBe(false);
    // (60,000 - 25,000) x 9% = 3,150
    expect(now.total).toBeCloseTo(3_150, 2);
  });
});
