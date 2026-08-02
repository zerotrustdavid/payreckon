"use client";

import { useMemo, useState } from "react";
import { annualise } from "../../lib/calculations/annualise";
import { calculatePaye } from "../../lib/calculations/scenarios";
import { getRates } from "../../lib/constants";
import { Card } from "../ui/Card";
import { NumberField } from "../ui/NumberField";
import { CalculatorShell } from "./CalculatorShell";
import { AdvancedFields, RateFields, TaxYearFields } from "./CommonFields";
import { DEFAULT_COMMON, num, patternFrom, type CommonInputs } from "./commonInputs";
import { ResultsPanel } from "./ResultsPanel";

export function PayeCalculator() {
  const [common, setCommon] = useState<CommonInputs>({
    ...DEFAULT_COMMON,
    rate: "60000",
    frequency: "year",
  });
  const [bonus, setBonus] = useState("0");
  const [overtime, setOvertime] = useState("0");
  const [cashAllowances, setCashAllowances] = useState("0");
  const [taxableBenefits, setTaxableBenefits] = useState("0");
  const [employerPension, setEmployerPension] = useState("3");

  const update = <K extends keyof CommonInputs>(key: K, value: CommonInputs[K]) =>
    setCommon((prev) => ({ ...prev, [key]: value }));

  const pattern = useMemo(() => patternFrom(common), [common]);

  const result = useMemo(() => {
    const rates = getRates(common.taxYear);
    const salary = annualise(num(common.rate), common.frequency, pattern);

    return calculatePaye(
      {
        salary,
        bonus: num(bonus),
        overtime: num(overtime),
        cashAllowances: num(cashAllowances),
        taxableBenefits: num(taxableBenefits),
        employeePensionPercent: num(common.employeePensionPercent),
        employerPensionPercent: num(employerPension),
        pensionMethod: common.pensionMethod,
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
  }, [common, pattern, bonus, overtime, cashAllowances, taxableBenefits, employerPension]);

  return (
    <CalculatorShell
      eyebrow="Permanent employee · via PAYE"
      title="Salary calculator"
      description="Work out your take-home pay as a permanent employee, so you can compare a salaried role against a contract on a like-for-like basis."
      inputs={
        <>
          <Card title="Your salary">
            <div className="flex flex-col gap-5">
              <RateFields inputs={common} update={update} rateLabel="Gross salary" />
              <TaxYearFields inputs={common} update={update} />
            </div>
          </Card>

          <Card title="Additional pay">
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="bonus"
                  label="Annual bonus"
                  prefix="£"
                  value={bonus}
                  onChange={setBonus}
                  step={500}
                />
                <NumberField
                  id="overtime"
                  label="Overtime"
                  hint="Total for the year"
                  prefix="£"
                  value={overtime}
                  onChange={setOvertime}
                  step={500}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="cash-allowances"
                  label="Cash allowances"
                  hint="Car or shift allowance"
                  prefix="£"
                  value={cashAllowances}
                  onChange={setCashAllowances}
                  step={500}
                />
                <NumberField
                  id="taxable-benefits"
                  label="Taxable benefits"
                  hint="Taxed, but not paid in cash"
                  prefix="£"
                  value={taxableBenefits}
                  onChange={setTaxableBenefits}
                  step={500}
                />
              </div>
            </div>
          </Card>

          <AdvancedFields inputs={common} update={update}>
            <NumberField
              id="employer-pension"
              label="Employer pension contribution"
              hint="Counts towards total capital, not take-home"
              suffix="%"
              value={employerPension}
              onChange={setEmployerPension}
              step={1}
              max={100}
            />
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
