import { INCOME_TAX } from "../constants/tax-rates-2026-27";

/**
 * Personal allowance after the high-income taper: reduced by £1 for every £2 of
 * income above £100,000, reaching £0 at £125,140. Uses total income as a proxy
 * for "adjusted net income" (we have no reliefs/deductions to net off here).
 */
export function personalAllowance(income: number): number {
  const { personalAllowance: pa, personalAllowanceTaperThreshold, personalAllowanceTaperRate } =
    INCOME_TAX;
  if (income <= personalAllowanceTaperThreshold) return pa;
  const reduction = (income - personalAllowanceTaperThreshold) * personalAllowanceTaperRate;
  return Math.max(0, pa - reduction);
}

/**
 * Income tax on non-dividend income (employment / deemed employment / trading
 * profit) for England, Wales & NI. Applies the tapered personal allowance, then
 * the 20% / 40% / 45% bands. Dividend income is taxed separately (see dividendTax).
 */
export function incomeTax(income: number): number {
  if (!Number.isFinite(income) || income <= 0) return 0;

  const { basicRateBand, additionalRateThreshold, basicRate, higherRate, additionalRate } =
    INCOME_TAX;

  const pa = personalAllowance(income);
  // Total-income boundary where the 40% band begins (moves down as PA tapers).
  const higherRateThreshold = pa + basicRateBand;

  const basic = Math.max(0, Math.min(income, higherRateThreshold) - pa);
  const higher = Math.max(0, Math.min(income, additionalRateThreshold) - higherRateThreshold);
  const additional = Math.max(0, income - additionalRateThreshold);

  return basic * basicRate + higher * higherRate + additional * additionalRate;
}
