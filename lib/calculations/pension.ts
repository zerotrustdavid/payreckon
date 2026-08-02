import type { TaxYearRates } from "../constants/types";

/**
 * How the employee's own pension contribution is made. The method changes which
 * taxes the contribution escapes, which is why it materially affects take-home.
 *
 *  • salary-sacrifice — gross pay is reduced before tax AND National Insurance,
 *    and the employer's NI falls too (the saving often funds a larger contribution).
 *  • net-pay — deducted from pay before income tax but after NI. The typical
 *    occupational/workplace scheme.
 *  • relief-at-source — paid from net pay; the provider reclaims basic-rate relief,
 *    and higher-rate relief is given by extending the basic-rate band.
 */
export type PensionMethod = "none" | "salary-sacrifice" | "net-pay" | "relief-at-source";

export type PensionBasis = "percentage" | "fixed";

export interface PensionInput {
  method: PensionMethod;
  basis: PensionBasis;
  /** Percentage (0–100) when basis is 'percentage', otherwise an annual amount. */
  value: number;
  /** Employer contribution, same basis. Deducted from the assignment rate in
   *  umbrella working, and an allowable expense for a limited company. */
  employerValue?: number;
  /** Restrict the percentage to auto-enrolment qualifying earnings only. */
  useQualifyingEarnings?: boolean;
}

export interface PensionResult {
  employeeContribution: number;
  employerContribution: number;
  /** Amount removed from pay before income tax is calculated. */
  taxRelievedAmount: number;
  /** Amount removed from pay before National Insurance is calculated. */
  niRelievedAmount: number;
  /** Basic-rate band extension for relief-at-source schemes. */
  bandExtension: number;
  totalContribution: number;
}

/** Earnings the percentage applies to, honouring the qualifying-earnings band. */
function contributionBase(
  grossPay: number,
  rates: TaxYearRates,
  useQualifyingEarnings: boolean,
): number {
  if (!useQualifyingEarnings) return grossPay;
  const { lowerQualifyingEarnings, upperQualifyingEarnings } = rates.autoEnrolment;
  return Math.max(
    0,
    Math.min(grossPay, upperQualifyingEarnings) - lowerQualifyingEarnings,
  );
}

function amountFor(
  input: Pick<PensionInput, "basis">,
  value: number,
  base: number,
): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return input.basis === "percentage" ? base * (value / 100) : value;
}

/**
 * Works out the pension contributions and which taxes each one escapes.
 *
 * `grossPay` is pay before any pension deduction.
 */
export function pensionContributions(
  grossPay: number,
  rates: TaxYearRates,
  input: PensionInput,
): PensionResult {
  const gross = Math.max(0, Number.isFinite(grossPay) ? grossPay : 0);
  const empty: PensionResult = {
    employeeContribution: 0,
    employerContribution: 0,
    taxRelievedAmount: 0,
    niRelievedAmount: 0,
    bandExtension: 0,
    totalContribution: 0,
  };

  if (input.method === "none") return empty;

  const base = contributionBase(gross, rates, input.useQualifyingEarnings ?? false);
  const employeeContribution = Math.min(
    gross,
    amountFor(input, input.value, base),
  );
  const employerContribution = amountFor(input, input.employerValue ?? 0, base);

  const result: PensionResult = {
    ...empty,
    employeeContribution,
    employerContribution,
    totalContribution: employeeContribution + employerContribution,
  };

  switch (input.method) {
    case "salary-sacrifice":
      // Escapes both income tax and NI — the pay was never contractually made.
      result.taxRelievedAmount = employeeContribution;
      result.niRelievedAmount = employeeContribution;
      break;
    case "net-pay":
      // Escapes income tax only; NI is still charged on the full amount.
      result.taxRelievedAmount = employeeContribution;
      break;
    case "relief-at-source":
      // Paid from taxed pay. Basic-rate relief is added by the provider; any
      // higher-rate relief comes from extending the basic-rate band by the
      // grossed-up contribution.
      result.bandExtension = employeeContribution;
      break;
  }

  return result;
}
