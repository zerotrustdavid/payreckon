"use client";

import { useMemo, useState } from "react";
import { annualise } from "../../lib/calculations/annualise";
import {
  calculateLimitedCompany,
  type SalaryStrategy,
} from "../../lib/calculations/scenarios";
import { getRates } from "../../lib/constants";
import { Card } from "../ui/Card";
import { FieldLabel } from "../ui/FieldLabel";
import { NumberField } from "../ui/NumberField";
import { SegmentedControl } from "../ui/SegmentedControl";
import { SelectField } from "../ui/SelectField";
import { CalculatorShell } from "./CalculatorShell";
import { AdvancedFields, RateFields, TaxYearFields } from "./CommonFields";
import { DEFAULT_COMMON, num, patternFrom, type CommonInputs } from "./commonInputs";
import { ResultsPanel } from "./ResultsPanel";

const SALARY_STRATEGIES = [
  { value: "personal-allowance", label: "Personal allowance" },
  { value: "secondary-threshold", label: "No employer NI" },
  { value: "none", label: "No salary" },
  { value: "custom", label: "Custom amount" },
] as const;

const EXPENSE_PERIODS = [
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
] as const;

export function LimitedCompanyCalculator() {
  const [common, setCommon] = useState<CommonInputs>(DEFAULT_COMMON);
  const [salaryStrategy, setSalaryStrategy] =
    useState<SalaryStrategy>("personal-allowance");
  const [customSalary, setCustomSalary] = useState("12570");
  const [recurringExpenses, setRecurringExpenses] = useState("0");
  const [expensePeriod, setExpensePeriod] =
    useState<(typeof EXPENSE_PERIODS)[number]["value"]>("month");
  const [oneOffExpenses, setOneOffExpenses] = useState("0");
  const [companyPension, setCompanyPension] = useState("0");
  const [claimEA, setClaimEA] = useState(false);
  const [secondEmployee, setSecondEmployee] = useState(false);
  const [ownership, setOwnership] = useState("100");
  const [badrGain, setBadrGain] = useState("0");

  const update = <K extends keyof CommonInputs>(key: K, value: CommonInputs[K]) =>
    setCommon((prev) => ({ ...prev, [key]: value }));

  const pattern = useMemo(() => patternFrom(common), [common]);

  const result = useMemo(() => {
    const rates = getRates(common.taxYear);
    const revenue = annualise(num(common.rate), common.frequency, pattern);

    return calculateLimitedCompany(
      {
        revenue,
        recurringExpenses: num(recurringExpenses) * (expensePeriod === "month" ? 12 : 1),
        oneOffExpenses: num(oneOffExpenses),
        salaryStrategy,
        customSalary: num(customSalary),
        claimEmploymentAllowance: claimEA,
        hasSecondEmployee: secondEmployee,
        employerPensionContribution: num(companyPension),
        employeePensionPercent: num(common.employeePensionPercent),
        pensionMethod: common.pensionMethod,
        ownershipSharePercent: num(ownership) || 100,
        badrGain: num(badrGain),
        otherIncome: num(common.otherIncome),
        otherDividends: num(common.otherDividends),
        taxCode: common.taxCode,
        region: common.region,
        niCategory: common.niCategory,
        studentLoanPlan: common.studentLoanPlan,
        hasPostgraduateLoan: common.hasPostgraduateLoan,
        blindPersons: common.blindPersons,
        marriageAllowance: common.marriageAllowance,
      },
      rates,
    );
  }, [
    common,
    pattern,
    salaryStrategy,
    customSalary,
    recurringExpenses,
    expensePeriod,
    oneOffExpenses,
    companyPension,
    claimEA,
    secondEmployee,
    ownership,
    badrGain,
  ]);

  return (
    <CalculatorShell
      eyebrow="Outside IR35 · via a limited company"
      title="Outside IR35 calculator"
      description="Operating as a genuine business through your own limited company. Revenue is taxed twice — corporation tax inside the company, then income and dividend tax on whatever you extract — so how you take it out matters as much as what you bill."
      inputs={
        <>
          <Card title="Your contract">
            <div className="flex flex-col gap-5">
              <RateFields inputs={common} update={update} rateLabel="Contract rate" />
              <TaxYearFields inputs={common} update={update} />
            </div>
          </Card>

          <Card title="Taking money out">
            <div className="flex flex-col gap-5">
              <SelectField
                id="salary-strategy"
                label="Director's salary"
                hint="Salary is deductible before corporation tax, but attracts income tax and NI"
                value={salaryStrategy}
                options={SALARY_STRATEGIES}
                onChange={setSalaryStrategy}
              />
              {salaryStrategy === "custom" && (
                <NumberField
                  id="custom-salary"
                  label="Salary amount"
                  prefix="£"
                  value={customSalary}
                  onChange={setCustomSalary}
                  step={500}
                />
              )}
              <NumberField
                id="ownership"
                label="Your share of the company"
                hint="Reduce this if the business is jointly owned"
                suffix="%"
                value={ownership}
                onChange={setOwnership}
                max={100}
              />
            </div>
          </Card>

          <Card title="Company costs">
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="recurring-expenses"
                  label="Recurring expenses"
                  hint="Accountancy, software, insurance"
                  prefix="£"
                  value={recurringExpenses}
                  onChange={setRecurringExpenses}
                  step={50}
                />
                <FieldLabel label="Charged per">
                  <SegmentedControl
                    ariaLabel="Expense period"
                    value={expensePeriod}
                    segments={EXPENSE_PERIODS}
                    onChange={setExpensePeriod}
                    size="sm"
                    full
                  />
                </FieldLabel>
              </div>
              <NumberField
                id="one-off-expenses"
                label="One-off expenses"
                hint="Equipment, training, professional fees"
                prefix="£"
                value={oneOffExpenses}
                onChange={setOneOffExpenses}
                step={100}
              />
            </div>
          </Card>

          <AdvancedFields inputs={common} update={update}>
            <NumberField
              id="company-pension"
              label="Company pension contribution"
              hint="Paid by the company — an allowable expense"
              prefix="£"
              value={companyPension}
              onChange={setCompanyPension}
              step={500}
            />
            <NumberField
              id="badr-gain"
              label="Business Asset Disposal Relief gain"
              hint="Include if you are closing the company this year"
              prefix="£"
              value={badrGain}
              onChange={setBadrGain}
              step={1000}
            />
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2.5 rounded-lg border border-line bg-inset px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={secondEmployee}
                  onChange={(e) => setSecondEmployee(e.target.checked)}
                  className="h-4 w-4 accent-[var(--pr-accent)]"
                />
                <span className="text-sm text-muted">
                  The company employs someone besides a single director
                </span>
              </label>
              <label className="flex items-center gap-2.5 rounded-lg border border-line bg-inset px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={claimEA}
                  onChange={(e) => setClaimEA(e.target.checked)}
                  className="h-4 w-4 accent-[var(--pr-accent)]"
                />
                <span className="text-sm text-muted">Claim Employment Allowance</span>
              </label>
            </div>
          </AdvancedFields>
        </>
      }
      results={
        <ResultsPanel
          result={result}
          pattern={pattern}
          chartSegments={result.chartSegments}
        />
      }
    />
  );
}
