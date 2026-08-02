import { buildNICategories } from "./niCategories";
import type { TaxYearRates } from "./types";

/**
 * UK tax rates and thresholds for 2026/27 (6 April 2026 – 5 April 2027).
 *
 * Every figure verified against gov.uk / gov.scot on 2026-08-02. Sources are cited
 * per section below. Rates change every tax year and sometimes mid-year via Budget,
 * so this file is never edited when a new year lands — add a new year file instead.
 *
 * Notable changes this year:
 *   • Dividend ordinary and upper rates each rose 2 percentage points (Budget 2025).
 *   • Plan 5 student loans become repayable for the first time.
 */
export const RATES_2026_27: TaxYearRates = {
  taxYear: "2026/27",

  /**
   * Income tax.
   * England/Wales/NI: https://www.gov.uk/income-tax-rates
   * Allowance & basic-rate limit frozen to 2027/28:
   *   https://www.gov.uk/government/publications/the-personal-allowance-and-basic-rate-limit-for-income-tax-and-certain-national-insurance-contributions-nics-thresholds-from-6-april-2026-to-5-apr
   * Scotland: https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/2026-to-2027/
   *   (gov.scot publishes gross ranges; converted here to taxable income by
   *    subtracting the £12,570 personal allowance — e.g. starter £12,571–£16,537
   *    becomes taxable up to £3,967. The advanced-rate ceiling of £125,140 needs no
   *    adjustment because the personal allowance is fully tapered by that point.)
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
      { name: "Starter rate", rate: 0.19, taxableUpTo: 3_967 },
      { name: "Basic rate", rate: 0.2, taxableUpTo: 16_956 },
      { name: "Intermediate rate", rate: 0.21, taxableUpTo: 31_092 },
      { name: "Higher rate", rate: 0.42, taxableUpTo: 62_430 },
      { name: "Advanced rate", rate: 0.45, taxableUpTo: 125_140 },
      { name: "Top rate", rate: 0.48, taxableUpTo: Infinity },
    ],
  },

  /**
   * National Insurance.
   * Employer/employee thresholds and rates:
   *   https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
   * Category letters: https://www.gov.uk/national-insurance-rates-letters
   * Class 4 (self-employed): https://www.gov.uk/self-employed-national-insurance-rates
   *   Class 2 is £3.65/week but treated as paid with no mandatory charge above the
   *   small-profits threshold, so mandatory Class 2 is £0 and is not modelled.
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
   * Corporation tax — financial year beginning 1 April 2026, non-ring-fence.
   * https://www.gov.uk/government/publications/rates-and-allowances-corporation-tax/rates-and-allowances-corporation-tax
   * https://www.gov.uk/guidance/corporation-tax-marginal-relief
   * Limits assume no associated companies and a 12-month accounting period.
   */
  corporationTax: {
    smallProfitsRate: 0.19,
    mainRate: 0.25,
    marginalReliefLowerLimit: 50_000,
    marginalReliefUpperLimit: 250_000,
    marginalReliefFraction: 3 / 200,
  },

  /**
   * Dividend tax. Ordinary and upper rates rose 2pp from 6 April 2026 (Budget 2025);
   * the additional rate is unchanged.
   * https://www.gov.uk/government/publications/changes-to-tax-rates-for-property-savings-dividend-income/changes-to-tax-rates-for-property-savings-dividend-income
   * https://www.gov.uk/tax-on-dividends
   */
  dividendTax: {
    allowance: 500,
    ordinaryRate: 0.1075,
    upperRate: 0.3575,
    additionalRate: 0.3935,
  },

  /**
   * Student loans. Plans 1, 2, 4 and 5 repay 9% above threshold; postgraduate 6%.
   * https://www.gov.uk/government/publications/sl3-student-loan-deduction-tables/2026-to-2027-student-and-postgraduate-loan-deduction-tables
   * https://www.gov.uk/repaying-your-student-loan/what-you-pay
   */
  studentLoans: {
    plan1: { threshold: 26_900, rate: 0.09 },
    plan2: { threshold: 29_385, rate: 0.09 },
    plan4: { threshold: 33_795, rate: 0.09 },
    plan5: { threshold: 25_000, rate: 0.09 },
    postgraduate: { threshold: 21_000, rate: 0.06 },
  },

  /** https://www.gov.uk/guidance/pay-apprenticeship-levy */
  apprenticeshipLevy: {
    rate: 0.005,
    allowance: 15_000,
  },

  /**
   * Automatic enrolment qualifying earnings band and trigger.
   * https://www.gov.uk/government/publications/review-of-the-automatic-enrolment-earnings-trigger-and-qualifying-earnings-band-for-202627/review-of-the-automatic-enrolment-earnings-trigger-and-qualifying-earnings-band-for-202627
   */
  autoEnrolment: {
    lowerQualifyingEarnings: 6_240,
    upperQualifyingEarnings: 50_270,
    earningsTrigger: 10_000,
  },

  /**
   * Blind Person's Allowance set by the Income Tax (Indexation) Order 2026 (SI 2026/38):
   * https://www.legislation.gov.uk/uksi/2026/38/made
   * https://www.gov.uk/blind-persons-allowance/what-youll-get
   * Marriage Allowance transfers 10% of the personal allowance (rounded up to £10).
   * https://www.gov.uk/marriage-allowance
   */
  allowances: {
    blindPersons: 3_250,
    marriageAllowanceTransfer: 1_260,
  },

  /**
   * Business Asset Disposal Relief — 18% for disposals on or after 6 April 2026.
   * https://www.gov.uk/government/publications/changes-to-the-rates-of-capital-gains-tax/capital-gains-tax-rates-of-tax
   */
  badrRate: 0.18,

  /** 5.6 weeks' statutory holiday over the remaining 46.4 working weeks. */
  holidayAccrualRate: 0.1207,
};
