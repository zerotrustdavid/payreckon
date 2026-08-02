import type { RateFrequency, WorkingPattern } from "../../lib/calculations/annualise";
import { normalisePattern } from "../../lib/calculations/annualise";
import type { PensionMethod } from "../../lib/calculations/pension";
import { CURRENT_TAX_YEAR } from "../../lib/constants";
import type {
  NICategoryLetter,
  StudentLoanPlan,
  TaxRegion,
  TaxYear,
} from "../../lib/constants/types";

/**
 * Inputs every calculator shares. Numeric fields are held as strings so a field
 * can be cleared while typing without collapsing the result to zero mid-edit.
 */
export interface CommonInputs {
  taxYear: TaxYear;
  rate: string;
  frequency: RateFrequency;
  hoursPerWeek: string;
  weeksPerYear: string;
  daysPerYear: string;
  monthsPerYear: string;
  region: TaxRegion;
  taxCode: string;
  niCategory: NICategoryLetter;
  studentLoanPlan: StudentLoanPlan;
  hasPostgraduateLoan: boolean;
  otherIncome: string;
  otherDividends: string;
  blindPersons: boolean;
  marriageAllowance: "none" | "receiving" | "transferring";
  pensionMethod: PensionMethod;
  employeePensionPercent: string;
}

export const DEFAULT_COMMON: CommonInputs = {
  taxYear: CURRENT_TAX_YEAR,
  rate: "500",
  frequency: "day",
  hoursPerWeek: "37.5",
  weeksPerYear: "46",
  daysPerYear: "230",
  monthsPerYear: "12",
  region: "uk",
  taxCode: "",
  niCategory: "A",
  studentLoanPlan: "none",
  hasPostgraduateLoan: false,
  otherIncome: "",
  otherDividends: "",
  blindPersons: false,
  marriageAllowance: "none",
  pensionMethod: "none",
  employeePensionPercent: "5",
};

/** Parses a form string to a non-negative number, treating blank as zero. */
export function num(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function patternFrom(inputs: CommonInputs): WorkingPattern {
  return normalisePattern({
    hoursPerWeek: num(inputs.hoursPerWeek),
    weeksPerYear: num(inputs.weeksPerYear),
    daysPerYear: num(inputs.daysPerYear),
    monthsPerYear: num(inputs.monthsPerYear),
  });
}

export const FREQUENCIES = [
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
] as const;

export const REGIONS = [
  { value: "uk", label: "England, Wales & NI" },
  { value: "scotland", label: "Scotland" },
] as const;

export const STUDENT_LOAN_PLANS = [
  { value: "none", label: "No student loan" },
  { value: "plan1", label: "Plan 1" },
  { value: "plan2", label: "Plan 2" },
  { value: "plan4", label: "Plan 4 (Scotland)" },
  { value: "plan5", label: "Plan 5" },
  { value: "postgraduate", label: "Postgraduate only" },
] as const;

export const NI_CATEGORIES = [
  { value: "A", label: "A — Standard" },
  { value: "B", label: "B — Married women's reduced rate" },
  { value: "C", label: "C — Over State Pension age" },
  { value: "H", label: "H — Apprentice under 25" },
  { value: "J", label: "J — Deferred" },
  { value: "M", label: "M — Under 21" },
  { value: "V", label: "V — Veteran's first civilian year" },
  { value: "Z", label: "Z — Under 21, deferred" },
] as const;

export const PENSION_METHODS = [
  { value: "none", label: "No pension contributions" },
  { value: "salary-sacrifice", label: "Salary sacrifice" },
  { value: "net-pay", label: "Workplace (net pay)" },
  { value: "relief-at-source", label: "Personal (relief at source)" },
] as const;

export const MARRIAGE_ALLOWANCE = [
  { value: "none", label: "Not claimed" },
  { value: "receiving", label: "Receiving from partner" },
  { value: "transferring", label: "Transferring to partner" },
] as const;
