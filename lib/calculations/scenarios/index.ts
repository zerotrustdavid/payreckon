export type { BreakdownLine, CalculatorResult } from "./types";
export {
  calculateUmbrella,
  solveGrossPay,
  type EmploymentCosts,
  type HolidayPayMethod,
  type UmbrellaInput,
} from "./umbrella";
export {
  calculateLimitedCompany,
  resolveSalary,
  type LimitedCompanyInput,
  type SalaryStrategy,
} from "./limitedCompany";
export { calculatePaye, type PayeInput } from "./paye";

/** The three working arrangements the site models. */
export const CALCULATORS = [
  {
    slug: "inside-ir35-umbrella",
    name: "Inside IR35",
    subtitle: "Via an umbrella company",
    description:
      "Work caught by the IR35 rules, paid through an umbrella company as employment income.",
  },
  {
    slug: "outside-ir35-limited",
    name: "Outside IR35",
    subtitle: "Via a limited company",
    description:
      "Work outside the IR35 rules, run through your own limited company on salary and dividends.",
  },
  {
    slug: "paye-salary",
    name: "Salary",
    subtitle: "Permanent employee via PAYE",
    description:
      "Permanent employment, to compare a contract against a salaried role.",
  },
] as const;

export type CalculatorSlug = (typeof CALCULATORS)[number]["slug"];
