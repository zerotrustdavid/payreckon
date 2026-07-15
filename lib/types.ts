/**
 * Shared domain types for the IR35 contractor dashboard.
 */

/**
 * The tax treatment the contractor is modelling.
 * - `inside`              — Inside IR35: deemed employment (PAYE + Class 1 NI).
 * - `outside-sole-trader` — Outside IR35 as a sole trader (income tax + Class 4 NI).
 * - `outside-ltd`         — Outside IR35 via own limited company (corporation tax,
 *                           low salary + dividends).
 *
 * Only the income calculation is used in M1; the tax scenarios that consume this
 * type land in M3.
 */
export type ContractMode = "inside" | "outside-sole-trader" | "outside-ltd";

/**
 * Inputs to the day-rate → gross annual revenue calculation.
 */
export interface DayRateInputs {
  /** Day rate in GBP (£ per working day). */
  dayRate: number;
  /** Working days per week. */
  daysPerWeek: number;
  /** Working weeks per year (after time off). */
  weeksPerYear: number;
}

/** A single itemised tax or NI charge in a scenario breakdown. */
export interface TaxBreakdownLine {
  label: string;
  amount: number;
}

/**
 * Output of a tax scenario: the itemised charges plus the headline totals.
 * All figures are a gross-exposure estimate before other business/company
 * expenses (accountancy, equipment, pension, etc.).
 */
export interface ScenarioResult {
  /** Gross annual revenue the estimate is based on. */
  grossRevenue: number;
  /** Itemised tax / NI charges that make up the total. */
  lines: TaxBreakdownLine[];
  /** Total tax + NI exposure. */
  totalTax: number;
  /** Revenue less total tax (still before other expenses). */
  takeHome: number;
  /** Effective rate: totalTax / grossRevenue (0 when revenue is 0). */
  effectiveRate: number;
  /** Mode-specific assumptions to surface in the UI. */
  notes: string[];
}
