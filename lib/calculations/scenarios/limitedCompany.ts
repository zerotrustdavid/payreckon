import type {
  NICategoryLetter,
  StudentLoanPlan,
  TaxRegion,
  TaxYearRates,
} from "../../constants/types";
import { corporationTax } from "../corporationTax";
import { employerNI } from "../nationalInsurance";
import { pensionContributions, type PensionMethod } from "../pension";
import { personalTax } from "../personalTax";
import type { BreakdownLine, CalculatorResult } from "./types";

/**
 * How the director's salary is set.
 *  • none                 — take everything as dividends
 *  • secondary-threshold  — the highest salary that attracts no employer NI
 *  • personal-allowance   — salary equal to the personal allowance
 *  • custom               — a figure the user supplies
 */
export type SalaryStrategy =
  | "none"
  | "secondary-threshold"
  | "personal-allowance"
  | "custom";

export interface LimitedCompanyInput {
  /** Annualised company revenue. */
  revenue: number;
  recurringExpenses?: number;
  oneOffExpenses?: number;
  salaryStrategy?: SalaryStrategy;
  customSalary?: number;
  claimEmploymentAllowance?: boolean;
  /** Employment Allowance requires an employee other than a sole director. */
  hasSecondEmployee?: boolean;
  /** Company pension contribution — an allowable expense. */
  employerPensionContribution?: number;
  employeePensionPercent?: number;
  pensionMethod?: PensionMethod;
  /** Distribute the whole post-tax profit as dividends. */
  distributeAllProfit?: boolean;
  /** Profit deliberately retained in the company when not distributing all. */
  retainedProfit?: number;
  /** Your share of the company, for jointly owned businesses (percentage). */
  ownershipSharePercent?: number;
  badrGain?: number;
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

/** Resolves the chosen salary strategy into an annual salary. */
export function resolveSalary(
  input: LimitedCompanyInput,
  rates: TaxYearRates,
): number {
  switch (input.salaryStrategy ?? "personal-allowance") {
    case "none":
      return 0;
    case "secondary-threshold":
      return rates.nationalInsurance.class1.secondaryThreshold;
    case "custom":
      return Math.max(0, input.customSalary ?? 0);
    case "personal-allowance":
    default:
      return rates.incomeTax.personalAllowance;
  }
}

/**
 * Outside IR35 through the contractor's own limited company.
 *
 * Revenue is taxed twice over: corporation tax inside the company, then income
 * tax and dividend tax on whatever is extracted. Salary and employer pension are
 * deductible before corporation tax, which is why the salary level moves the
 * total materially.
 */
export function calculateLimitedCompany(
  input: LimitedCompanyInput,
  rates: TaxYearRates,
): CalculatorResult {
  const revenue = Math.max(0, input.revenue || 0);
  const expenses =
    Math.max(0, input.recurringExpenses || 0) + Math.max(0, input.oneOffExpenses || 0);

  const salary = Math.min(resolveSalary(input, rates), revenue);
  const companyPension = Math.max(0, input.employerPensionContribution || 0);

  // Employment Allowance offsets employer NI, but a company whose only employee is
  // a single director cannot claim it.
  const grossEmployerNI = employerNI(salary, rates, input.niCategory);
  const employmentAllowanceEligible =
    (input.claimEmploymentAllowance ?? false) && (input.hasSecondEmployee ?? false);
  const employmentAllowanceUsed = employmentAllowanceEligible
    ? Math.min(grossEmployerNI, rates.nationalInsurance.class1.employmentAllowance)
    : 0;
  const netEmployerNI = grossEmployerNI - employmentAllowanceUsed;

  const operatingCosts = expenses + salary + netEmployerNI + companyPension;
  const profitBeforeTax = Math.max(0, revenue - operatingCosts);
  const ct = corporationTax(profitBeforeTax, rates);
  const netProfit = Math.max(0, profitBeforeTax - ct.total);

  const distributeAll = input.distributeAllProfit ?? true;
  const retained = distributeAll
    ? 0
    : Math.min(Math.max(0, input.retainedProfit || 0), netProfit);
  const distributed = Math.max(0, netProfit - retained);

  const sharePercent = Math.min(100, Math.max(0, input.ownershipSharePercent ?? 100));
  const yourDividends = distributed * (sharePercent / 100);

  const pension = pensionContributions(salary, rates, {
    method: input.pensionMethod ?? "none",
    basis: "percentage",
    value: input.employeePensionPercent ?? 0,
  });

  const personal = personalTax(
    {
      earnedIncome: salary,
      otherIncome: input.otherIncome,
      dividendIncome: yourDividends + Math.max(0, input.otherDividends || 0),
      pension,
      taxCode: input.taxCode,
      region: input.region,
      niCategory: input.niCategory,
      studentLoanPlan: input.studentLoanPlan,
      hasPostgraduateLoan: input.hasPostgraduateLoan,
      blindPersons: input.blindPersons,
      marriageAllowance: input.marriageAllowance,
    },
    rates,
  );

  const personalGrossReceipts =
    salary +
    yourDividends +
    Math.max(0, input.otherIncome || 0) +
    Math.max(0, input.otherDividends || 0);

  const takeHome =
    personalGrossReceipts - personal.totalTax - pension.employeeContribution;

  const badrGain = Math.max(0, input.badrGain || 0);
  const badrTax = badrGain * rates.badrRate;
  const badrNet = badrGain - badrTax;

  const totalCapital =
    takeHome + pension.employeeContribution + companyPension + badrNet;

  const totalTax = netEmployerNI + ct.total + personal.totalTax + badrTax;

  const lines: BreakdownLine[] = [
    { label: "Revenue", amount: revenue, kind: "subtotal" },
    {
      label: "Operating expenses",
      amount: operatingCosts,
      kind: "deduction",
      children: [
        ...(expenses > 0
          ? [{ label: "Expenses", amount: expenses, kind: "deduction" as const }]
          : []),
        { label: "Salary", amount: salary, kind: "deduction" },
        { label: "Employer's National Insurance", amount: netEmployerNI, kind: "deduction" },
        ...(companyPension > 0
          ? [
              {
                label: "Company pension contributions",
                amount: companyPension,
                kind: "deduction" as const,
              },
            ]
          : []),
      ],
    },
    { label: "Profit before tax", amount: profitBeforeTax, kind: "subtotal" },
    {
      label: "Corporation tax",
      amount: ct.total,
      kind: "deduction",
      hint:
        ct.basis === "marginal-relief"
          ? `Marginal relief of ${ct.marginalRelief.toFixed(2)} applied — effective rate ${(ct.effectiveRate * 100).toFixed(2)}%.`
          : undefined,
    },
    { label: "Net profit", amount: netProfit, kind: "subtotal" },
    ...(retained > 0
      ? [{ label: "Profit retained in company", amount: retained, kind: "deduction" as const }]
      : []),
    {
      label: sharePercent < 100 ? "Your share of distributed profit" : "Dividends",
      amount: yourDividends,
      kind: "subtotal",
    },
    {
      label: "Personal taxes",
      amount: personal.totalTax,
      kind: "deduction",
      children: [
        { label: "Income tax", amount: personal.incomeTax.total, kind: "deduction" },
        { label: "Dividend tax", amount: personal.dividendTax.total, kind: "deduction" },
        {
          label: "Employee's National Insurance",
          amount: personal.nationalInsurance,
          kind: "deduction",
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
      ],
    },
    { label: "Take home", amount: takeHome, kind: "total" },
    ...(pension.employeeContribution + companyPension + badrNet > 0
      ? [
          {
            label: "Other additions",
            amount: pension.employeeContribution + companyPension + badrNet,
            kind: "addition" as const,
            children: [
              ...(pension.employeeContribution + companyPension > 0
                ? [
                    {
                      label: "Pension contributions",
                      amount: pension.employeeContribution + companyPension,
                      kind: "addition" as const,
                    },
                  ]
                : []),
              ...(badrNet > 0
                ? [
                    {
                      label: "Business Asset Disposal Relief gain (after tax)",
                      amount: badrNet,
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
    `Corporation tax assumes no associated companies and a 12-month accounting period.`,
    employmentAllowanceEligible
      ? "Employment Allowance claimed against employer's National Insurance."
      : "Employment Allowance not claimed — a company whose only employee is a single director is not eligible.",
  ];
  if (sharePercent < 100) {
    notes.push(`Dividends shown are your ${sharePercent}% share of distributed profit.`);
  }

  const warnings: string[] = [];
  if (personal.studentLoan.planUnavailable) {
    warnings.push(
      `The selected student loan plan was not repayable in ${rates.taxYear}, so no repayment is included.`,
    );
  }
  if ((input.claimEmploymentAllowance ?? false) && !(input.hasSecondEmployee ?? false)) {
    warnings.push(
      "Employment Allowance cannot be claimed by a company whose only employee is a director — it has been excluded.",
    );
  }

  return {
    taxYear: rates.taxYear,
    grossInput: revenue,
    lines,
    takeHome,
    totalCapital,
    totalTax,
    effectiveRate: revenue > 0 ? totalTax / revenue : 0,
    personal,
    notes,
    warnings,
  };
}
