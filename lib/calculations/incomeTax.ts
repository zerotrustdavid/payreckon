import type { TaxRegion, TaxYearRates } from "../constants/types";

/** One band's contribution to an income tax bill, for the detailed breakdown table. */
export interface BandCharge {
  name: string;
  rate: number;
  /** Amount of taxable income falling in this band. */
  amount: number;
  tax: number;
}

export interface IncomeTaxResult {
  total: number;
  /** Personal allowance actually applied, after taper and any adjustments. */
  allowance: number;
  taxableIncome: number;
  bands: BandCharge[];
}

export interface AllowanceOptions {
  /** Claiming Blind Person's Allowance adds to the personal allowance. */
  blindPersons?: boolean;
  /** 'receiving' adds the transferable amount; 'transferring' subtracts it. */
  marriageAllowance?: "none" | "receiving" | "transferring";
  /**
   * Allowance implied by a tax code, overriding the standard personal allowance
   * (e.g. 1257L → £12,570, BR → £0). Negative values represent K codes, where
   * untaxed income is added rather than an allowance given.
   */
  codeAllowance?: number;
}

/**
 * Personal allowance after the high-income taper: reduced by £1 for every £2 of
 * income above £100,000, reaching £0 at £125,140.
 *
 * A tax code allowance replaces the standard personal allowance but is still
 * subject to the taper, matching how PAYE codes are operated. Blind Person's and
 * Marriage Allowance adjustments are applied after the taper because they are not
 * themselves income-restricted.
 */
export function personalAllowance(
  income: number,
  rates: TaxYearRates,
  options: AllowanceOptions = {},
): number {
  const {
    personalAllowance: standard,
    personalAllowanceTaperThreshold,
    personalAllowanceTaperRate,
  } = rates.incomeTax;

  const base = options.codeAllowance ?? standard;

  let allowance = base;
  if (income > personalAllowanceTaperThreshold) {
    const reduction =
      (income - personalAllowanceTaperThreshold) * personalAllowanceTaperRate;
    allowance = Math.max(0, base - reduction);
  }

  if (options.blindPersons) {
    allowance += rates.allowances.blindPersons;
  }
  if (options.marriageAllowance === "receiving") {
    allowance += rates.allowances.marriageAllowanceTransfer;
  } else if (options.marriageAllowance === "transferring") {
    allowance = Math.max(0, allowance - rates.allowances.marriageAllowanceTransfer);
  }

  return allowance;
}

/**
 * Walks an ordered set of bands, charging each slice of taxable income at its rate.
 * Bands are defined against taxable income, so the personal allowance (however it
 * was arrived at) shifts every band consistently.
 */
export function chargeBands(
  taxableIncome: number,
  bands: TaxYearRates["incomeTax"]["ukBands"],
): BandCharge[] {
  const charges: BandCharge[] = [];
  let position = 0;

  for (const band of bands) {
    const capacity = band.taxableUpTo - position;
    const amount = Math.max(0, Math.min(taxableIncome - position, capacity));
    charges.push({
      name: band.name,
      rate: band.rate,
      amount,
      tax: amount * band.rate,
    });
    position += amount;
    if (position >= taxableIncome) break;
  }

  return charges;
}

/**
 * Income tax on non-dividend income (employment, deemed employment, trading
 * profit or pension income).
 *
 * Scottish taxpayers use the Scottish bands for this income. Dividend income is
 * taxed separately and always on UK bands — see `dividendTax`.
 */
export function incomeTax(
  income: number,
  rates: TaxYearRates,
  options: AllowanceOptions & { region?: TaxRegion } = {},
): IncomeTaxResult {
  const safeIncome = Number.isFinite(income) && income > 0 ? income : 0;
  const allowance = personalAllowance(safeIncome, rates, options);
  const taxableIncome = Math.max(0, safeIncome - allowance);

  const bands =
    options.region === "scotland"
      ? rates.incomeTax.scottishBands
      : rates.incomeTax.ukBands;

  const charges = chargeBands(taxableIncome, bands);
  const total = charges.reduce((sum, band) => sum + band.tax, 0);

  return { total, allowance, taxableIncome, bands: charges };
}
