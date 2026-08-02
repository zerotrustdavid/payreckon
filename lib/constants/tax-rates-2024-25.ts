import { buildNICategories } from "./niCategories";
import type { TaxYearRates } from "./types";

/**
 * UK tax rates and thresholds for 2024/25 (6 April 2024 – 5 April 2025).
 *
 * Every figure verified against gov.uk / gov.scot on 2026-08-02, cited per section.
 * Historical year — do not edit.
 *
 * Context for this year: employee Class 1 NI had been cut to 8% and Class 4 to 6%
 * from 6 April 2024, while employer NI was still 13.8% on a £9,100 secondary
 * threshold (both changed the following year).
 */
export const RATES_2024_25: TaxYearRates = {
  taxYear: "2024/25",

  /**
   * England/Wales/NI: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2024-to-2025
   * Scotland: https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/rates-and-bands-2024-to-2025/
   *   (gross ranges converted to taxable income by subtracting the £12,570 personal
   *    allowance — e.g. starter £12,571–£14,876 becomes taxable up to £2,306.)
   */
  incomeTax: {
    personalAllowance: 12_570,
    personalAllowanceTaperThreshold: 100_000,
    personalAllowanceTaperRate: 0.5,
    ukBands: [
      { name: "Basic rate", rate: 0.2, taxableUpTo: 37_700 },
      { name: "Higher rate", rate: 0.4, taxableUpTo: 125_140 },
      { name: "Additional rate", rate: 0.45, taxableUpTo: Infinity },
    ],
    scottishBands: [
      { name: "Starter rate", rate: 0.19, taxableUpTo: 2_306 },
      { name: "Basic rate", rate: 0.2, taxableUpTo: 13_991 },
      { name: "Intermediate rate", rate: 0.21, taxableUpTo: 31_092 },
      { name: "Higher rate", rate: 0.42, taxableUpTo: 62_430 },
      { name: "Advanced rate", rate: 0.45, taxableUpTo: 125_140 },
      { name: "Top rate", rate: 0.48, taxableUpTo: Infinity },
    ],
  },

  /**
   * https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2024-to-2025
   * Category letters: https://www.gov.uk/national-insurance-rates-letters
   */
  nationalInsurance: {
    class1: {
      primaryThreshold: 12_570,
      upperEarningsLimit: 50_270,
      secondaryThreshold: 9_100,
      employmentAllowance: 5_000,
    },
    categories: buildNICategories({
      employerRate: 0.138,
      upperSecondaryThreshold: 50_270,
      employeeMainRate: 0.08,
      employeeUpperRate: 0.02,
      reducedRate: 0.0185,
    }),
    class4SelfEmployed: {
      lowerProfitsLimit: 12_570,
      upperProfitsLimit: 50_270,
      mainRate: 0.06,
      upperRate: 0.02,
    },
  },

  /**
   * Financial year beginning 1 April 2024, non-ring-fence.
   * https://www.gov.uk/government/publications/rates-and-allowances-corporation-tax/rates-and-allowances-corporation-tax
   */
  corporationTax: {
    smallProfitsRate: 0.19,
    mainRate: 0.25,
    marginalReliefLowerLimit: 50_000,
    marginalReliefUpperLimit: 250_000,
    marginalReliefFraction: 3 / 200,
  },

  /** https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past */
  dividendTax: {
    allowance: 500,
    ordinaryRate: 0.0875,
    upperRate: 0.3375,
    additionalRate: 0.3935,
  },

  /**
   * https://www.gov.uk/government/publications/sl3-student-loan-deduction-tables/2024-to-2025-student-and-postgraduate-loan-deduction-tables
   * Plan 5 was not yet repayable in 2024/25.
   */
  studentLoans: {
    plan1: { threshold: 24_990, rate: 0.09 },
    plan2: { threshold: 27_295, rate: 0.09 },
    plan4: { threshold: 31_395, rate: 0.09 },
    plan5: null,
    postgraduate: { threshold: 21_000, rate: 0.06 },
  },

  /** https://www.gov.uk/guidance/pay-apprenticeship-levy */
  apprenticeshipLevy: {
    rate: 0.005,
    allowance: 15_000,
  },

  autoEnrolment: {
    lowerQualifyingEarnings: 6_240,
    upperQualifyingEarnings: 50_270,
    earningsTrigger: 10_000,
  },

  /** https://www.gov.uk/blind-persons-allowance/what-youll-get */
  allowances: {
    blindPersons: 3_070,
    marriageAllowanceTransfer: 1_260,
  },

  /**
   * BADR was 10% for disposals before 6 April 2025.
   * https://www.gov.uk/government/publications/changes-to-the-rates-of-capital-gains-tax/capital-gains-tax-rates-of-tax
   */
  badrRate: 0.1,

  holidayAccrualRate: 0.1207,
};
