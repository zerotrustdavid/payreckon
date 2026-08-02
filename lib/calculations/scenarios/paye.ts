import type {
  NICategoryLetter,
  StudentLoanPlan,
  TaxRegion,
  TaxYearRates,
} from "../../constants/types";
import { pensionContributions, type PensionMethod } from "../pension";
import { personalTax } from "../personalTax";
import type { BreakdownLine, CalculatorResult } from "./types";

export interface PayeInput {
  /** Annualised gross salary. */
  salary: number;
  bonus?: number;
  /** Annualised overtime pay (units x rate, already totalled). */
  overtime?: number;
  /** Cash allowances paid with salary (car allowance, shift allowance). */
  cashAllowances?: number;
  /**
   * Taxable benefits in kind. Taxed as income but not received as cash, and
   * subject to Class 1A employer NI rather than employee NI.
   */
  taxableBenefits?: number;
  employeePensionPercent?: number;
  employerPensionPercent?: number;
  pensionMethod?: PensionMethod;
  useQualifyingEarnings?: boolean;
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

/**
 * Permanent employment through PAYE.
 *
 * Cash pay is salary plus bonus, overtime and any cash allowances. Benefits in
 * kind are added to taxable income but never reach the bank account, so they
 * raise the tax bill without raising take-home — and they carry Class 1A employer
 * NI rather than employee NI, so they are excluded from the employee NI base.
 */
export function calculatePaye(
  input: PayeInput,
  rates: TaxYearRates,
): CalculatorResult {
  const salary = Math.max(0, input.salary || 0);
  const bonus = Math.max(0, input.bonus || 0);
  const overtime = Math.max(0, input.overtime || 0);
  const cashAllowances = Math.max(0, input.cashAllowances || 0);
  const benefits = Math.max(0, input.taxableBenefits || 0);

  const grossPay = salary + bonus + overtime + cashAllowances;

  const pension = pensionContributions(grossPay, rates, {
    method: input.pensionMethod ?? "none",
    basis: "percentage",
    value: input.employeePensionPercent ?? 0,
    employerValue: input.employerPensionPercent ?? 0,
    useQualifyingEarnings: input.useQualifyingEarnings,
  });

  const personal = personalTax(
    {
      // Benefits are taxable, so they join the income-tax measure...
      earnedIncome: grossPay + benefits,
      // ...but not the employee NI measure, which is cash pay only.
      niableIncome: grossPay,
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

  const takeHome =
    grossPay +
    Math.max(0, input.otherIncome || 0) +
    Math.max(0, input.otherDividends || 0) -
    personal.totalTax -
    pension.employeeContribution;

  const totalCapital =
    takeHome + pension.employeeContribution + pension.employerContribution;

  const additions = bonus + overtime + cashAllowances;

  const lines: BreakdownLine[] = [
    { label: "Salary", amount: salary, kind: "subtotal" },
    ...(additions > 0
      ? [
          {
            label: "Other additions",
            amount: additions,
            kind: "addition" as const,
            children: [
              ...(bonus > 0
                ? [{ label: "Bonus", amount: bonus, kind: "addition" as const }]
                : []),
              ...(overtime > 0
                ? [{ label: "Overtime", amount: overtime, kind: "addition" as const }]
                : []),
              ...(cashAllowances > 0
                ? [
                    {
                      label: "Cash allowances",
                      amount: cashAllowances,
                      kind: "addition" as const,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    { label: "Gross pay", amount: grossPay, kind: "subtotal" },
    ...(benefits > 0
      ? [
          {
            label: "Taxable benefits",
            amount: benefits,
            kind: "addition" as const,
            hint: "Taxed as income but not paid in cash, so take-home is unaffected.",
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
    { label: "Adjusted net income", amount: personal.adjustedNetIncome, kind: "subtotal" },
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
          label: "National Insurance",
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
    { label: "Take home", amount: takeHome, kind: "total" },
    ...(pension.totalContribution > 0
      ? [
          {
            label: "Pension contributions",
            amount: pension.totalContribution,
            kind: "addition" as const,
          },
        ]
      : []),
    { label: "Total capital", amount: totalCapital, kind: "total" },
  ];

  const notes: string[] = [];
  if (benefits > 0) {
    notes.push(
      "Benefits in kind increase taxable income and carry Class 1A employer NI, but are not part of your cash pay.",
    );
  }
  if (pension.employerContribution > 0) {
    notes.push("Employer pension contributions count towards total capital, not take-home.");
  }

  const warnings: string[] = [];
  if (personal.studentLoan.planUnavailable) {
    warnings.push(
      `The selected student loan plan was not repayable in ${rates.taxYear}, so no repayment is included.`,
    );
  }

  return {
    taxYear: rates.taxYear,
    grossInput: grossPay,
    chartSegments: [
      { label: "Take home", value: takeHome },
      { label: "Income tax", value: personal.incomeTax.total + personal.dividendTax.total },
      { label: "National Insurance", value: personal.nationalInsurance },
      { label: "Student loan", value: personal.studentLoan.total },
      { label: "Pension", value: pension.employeeContribution },
    ],
    lines,
    takeHome,
    totalCapital,
    totalTax: personal.totalTax,
    effectiveRate: grossPay > 0 ? personal.totalTax / grossPay : 0,
    personal,
    notes,
    warnings,
  };
}
