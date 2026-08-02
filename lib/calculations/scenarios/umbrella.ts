import type {
  NICategoryLetter,
  StudentLoanPlan,
  TaxRegion,
  TaxYearRates,
} from "../../constants/types";
import { pensionContributions, type PensionMethod } from "../pension";
import { personalTax } from "../personalTax";
import type { BreakdownLine, CalculatorResult } from "./types";

export type HolidayPayMethod = "advanced" | "accrued";

export interface UmbrellaInput {
  /** Annualised assignment rate — what the agency pays the umbrella. */
  assignmentIncome: number;
  /** Umbrella's retained margin, already annualised. */
  umbrellaMargin?: number;
  applyApprenticeshipLevy?: boolean;
  holidayPayMethod?: HolidayPayMethod;
  /** Employer pension contribution as a percentage of gross pay. */
  employerPensionPercent?: number;
  employeePensionPercent?: number;
  pensionMethod?: PensionMethod;
  otherIncome?: number;
  otherDividends?: number;
  taxCode?: string;
  region?: TaxRegion;
  niCategory?: NICategoryLetter;
  studentLoanPlan?: StudentLoanPlan;
  hasPostgraduateLoan?: boolean;
  blindPersons?: boolean;
  marriageAllowance?: "none" | "receiving" | "transferring";
}

export interface EmploymentCosts {
  grossPay: number;
  employerNI: number;
  apprenticeshipLevy: number;
  employerPension: number;
  margin: number;
  total: number;
}

/**
 * Solves the circular relationship at the heart of umbrella pay.
 *
 * Employer NI, the apprenticeship levy and employer pension are all deducted
 * *from* the assignment rate but calculated *on* the gross pay that remains, so
 * gross pay cannot be found by subtraction — it has to be solved for.
 *
 * With `P` the assignment income less the umbrella's margin, `e` the employer NI
 * rate, `T` the threshold above which employer NI is due, and `l` and `p` the levy
 * and employer pension rates:
 *
 *   P = G + max(0, G − T)·e + G·l + G·p
 *
 * Above the threshold this rearranges to
 *
 *   G = (P + T·e) / (1 + e + l + p)
 *
 * and below it, where no employer NI arises, to
 *
 *   G = P / (1 + l + p)
 *
 * Both roots are computed and the one consistent with its own branch is taken, so
 * the result is exact rather than iterated to a tolerance.
 */
export function solveGrossPay(
  availableForEmployment: number,
  rates: TaxYearRates,
  options: {
    niCategory?: NICategoryLetter;
    levyRate?: number;
    employerPensionRate?: number;
  } = {},
): number {
  const available = Math.max(0, availableForEmployment);
  if (available === 0) return 0;

  const category = rates.nationalInsurance.categories[options.niCategory ?? "A"];
  const threshold = Math.max(
    rates.nationalInsurance.class1.secondaryThreshold,
    category.employerZeroRateUpTo,
  );
  const e = category.employerRate;
  const l = options.levyRate ?? 0;
  const p = options.employerPensionRate ?? 0;

  // Branch 1: gross pay lands at or below the employer NI threshold.
  const below = available / (1 + l + p);
  if (below <= threshold) return below;

  // Branch 2: gross pay exceeds the threshold, so employer NI applies to the excess.
  const above = (available + threshold * e) / (1 + e + l + p);
  return above;
}

/**
 * Inside IR35 via an umbrella company.
 *
 * The assignment rate has to cover the umbrella's margin and every employment
 * cost before any taxable pay exists; what remains is taxed as employment income.
 */
