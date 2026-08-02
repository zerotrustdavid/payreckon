import type { TaxYearRates } from "../constants/types";

export interface CorporationTaxResult {
  total: number;
  /** Rate actually borne once Marginal Relief is taken into account. */
  effectiveRate: number;
  marginalRelief: number;
  /** Which rule applied, for the detailed breakdown table. */
  basis: "small-profits" | "marginal-relief" | "main-rate" | "none";
}

/**
 * Corporation tax on company profit, with Marginal Relief between the lower and
 * upper limits.
 *
 *   profit ≤ lower limit  → small profits rate
 *   profit ≥ upper limit  → main rate
 *   in between            → main rate less Marginal Relief, where
 *                           MR = (upperLimit − profit) × fraction
 *
 * Assumes a single company with no associates and a 12-month accounting period;
 * both would otherwise pro-rate the limits.
 */
export function corporationTax(
  profit: number,
  rates: TaxYearRates,
): CorporationTaxResult {
  if (!Number.isFinite(profit) || profit <= 0) {
    return { total: 0, effectiveRate: 0, marginalRelief: 0, basis: "none" };
  }

  const {
    smallProfitsRate,
    mainRate,
    marginalReliefLowerLimit,
    marginalReliefUpperLimit,
    marginalReliefFraction,
  } = rates.corporationTax;

  if (profit <= marginalReliefLowerLimit) {
    const total = profit * smallProfitsRate;
    return {
      total,
      effectiveRate: smallProfitsRate,
      marginalRelief: 0,
      basis: "small-profits",
    };
  }

  if (profit >= marginalReliefUpperLimit) {
    const total = profit * mainRate;
    return { total, effectiveRate: mainRate, marginalRelief: 0, basis: "main-rate" };
  }

  const marginalRelief =
    (marginalReliefUpperLimit - profit) * marginalReliefFraction;
  const total = profit * mainRate - marginalRelief;

  return {
    total,
    effectiveRate: total / profit,
    marginalRelief,
    basis: "marginal-relief",
  };
}
