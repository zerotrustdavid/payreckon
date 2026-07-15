import type { DayRateInputs } from "../types";

/**
 * Whether a value is a usable, non-negative, finite number.
 * Guards the calculation against NaN / Infinity / negative inputs so the UI
 * never surfaces a nonsensical (e.g. negative) revenue figure.
 */
function isValidNonNegative(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}

/**
 * Gross annual revenue from a day rate.
 *
 *   dayRate × daysPerWeek × weeksPerYear
 *
 * This is revenue only — no tax, NI, or expenses are applied here (those land
 * in the M3 tax scenarios). Any invalid or negative input yields 0 rather than
 * propagating NaN into the rest of the calculation chain.
 */
export function grossAnnualRevenue(inputs: DayRateInputs): number {
  const { dayRate, daysPerWeek, weeksPerYear } = inputs;

  if (![dayRate, daysPerWeek, weeksPerYear].every(isValidNonNegative)) {
    return 0;
  }

  return dayRate * daysPerWeek * weeksPerYear;
}
