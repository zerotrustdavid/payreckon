import type { NICategoryLetter, TaxYearRates } from "../constants/types";

/**
 * Class 1 employee National Insurance — used for Inside IR35 (deemed employment),
 * a limited company director's salary, and permanent employment.
 *
 * The category letter sets the rates: standard (A), reduced (B), nil for those over
 * State Pension age (C), or the upper rate only where contributions are deferred
 * (J, Z).
 */
export function class1EmployeeNI(
  earnings: number,
  rates: TaxYearRates,
  category: NICategoryLetter = "A",
): number {
  if (!Number.isFinite(earnings) || earnings <= 0) return 0;

  const { primaryThreshold, upperEarningsLimit } = rates.nationalInsurance.class1;
  const { employeeMain, employeeUpper } = rates.nationalInsurance.categories[category];

  const main = Math.max(
    0,
    Math.min(earnings, upperEarningsLimit) - primaryThreshold,
  );
  const upper = Math.max(0, earnings - upperEarningsLimit);

  return main * employeeMain + upper * employeeUpper;
}

/**
 * Employer (secondary) Class 1 National Insurance.
 *
 * Categories H (apprentice under 25), M (under 21), V (veteran's first civilian
 * year) and Z carry a 0% employer rate up to an upper secondary threshold, with the
 * standard rate applying only above it.
 */
export function employerNI(
  salary: number,
  rates: TaxYearRates,
  category: NICategoryLetter = "A",
): number {
  if (!Number.isFinite(salary) || salary <= 0) return 0;

  const { secondaryThreshold } = rates.nationalInsurance.class1;
  const { employerRate, employerZeroRateUpTo } =
    rates.nationalInsurance.categories[category];

  // Below the zero-rate ceiling the employer pays nothing; above it, the standard
  // rate applies to the excess only.
  const chargeableFrom = Math.max(secondaryThreshold, employerZeroRateUpTo);
  return Math.max(0, salary - chargeableFrom) * employerRate;
}

/**
 * The employer NI rate that applies at the margin for a given salary. Used by the
 * umbrella solver, which must invert employer NI algebraically.
 */
export function marginalEmployerNIRate(
  salary: number,
  rates: TaxYearRates,
  category: NICategoryLetter = "A",
): number {
  const { secondaryThreshold } = rates.nationalInsurance.class1;
  const { employerRate, employerZeroRateUpTo } =
    rates.nationalInsurance.categories[category];
  const chargeableFrom = Math.max(secondaryThreshold, employerZeroRateUpTo);
  return salary > chargeableFrom ? employerRate : 0;
}

/**
 * Class 4 self-employed National Insurance. Class 2 carries no mandatory charge
 * above the small-profits threshold in the years modelled, so it is not added.
 */
export function class4NI(profits: number, rates: TaxYearRates): number {
  if (!Number.isFinite(profits) || profits <= 0) return 0;

  const { lowerProfitsLimit, upperProfitsLimit, mainRate, upperRate } =
    rates.nationalInsurance.class4SelfEmployed;

  const main = Math.max(
    0,
    Math.min(profits, upperProfitsLimit) - lowerProfitsLimit,
  );
  const upper = Math.max(0, profits - upperProfitsLimit);

  return main * mainRate + upper * upperRate;
}
