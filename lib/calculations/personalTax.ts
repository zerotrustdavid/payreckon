import type {
  NICategoryLetter,
  StudentLoanPlan,
  TaxBand,
  TaxRegion,
  TaxYearRates,
} from "../constants/types";
import { dividendTax, type DividendTaxResult } from "./dividendTax";
import {
  chargeBands,
  personalAllowance,
  type BandCharge,
  type IncomeTaxResult,
} from "./incomeTax";
import { class1EmployeeNI } from "./nationalInsurance";
import type { PensionResult } from "./pension";
import { studentLoanRepayment, type StudentLoanResult } from "./studentLoan";
import { parseTaxCode } from "./taxCode";

export interface PersonalTaxInput {
  /** Employment or deemed-employment income, after any salary sacrifice. */
  earnedIncome: number;
  /** Other income taxed as non-savings income (e.g. rental, pension income). */
  otherIncome?: number;
  dividendIncome?: number;
  /** Pay subject to employee Class 1 NI. Defaults to `earnedIncome`. */
  niableIncome?: number;
  /** Set false for income not subject to Class 1 (e.g. a sole trader's profit). */
  applyEmployeeNI?: boolean;
  pension?: PensionResult;
  taxCode?: string;
  region?: TaxRegion;
  niCategory?: NICategoryLetter;
  studentLoanPlan?: StudentLoanPlan;
  hasPostgraduateLoan?: boolean;
  /** Income the student loan repayment is assessed on. Defaults to total income. */
  studentLoanBase?: number;
  blindPersons?: boolean;
  marriageAllowance?: "none" | "receiving" | "transferring";
}

export interface PersonalTaxResult {
  /** Total taxable income before allowances, less qualifying pension relief. */
  adjustedNetIncome: number;
  incomeTax: IncomeTaxResult;
  dividendTax: DividendTaxResult;
  nationalInsurance: number;
  studentLoan: StudentLoanResult;
  /** Income tax + dividend tax + NI + student loan. */
  totalTax: number;
  /** The region actually used, after any tax-code prefix override. */
  region: TaxRegion;
}

/**
 * Applies a relief-at-source pension band extension.
 *
 * Contributions paid from taxed pay extend the **basic rate limit** by the gross
 * contribution, which lifts every threshold above it too. Bands below the basic
 * rate (Scotland's starter band) are unaffected.
 */
function extendBasicRateBand(bands: TaxBand[], extension: number): TaxBand[] {
  if (extension <= 0) return bands;
  const basicIndex = bands.findIndex((band) => band.name === "Basic rate");
  if (basicIndex === -1) return bands;

  return bands.map((band, index) =>
    index >= basicIndex && Number.isFinite(band.taxableUpTo)
      ? { ...band, taxableUpTo: band.taxableUpTo + extension }
      : band,
  );
}

/**
 * The shared personal tax calculation used by every calculator.
 *
 * Taking one code path for income tax, National Insurance, dividend tax and
 * student loan means an umbrella worker, a limited company director and a
 * permanent employee on the same taxable income are taxed identically — the
 * calculators can only differ where the underlying tax treatment genuinely does.
 */
export function personalTax(
  input: PersonalTaxInput,
  rates: TaxYearRates,
): PersonalTaxResult {
  const earned = Math.max(0, input.earnedIncome || 0);
  const other = Math.max(0, input.otherIncome || 0);
  const dividends = Math.max(0, input.dividendIncome || 0);
  const pension = input.pension;

  const code = parseTaxCode(input.taxCode ?? "");
  const region: TaxRegion = code.valid && code.region ? code.region : input.region ?? "uk";

  // Income tax is charged on earned + other income, less any contribution that
  // attracts relief by deduction (salary sacrifice or a net-pay scheme).
  const taxRelief = pension?.taxRelievedAmount ?? 0;
  const nonDividendIncome = Math.max(0, earned + other - taxRelief);
  const adjustedNetIncome = Math.max(0, earned + other + dividends - taxRelief);

  const allowanceOptions = {
    blindPersons: input.blindPersons,
    marriageAllowance: input.marriageAllowance,
    codeAllowance: code.valid && !code.noTax ? code.allowance : undefined,
  };

  let incomeTaxResult: IncomeTaxResult;
  let dividendTaxResult: DividendTaxResult;

  if (code.valid && code.noTax) {
    // NT — no income tax on any of it.
    incomeTaxResult = {
      total: 0,
      allowance: 0,
      taxableIncome: nonDividendIncome,
      bands: [],
    };
    dividendTaxResult = { total: 0, bands: [] };
  } else {
    const baseBands =
      region === "scotland" ? rates.incomeTax.scottishBands : rates.incomeTax.ukBands;

    if (code.valid && code.forcedBandIndex !== null) {
      // BR / D0 / D1 / D2 — everything at a single rate, no allowance.
      const forced = baseBands[Math.min(code.forcedBandIndex, baseBands.length - 1)];
      const charges: BandCharge[] = [
        {
          name: forced.name,
          rate: forced.rate,
          amount: nonDividendIncome,
          tax: nonDividendIncome * forced.rate,
        },
      ];
      incomeTaxResult = {
        total: charges[0].tax,
        allowance: 0,
        taxableIncome: nonDividendIncome,
        bands: charges,
      };
      dividendTaxResult = dividendTax(nonDividendIncome, dividends, rates, {
        ...allowanceOptions,
        codeAllowance: 0,
      });
    } else {
      const allowance = personalAllowance(
        adjustedNetIncome,
        rates,
        allowanceOptions,
      );
      const taxableIncome = Math.max(0, nonDividendIncome - allowance);
      const bands = extendBasicRateBand(baseBands, pension?.bandExtension ?? 0);
      const charges = chargeBands(taxableIncome, bands);

      incomeTaxResult = {
        total: charges.reduce((sum, band) => sum + band.tax, 0),
        allowance,
        taxableIncome,
        bands: charges,
      };
      dividendTaxResult = dividendTax(
        nonDividendIncome,
        dividends,
        rates,
        allowanceOptions,
      );
    }
  }

  // National Insurance is charged on pay, not on the income-tax measure, so it
  // ignores net-pay pension relief but not salary sacrifice.
  const niBase = Math.max(
    0,
    (input.niableIncome ?? earned) - (pension?.niRelievedAmount ?? 0),
  );
  const nationalInsurance =
    input.applyEmployeeNI === false
      ? 0
      : class1EmployeeNI(niBase, rates, input.niCategory ?? "A");

  const studentLoan = studentLoanRepayment(
    input.studentLoanBase ?? earned + other + dividends,
    rates,
    {
      plan: input.studentLoanPlan,
      hasPostgraduateLoan: input.hasPostgraduateLoan,
    },
  );

  return {
    adjustedNetIncome,
    incomeTax: incomeTaxResult,
    dividendTax: dividendTaxResult,
    nationalInsurance,
    studentLoan,
    totalTax:
      incomeTaxResult.total +
      dividendTaxResult.total +
      nationalInsurance +
      studentLoan.total,
    region,
  };
}