export function calculateUmbrella(
  input: UmbrellaInput,
  rates: TaxYearRates,
): CalculatorResult {
  const assignment = Math.max(0, input.assignmentIncome || 0);
  const margin = Math.min(Math.max(0, input.umbrellaMargin || 0), assignment);
  const levyRate = input.applyApprenticeshipLevy ? rates.apprenticeshipLevy.rate : 0;
  const employerPensionRate = Math.max(0, input.employerPensionPercent || 0) / 100;

  const availableForEmployment = Math.max(0, assignment - margin);
  const grossPay = solveGrossPay(availableForEmployment, rates, {
    niCategory: input.niCategory,
    levyRate,
    employerPensionRate,
  });

  const category = rates.nationalInsurance.categories[input.niCategory ?? "A"];
  const niThreshold = Math.max(
    rates.nationalInsurance.class1.secondaryThreshold,
    category.employerZeroRateUpTo,
  );
  const employerNI = Math.max(0, grossPay - niThreshold) * category.employerRate;
  const apprenticeshipLevy = grossPay * levyRate;
  const employerPension = grossPay * employerPensionRate;

  const costs: EmploymentCosts = {
    grossPay,
    employerNI,
    apprenticeshipLevy,
    employerPension,
    margin,
    total: margin + employerNI + apprenticeshipLevy + employerPension,
  };

  // Employee pension is deducted from the gross pay that remains.
  const pension = pensionContributions(grossPay, rates, {
    method: input.pensionMethod ?? "none",
    basis: "percentage",
    value: input.employeePensionPercent ?? 0,
  });

  const personal = personalTax(
    {
      earnedIncome: grossPay,
      otherIncome: input.otherIncome,
      dividendIncome: input.otherDividends,
      pension,
      taxCode: input.taxCode,
      region: input.region,
      niCategory: input.niCategory,
      studentLoanPlan: input.studentLoanPlan,
      hasPostgraduateLoan: input.hasPostgraduateLoan,
      studentLoanBase: grossPay + (input.otherIncome ?? 0),
      blindPersons: input.blindPersons,
      marriageAllowance: input.marriageAllowance,
    },
    rates,
  );

  // Holiday pay is part of gross pay. Where it is accrued rather than rolled up,
  // it is withheld now and paid when leave is taken — so it leaves take-home but
  // still counts towards total capital.
  const holidayRate = rates.holidayAccrualRate;
  const holidayPay = grossPay - grossPay / (1 + holidayRate);
  const accruedHoliday = input.holidayPayMethod === "accrued" ? holidayPay : 0;

  const takeHome =
    grossPay -
    personal.incomeTax.total -
    personal.dividendTax.total -
    personal.nationalInsurance -
    personal.studentLoan.total -
    pension.employeeContribution +
    (input.otherIncome ?? 0) +
    (input.otherDividends ?? 0) -
    accruedHoliday;

  const totalCapital =
    takeHome + pension.employeeContribution + pension.employerContribution + accruedHoliday;

  const totalTax = costs.total - margin + personal.totalTax;

  const lines: BreakdownLine[] = [
    { label: "Assignment income", amount: assignment, kind: "subtotal" },
    {
      label: "Employment costs",
      amount: costs.total,
      kind: "deduction",
      children: [
        { label: "Umbrella margin", amount: margin, kind: "deduction" },
        { label: "Employer's National Insurance", amount: employerNI, kind: "deduction" },
        ...(levyRate > 0
          ? [
              {
                label: "Apprenticeship Levy",
                amount: apprenticeshipLevy,
                kind: "deduction" as const,
              },
            ]
          : []),
        ...(employerPension > 0
          ? [
              {
                label: "Employer's pension",
                amount: employerPension,
                kind: "deduction" as const,
              },
            ]
          : []),
      ],
    },
    { label: "Gross taxable pay", amount: grossPay, kind: "subtotal" },
    {
      label: "Taxes",
      amount:
        personal.incomeTax.total +
        personal.dividendTax.total +
        personal.nationalInsurance,
      kind: "deduction",
      children: [
        { label: "Income tax", amount: personal.incomeTax.total, kind: "deduction" },
        ...(personal.dividendTax.total > 0
          ? [
              {
                label: "Dividend tax",
                amount: personal.dividendTax.total,
                kind: "deduction" as const,
              },
            ]
          : []),
        {
          label: "Employee's National Insurance",
          amount: personal.nationalInsurance,
          kind: "deduction",
        },
      ],
    },
    ...(personal.studentLoan.total > 0
      ? [
          {
            label: "Student loan",
            amount: personal.studentLoan.total,
            kind: "deduction" as const,
          },
        ]
      : []),
    ...(pension.employeeContribution > 0
      ? [
          {
            label: "Pension contributions",
            amount: pension.employeeContribution,
            kind: "deduction" as const,
          },
        ]
      : []),
    ...(accruedHoliday > 0
      ? [
          {
            label: "Accrued holiday pay",
            amount: accruedHoliday,
            kind: "deduction" as const,
            hint: "Withheld now and paid when you take leave.",
          },
        ]
      : []),
    { label: "Take home", amount: takeHome, kind: "total" },
    ...(pension.totalContribution > 0 || accruedHoliday > 0
      ? [
          {
            label: "Other additions",
            amount: pension.totalContribution + accruedHoliday,
            kind: "addition" as const,
            children: [
              ...(pension.totalContribution > 0
                ? [
                    {
                      label: "Pension contributions",
                      amount: pension.totalContribution,
                      kind: "addition" as const,
                    },
                  ]
                : []),
              ...(accruedHoliday > 0
                ? [
                    {
                      label: "Accrued holiday pay",
                      amount: accruedHoliday,
                      kind: "addition" as const,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    { label: "Total capital", amount: totalCapital, kind: "total" },
  ];

  const notes = [
    "Employer's NI, the Apprenticeship Levy and employer pension are solved exactly against the assignment rate, not estimated.",
    input.holidayPayMethod === "accrued"
      ? "Holiday pay is accrued and retained by the umbrella until you take leave."
      : "Holiday pay is paid with each payment (rolled up), so it is already in your take-home.",
  ];

  const warnings: string[] = [];
  if (personal.studentLoan.planUnavailable) {
    warnings.push(
      `The selected student loan plan was not repayable in ${rates.taxYear}, so no repayment is included.`,
    );
  }

  return {
    taxYear: rates.taxYear,
    grossInput: assignment,
    lines,
    takeHome,
    totalCapital,
    totalTax,
    effectiveRate: assignment > 0 ? totalTax / assignment : 0,
    personal,
    notes,
    warnings,
  };
}
