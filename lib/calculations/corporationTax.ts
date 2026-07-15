import { CORPORATION_TAX } from "../constants/tax-rates-2026-27";

/**
 * Corporation tax on company profit, with Marginal Relief between the £50,000 and
 * £250,000 limits.
 *
 *   profit ≤ £50,000        → 19% (small profits rate)
 *   profit ≥ £250,000       → 25% (main rate)
 *   £50,000 < profit < £250k → 25% less Marginal Relief
 *
 * Marginal Relief (no associated companies, augmented profits = taxable profits):
 *   MR = (upperLimit − profit) × fraction(3/200)
 *   CT = profit × mainRate − MR
 *
 * Assumes a single company (no associates) and a 12-month accounting period; both
 * would otherwise pro-rate the limits.
 */
export function corporationTax(profit: number): number {
  if (!Number.isFinite(profit) || profit <= 0) return 0;

  const {
    smallProfitsRate,
    mainRate,
    marginalReliefLowerLimit,
    marginalReliefUpperLimit,
    marginalReliefFraction,
  } = CORPORATION_TAX;

  if (profit <= marginalReliefLowerLimit) return profit * smallProfitsRate;
  if (profit >= marginalReliefUpperLimit) return profit * mainRate;

  const marginalRelief = (marginalReliefUpperLimit - profit) * marginalReliefFraction;
  return profit * mainRate - marginalRelief;
}
