import type { TaxYear } from "../../constants/types";
import type { PersonalTaxResult } from "../personalTax";

/** One row in a results breakdown, optionally expandable into child rows. */
export interface BreakdownLine {
  label: string;
  amount: number;
  children?: BreakdownLine[];
  /** Controls presentation: deductions render negative, additions positive. */
  kind?: "deduction" | "addition" | "subtotal" | "total";
  hint?: string;
}

/**
 * A slice of the headline figure for the composition chart. Labels are drawn
 * from a fixed vocabulary so a category keeps the same colour across calculators.
 */
export interface ChartSegment {
  label: string;
  value: number;
}

/**
 * The shape every calculator returns, so one results panel can render all three.
 */
export interface CalculatorResult {
  /** Where each pound of `grossInput` ends up. Sums to `grossInput`. */
  chartSegments: ChartSegment[];
  taxYear: TaxYear;
  /** Headline input the estimate is built from (assignment income, revenue, salary). */
  grossInput: number;
  /** Ordered breakdown for display. */
  lines: BreakdownLine[];
  /** Cash reaching the personal bank account. */
  takeHome: number;
  /** Take-home plus pension contributions and any accrued holiday pay. */
  totalCapital: number;
  /** All taxes and statutory deductions, company and personal. */
  totalTax: number;
  /** totalTax / grossInput. */
  effectiveRate: number;
  personal: PersonalTaxResult;
  /** Modelling assumptions worth surfacing to the user. */
  notes: string[];
  /** Conditions the user should act on (e.g. a plan unavailable in this year). */
  warnings: string[];
}
