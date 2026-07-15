import { NATIONAL_INSURANCE } from "../constants/tax-rates-2026-27";

/**
 * Class 1 employee National Insurance — used for Inside IR35 (deemed employment)
 * and for a Ltd director's salary. 8% between the primary threshold and the upper
 * earnings limit, 2% above.
 */
export function class1EmployeeNI(earnings: number): number {
  if (!Number.isFinite(earnings) || earnings <= 0) return 0;
  const { primaryThreshold, upperEarningsLimit, mainRate, upperRate } =
    NATIONAL_INSURANCE.class1Employee;

  const main = Math.max(0, Math.min(earnings, upperEarningsLimit) - primaryThreshold);
  const upper = Math.max(0, earnings - upperEarningsLimit);
  return main * mainRate + upper * upperRate;
}

/**
 * Class 4 self-employed National Insurance — used for the sole-trader mode.
 * 6% between the lower and upper profits limits, 2% above. (Class 2 is £0
 * mandatory for 2026/27 and is not added.)
 */
export function class4NI(profits: number): number {
  if (!Number.isFinite(profits) || profits <= 0) return 0;
  const { lowerProfitsLimit, upperProfitsLimit, mainRate, upperRate } =
    NATIONAL_INSURANCE.class4SelfEmployed;

  const main = Math.max(0, Math.min(profits, upperProfitsLimit) - lowerProfitsLimit);
  const upper = Math.max(0, profits - upperProfitsLimit);
  return main * mainRate + upper * upperRate;
}

/**
 * Employer (secondary) Class 1 National Insurance on a Ltd director's salary.
 * 15% above the £5,000 secondary threshold. The Employment Allowance is not
 * applied (a sole-director company with no other employees is generally
 * ineligible).
 */
export function employerNI(salary: number): number {
  if (!Number.isFinite(salary) || salary <= 0) return 0;
  const { secondaryThreshold, rate } = NATIONAL_INSURANCE.class1Employer;
  return Math.max(0, salary - secondaryThreshold) * rate;
}
