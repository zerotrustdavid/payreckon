import { buildNICategories } from "./niCategories";
import type { TaxYearRates } from "./types";

/**
 * UK tax rates and thresholds for 2025/26 (6 April 2025 – 5 April 2026).
 *
 * Every figure verified against gov.uk / gov.scot on 2026-08-02, cited per section.
 * Historical year — do not edit.
 *
 * Notable changes in this year:
 *   • Employer NI rose from 13.8% to 15% and the secondary threshold fell from
 *     £9,100 to £5,000 (both from 6 April 2025).
 *   • Employment Allowance rose from £5,000 to £10,500.
 *   • Business Asset Disposal Relief rose from 10% to 14%.
 */
export const RATES_2025_26: TaxYearRates = {
  taxYear: "2025/26",

  /**
   * England/Wales/NI: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026
   * Scotland: https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/proposed-rates-and-bands-2025-to-2026/
   *   (gov.scot gross ranges converted to taxable income by subtracting the £12,570
   *    personal allowance — e.g. starter £12,571–£15,397 becomes taxable up to £2,827.)
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
      { name: "Starter rate", rate: 0.19, taxableUpTo: 2_827 },
      { name: "Basic rate", rate: 0.2, taxableUpTo: 14_921 },
      { name: "Intermediate rate", rate: 0.21, taxableUpTo: 31_092 },
      { name: "Higher rate", rate: 0.42, taxableUpTo: 62_430 },
      { name: "Advanced rate", rate: 0.45, taxableUpTo: 125_140 },
      { name: "Top rate", rate: 0.48, taxableUpTo: Infinity },
    ],
  },

  /**
   * https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2025-to-2026
   * Category letters: https://www.gov.uk/national-insurance-rates-letters
   * Class 4: https://www.gov.uk/self-employed-national-insurance-rates
   */
  nationalInsurance: {
    class1: {
      primaryThreshold: 12_570,
      upperEarningsLimit: 50_270,
      secondaryThreshold: 5_000,
      employmentAllowance: 10_500,
    },
    categories: buildNICategories({
      employerRate: 0.15,
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
   * Financial year beginning 1 April 2025, non-ring-fence.
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
   * https://www.gov.uk/guidance/previous-annual-repayment-thresholds
   * Plan 5 loans were not yet repayable in 2025/26 — the first Plan 5 repayments
   * fall due in 2026/27 — so it is null rather than zero here.
   */
  studentLoans: {
    plan1: { threshold: 26_065, rate: 0.09 },
    plan2: { threshold: 28_470, rate: 0.09 },
    plan4: { threshold: 32_745, rate: 0.09 },
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
    blindPersons: 3_130,
    marriageAllowanceTransfer: 1_260,
  },

  /**
   * BADR was 14% for disposals between 6 April 2025 and 5 April 2026.
   * https://www.gov.uk/government/publications/changes-to-the-rates-of-capital-gains-tax/capital-gains-tax-rates-of-tax
   */
  badrRate: 0.14,

  holidayAccrualRate: 0.1207,
};
