/**
 * Shape shared by every tax-year rate file.
 *
 * Each tax year gets its own self-contained `tax-rates-YYYY-YY.ts` conforming to
 * `TaxYearRates`. Years are never edited in place when rates change — a new file
 * is added — so historical calculations stay reproducible.
 */

export type TaxYear = "2024/25" | "2025/26" | "2026/27";

/** Tax region. Scotland sets its own non-savings, non-dividend income tax bands. */
export type TaxRegion = "uk" | "scotland";

/**
 * A single income tax band, expressed against **taxable income**
 * (total income less the personal allowance).
 *
 * `taxableUpTo` is the upper bound of the band. Using taxable income rather than
 * gross means the personal-allowance taper shifts every band correctly without
 * needing separate thresholds per income level.
 */
export interface TaxBand {
  name: string;
  rate: number;
  /** Upper bound of this band on taxable income; `Infinity` for the top band. */
  taxableUpTo: number;
}

/** National Insurance treatment for a given category letter. */
export interface NICategory {
  /** Employee rate between the primary threshold and the upper earnings limit. */
  employeeMain: number;
  /** Employee rate above the upper earnings limit. */
  employeeUpper: number;
  /** Employer rate above the secondary threshold. */
  employerRate: number;
  /**
   * Upper secondary threshold below which the employer rate is 0% (e.g. under-21,
   * apprentices under 25, veterans). 0 means the employer pays from the secondary
   * threshold up.
   */
  employerZeroRateUpTo: number;
  label: string;
}

export type NICategoryLetter = "A" | "B" | "C" | "H" | "J" | "M" | "V" | "Z";

export type StudentLoanPlan =
  | "none"
  | "plan1"
  | "plan2"
  | "plan4"
  | "plan5"
  | "postgraduate";

export interface StudentLoanThreshold {
  threshold: number;
  rate: number;
}

export interface TaxYearRates {
  taxYear: TaxYear;

  incomeTax: {
    personalAllowance: number;
    /** Above this adjusted net income the personal allowance is tapered away. */
    personalAllowanceTaperThreshold: number;
    /** Personal allowance reduced by this fraction of income above the threshold. */
    personalAllowanceTaperRate: number;
    /** Bands for England, Wales & Northern Ireland. */
    ukBands: TaxBand[];
    /** Bands for Scottish taxpayers (non-savings, non-dividend income only). */
    scottishBands: TaxBand[];
  };

  nationalInsurance: {
    class1: {
      primaryThreshold: number;
      upperEarningsLimit: number;
      secondaryThreshold: number;
      employmentAllowance: number;
    };
    categories: Record<NICategoryLetter, NICategory>;
    class4SelfEmployed: {
      lowerProfitsLimit: number;
      upperProfitsLimit: number;
      mainRate: number;
      upperRate: number;
    };
  };

  corporationTax: {
    smallProfitsRate: number;
    mainRate: number;
    marginalReliefLowerLimit: number;
    marginalReliefUpperLimit: number;
    marginalReliefFraction: number;
  };

  dividendTax: {
    allowance: number;
    ordinaryRate: number;
    upperRate: number;
    additionalRate: number;
  };

  /** Null for plans not yet repayable in this tax year (e.g. Plan 5 before 2026/27). */
  studentLoans: Record<
    Exclude<StudentLoanPlan, "none">,
    StudentLoanThreshold | null
  >;

  apprenticeshipLevy: {
    rate: number;
    allowance: number;
  };

  autoEnrolment: {
    lowerQualifyingEarnings: number;
    upperQualifyingEarnings: number;
    earningsTrigger: number;
  };

  allowances: {
    blindPersons: number;
    /** Amount of personal allowance transferable under Marriage Allowance. */
    marriageAllowanceTransfer: number;
  };

  /** Business Asset Disposal Relief rate on qualifying gains. */
  badrRate: number;

  /**
   * Statutory holiday accrual as a percentage of hours worked: 5.6 weeks'
   * entitlement over the 46.4 working weeks that remain (5.6 / 46.4 = 12.07%).
   */
  holidayAccrualRate: number;
}
