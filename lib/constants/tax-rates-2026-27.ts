/**
 * UK tax rates and thresholds for the 2026/27 tax year (6 April 2026 – 5 April 2027).
 *
 * Scope: England, Wales & Northern Ireland. Scotland sets its own income tax bands,
 * which are NOT modelled here.
 *
 * Verified against gov.uk on 2026-07-15. Rates change every tax year (and sometimes
 * mid-year via Budget), so DO NOT edit these figures in place when a new year lands —
 * add a new `tax-rates-YYYY-YY.ts` file so historical years stay inspectable.
 */

export const TAX_YEAR = "2026/27";

/**
 * Income tax — England, Wales & Northern Ireland.
 * Source: https://www.gov.uk/income-tax-rates
 * Personal allowance & basic-rate limit frozen to 2027/28:
 * https://www.gov.uk/government/publications/the-personal-allowance-and-basic-rate-limit-for-income-tax-and-certain-national-insurance-contributions-nics-thresholds-from-6-april-2026-to-5-apr/income-tax-personal-allowance-and-the-basic-rate-limit-and-certain-national-insurance-contributions-thresholds-from-6-april-2026-to-5-april-2028
 */
export const INCOME_TAX = {
  /** Tax-free personal allowance (before any taper). */
  personalAllowance: 12_570,
  /** Above this adjusted net income, the personal allowance is tapered. */
  personalAllowanceTaperThreshold: 100_000,
  /** PA reduced by £1 for every £2 of income above the taper threshold. */
  personalAllowanceTaperRate: 0.5,
  /** Width of the basic-rate band, measured on taxable income above the PA. */
  basicRateBand: 37_700,
  /** Total income at which the additional (45%) rate begins. Fixed regardless of PA taper. */
  additionalRateThreshold: 125_140,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
} as const;

/**
 * National Insurance.
 * Class 1 (employee) & employer/secondary — Source:
 *   https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
 * Class 4 (self-employed) — Source:
 *   https://www.gov.uk/self-employed-national-insurance-rates
 */
export const NATIONAL_INSURANCE = {
  /** Class 1 — employee (used for Inside IR35 deemed employment & Ltd director salary). */
  class1Employee: {
    /** Primary threshold: no employee NI below this. */
    primaryThreshold: 12_570,
    /** Upper earnings limit: main rate applies up to here, reduced rate above. */
    upperEarningsLimit: 50_270,
    mainRate: 0.08,
    upperRate: 0.02,
  },
  /** Class 4 — self-employed (sole trader).
   *  NB Class 2 is £3.65/week but is treated as paid with no mandatory charge above the
   *  small-profits threshold (post-2024 reform), so mandatory Class 2 = £0 and is omitted. */
  class4SelfEmployed: {
    lowerProfitsLimit: 12_570,
    upperProfitsLimit: 50_270,
    mainRate: 0.06,
    upperRate: 0.02,
  },
  /** Class 1 — employer/secondary (payable by a Ltd company on the director's salary). */
  class1Employer: {
    secondaryThreshold: 5_000,
    rate: 0.15,
    /** Employment Allowance exists (£10,500) but a sole-director company with no other
     *  employees is generally ineligible, so it is NOT applied by default. */
    employmentAllowance: 10_500,
  },
} as const;

/**
 * Corporation tax — financial year beginning 1 April 2026 (FY2026), non-ring-fence.
 * Source: https://www.gov.uk/government/publications/rates-and-allowances-corporation-tax/rates-and-allowances-corporation-tax
 * Marginal Relief guidance: https://www.gov.uk/guidance/corporation-tax-marginal-relief
 * Limits assume a single company (no associates) and a 12-month accounting period.
 */
export const CORPORATION_TAX = {
  smallProfitsRate: 0.19,
  mainRate: 0.25,
  marginalReliefLowerLimit: 50_000,
  marginalReliefUpperLimit: 250_000,
  /** Standard marginal relief fraction (3/200). */
  marginalReliefFraction: 3 / 200,
} as const;

/**
 * Dividend tax — 2026/27. Ordinary & upper rates rose by 2 percentage points from
 * 6 April 2026 (Budget 2025); the additional rate is unchanged.
 * Rate change: https://www.gov.uk/government/publications/changes-to-tax-rates-for-property-savings-dividend-income/changes-to-tax-rates-for-property-savings-dividend-income
 * Allowance: https://www.gov.uk/tax-on-dividends
 */
export const DIVIDEND_TAX = {
  /** Tax-free dividend allowance (still uses up band). */
  allowance: 500,
  /** Ordinary (basic-band) rate — 10.75% (up from 8.75%). */
  ordinaryRate: 0.1075,
  /** Upper (higher-band) rate — 35.75% (up from 33.75%). */
  upperRate: 0.3575,
  /** Additional-band rate — 39.35% (unchanged). */
  additionalRate: 0.3935,
} as const;
