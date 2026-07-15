import { corporationTax } from "../corporationTax";
import { dividendTax } from "../dividendTax";
import { incomeTax } from "../incomeTax";
import { class1EmployeeNI, employerNI } from "../nationalInsurance";
import { formatGBP } from "../../format";
import type { ScenarioResult } from "../../types";

/** Default director salary (the personal allowance) if none is supplied. */
export const DEFAULT_DIRECTOR_SALARY = 12_570;

/**
 * Outside IR35 via the contractor's own limited company, extracting profit as a
 * low salary plus dividends.
 *
 * Flow (all deductions before other business expenses):
 *   1. Company pays the director a salary; employer NI is due on it.
 *   2. Corporation tax applies to the remaining profit (gross − salary − employer NI).
 *   3. Post-CT profit is paid out entirely as dividends.
 *   4. Personally: income tax + employee NI on the salary, then dividend tax on
 *      the dividends (stacked on top of the salary).
 *
 * Total exposure = employer NI + corporation tax + salary income tax +
 * salary employee NI + dividend tax.
 */
export function outsideLtd(
  grossRevenue: number,
  salary: number = DEFAULT_DIRECTOR_SALARY,
): ScenarioResult {
  const gross = Math.max(0, grossRevenue);
  // Salary can't exceed available revenue.
  const directorSalary = Math.max(0, Math.min(salary, gross));

  const employerNic = employerNI(directorSalary);
  const profitBeforeCT = Math.max(0, gross - directorSalary - employerNic);
  const corpTax = corporationTax(profitBeforeCT);
  const dividends = Math.max(0, profitBeforeCT - corpTax);

  const salaryIncomeTax = incomeTax(directorSalary);
  const salaryEmployeeNI = class1EmployeeNI(directorSalary);
  const divTax = dividendTax(directorSalary, dividends);

  const totalTax =
    employerNic + corpTax + salaryIncomeTax + salaryEmployeeNI + divTax;

  return {
    grossRevenue: gross,
    lines: [
      { label: "Corporation tax", amount: corpTax },
      { label: "Employer NI (on salary)", amount: employerNic },
      { label: "Income tax (on salary)", amount: salaryIncomeTax },
      { label: "Employee NI (on salary)", amount: salaryEmployeeNI },
      { label: "Dividend tax", amount: divTax },
    ],
    totalTax,
    takeHome: gross - totalTax,
    effectiveRate: gross > 0 ? totalTax / gross : 0,
    notes: [
      `Assumes a director salary of ${formatGBP(directorSalary)}, with all remaining post-corporation-tax profit taken as dividends.`,
      "Employment Allowance not claimed (single-director company with no other employees).",
      "Corporation tax assumes no associated companies and a 12-month accounting period.",
    ],
  };
}
