import type { StudentLoanPlan, TaxYearRates } from "../constants/types";

export interface StudentLoanResult {
  total: number;
  planRepayment: number;
  postgraduateRepayment: number;
  /** True when the selected plan is not repayable in the chosen tax year. */
  planUnavailable: boolean;
}

/**
 * Student loan repayments.
 *
 * Repayments are a percentage of income above a plan-specific threshold: 9% for
 * Plans 1, 2, 4 and 5, and 6% for postgraduate loans. A borrower can hold both an
 * undergraduate plan and a postgraduate loan, in which case both are due, so they
 * are modelled independently rather than as one dropdown choice.
 *
 * Plan 5 only became repayable in 2026/27; selecting it for an earlier year
 * reports `planUnavailable` rather than silently charging nothing.
 *
 * Source: https://www.gov.uk/repaying-your-student-loan/what-you-pay
 */
export function studentLoanRepayment(
  income: number,
  rates: TaxYearRates,
  options: {
    plan?: StudentLoanPlan;
    hasPostgraduateLoan?: boolean;
  } = {},
): StudentLoanResult {
  const { plan = "none", hasPostgraduateLoan = false } = options;
  const safeIncome = Number.isFinite(income) && income > 0 ? income : 0;

  const charge = (band: { threshold: number; rate: number } | null): number =>
    band ? Math.max(0, safeIncome - band.threshold) * band.rate : 0;

  let planRepayment = 0;
  let planUnavailable = false;

  if (plan !== "none" && plan !== "postgraduate") {
    const band = rates.studentLoans[plan];
    if (band === null) {
      planUnavailable = true;
    } else {
      planRepayment = charge(band);
    }
  }

  // Postgraduate can be selected as the plan itself or held alongside another.
  const postgraduateSelected = plan === "postgraduate" || hasPostgraduateLoan;
  const postgraduateRepayment = postgraduateSelected
    ? charge(rates.studentLoans.postgraduate)
    : 0;

  return {
    total: planRepayment + postgraduateRepayment,
    planRepayment,
    postgraduateRepayment,
    planUnavailable,
  };
}
