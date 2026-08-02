import type { TaxYearRates } from "../constants/types";
import { personalAllowance, type AllowanceOptions, type BandCharge } from "./incomeTax";

export interface DividendTaxResult {
  total: number;
  /** Dividend income falling in each band, including the zero-rated allowance. */
  bands: BandCharge[];
}

/**
 * Income tax on dividends, taxed as the top slice of income above non-dividend
 * income.
 *
 * Order of operations:
 *   1. The personal allowance covers non-dividend income first; any remainder
 *      covers dividends at 0%.
 *   2. The dividend allowance zero-rates the first slice of otherwise-taxable
 *      dividends but still consumes band space.
 *   3. The remainder is charged at the ordinary / upper / additional dividend rate
 *      according to where it stacks on top of non-dividend income.
 *
 * Scottish taxpayers pay Scottish rates on earned income but **UK** rates and UK
 * band thresholds on dividends, so this always uses `ukBands` regardless of region.
 */
export function dividendTax(
  nonDividendIncome: number,
  dividends: number,
  rates: TaxYearRates,
  options: AllowanceOptions = {},
): DividendTaxResult {
  const earned = Math.max(
    0,
    Number.isFinite(nonDividendIncome) ? nonDividendIncome : 0,
  );
  const divs = Math.max(0, Number.isFinite(dividends) ? dividends : 0);
  if (divs === 0) return { total: 0, bands: [] };

  const allowance = personalAllowance(earned + divs, rates, options);
  const { allowance: divAllowance, ordinaryRate, upperRate, additionalRate } =
    rates.dividendTax;
  const dividendRates = [ordinaryRate, upperRate, additionalRate];

  // Dividends stack above whatever taxable non-dividend income already exists.
  const taxableEarned = Math.max(0, earned - allowance);
  const unusedAllowance = Math.max(0, allowance - earned);
  const taxableDividends = Math.max(0, divs - unusedAllowance);
  if (taxableDividends === 0) return { total: 0, bands: [] };

  const charges: BandCharge[] = [];
  let position = taxableEarned;
  let remaining = taxableDividends;
  let allowanceLeft = divAllowance;
  let total = 0;

  rates.incomeTax.ukBands.forEach((band, index) => {
    if (remaining <= 0) return;

    const capacity = band.taxableUpTo - position;
    const amount = Math.max(0, Math.min(remaining, capacity));
    if (amount <= 0) return;

    const zeroRated = Math.min(allowanceLeft, amount);
    allowanceLeft -= zeroRated;
    const taxed = amount - zeroRated;
    const rate = dividendRates[index] ?? additionalRate;
    const tax = taxed * rate;

    if (zeroRated > 0) {
      charges.push({
        name: `Dividend allowance (${band.name})`,
        rate: 0,
        amount: zeroRated,
        tax: 0,
      });
    }
    if (taxed > 0) {
      charges.push({ name: `Dividend ${band.name.toLowerCase()}`, rate, amount: taxed, tax });
    }

    total += tax;
    position += amount;
    remaining -= amount;
  });

  return { total, bands: charges };
}
