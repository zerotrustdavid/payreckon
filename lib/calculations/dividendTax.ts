import { DIVIDEND_TAX } from "../constants/tax-rates-2026-27";
import { INCOME_TAX } from "../constants/tax-rates-2026-27";
import { personalAllowance } from "./incomeTax";

/**
 * Income tax on dividends, taxed as the top slice of income above non-dividend
 * income (e.g. a Ltd director's salary).
 *
 * The calculation, in order:
 *   1. Personal allowance (tapered on total income) covers non-dividend income
 *      first; any remainder covers dividends at 0%.
 *   2. The £500 dividend allowance zero-rates the first £500 of otherwise-taxable
 *      dividends (but still consumes band space).
 *   3. Remaining dividends are taxed at the ordinary / upper / additional rate
 *      according to which band they fall into, stacked on top of non-dividend
 *      income. The band boundaries use the same total-income thresholds and PA
 *      taper as `incomeTax`, so the two stay consistent.
 *
 * @param nonDividendIncome salary / other income taxed before dividends
 * @param dividends         gross dividend income
 */
export function dividendTax(nonDividendIncome: number, dividends: number): number {
  const salary = Math.max(0, Number.isFinite(nonDividendIncome) ? nonDividendIncome : 0);
  const div = Math.max(0, Number.isFinite(dividends) ? dividends : 0);
  if (div === 0) return 0;

  const total = salary + div;
  const pa = personalAllowance(total);
  const { basicRateBand, additionalRateThreshold } = INCOME_TAX;
  const { allowance, ordinaryRate, upperRate, additionalRate } = DIVIDEND_TAX;

  // Total-income band boundaries (consistent with incomeTax).
  const higherRateThreshold = pa + basicRateBand;

  // Dividends occupy [salary, total]. They only become taxable above the PA.
  const taxableStart = Math.max(salary, pa);
  const taxableDividends = Math.max(0, total - taxableStart);
  if (taxableDividends === 0) return 0;

  // Walk the taxable dividend slice upward through the bands, zero-rating the
  // first £500 (dividend allowance) wherever it lands.
  const bands = [
    { upTo: higherRateThreshold, rate: ordinaryRate },
    { upTo: additionalRateThreshold, rate: upperRate },
    { upTo: Infinity, rate: additionalRate },
  ];

  let position = taxableStart;
  let remaining = taxableDividends;
  let allowanceLeft = allowance;
  let tax = 0;

  for (const band of bands) {
    if (remaining <= 0) break;
    const capacity = band.upTo - position;
    const amount = Math.max(0, Math.min(remaining, capacity));
    if (amount <= 0) continue;

    const zeroRated = Math.min(allowanceLeft, amount);
    allowanceLeft -= zeroRated;
    tax += (amount - zeroRated) * band.rate;

    position += amount;
    remaining -= amount;
  }

  return tax;
}
