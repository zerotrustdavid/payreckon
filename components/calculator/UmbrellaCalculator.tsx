"use client";

import { useMemo, useState } from "react";
import { annualise } from "../../lib/calculations/annualise";
import { calculateUmbrella } from "../../lib/calculations/scenarios";
import { getRates } from "../../lib/constants";
import { Card } from "../ui/Card";
import { FieldLabel } from "../ui/FieldLabel";
import { NumberField } from "../ui/NumberField";
import { SegmentedControl } from "../ui/SegmentedControl";
import { CalculatorShell } from "./CalculatorShell";
import { AdvancedFields, RateFields, TaxYearFields } from "./CommonFields";
import { DEFAULT_COMMON, num, patternFrom, type CommonInputs } from "./commonInputs";
import { ResultsPanel } from "./ResultsPanel";

const MARGIN_PERIODS = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
] as const;

const HOLIDAY_METHODS = [
  { value: "advanced", label: "Paid with each payment" },
  { value: "accrued", label: "Accrued for later" },
] as const;

export function UmbrellaCalculator() {
  const [common, setCommon] = useState<CommonInputs>(DEFAULT_COMMON);
  const [margin, setMargin] = useState("25");
  const [marginPeriod, setMarginPeriod] =
    useState<(typeof MARGIN_PERIODS)[number]["value"]>("week");
  const [applyLevy, setApplyLevy] = useState(true);
  const [holidayMethod, setHolidayMethod] =
    useState<(typeof HOLIDAY_METHODS)[number]["value"]>("advanced");
  const [employerPension, setEmployerPension] = useState("0");

  const update = <K extends keyof CommonInputs>(key: K, value: CommonInputs[K]) =>
    setCommon((prev) => ({ ...prev, [key]: value }));

  const pattern = useMemo(() => patternFrom(common), [common]);

  const result = useMemo(() => {
    const rates = getRates(common.taxYear);
    const assignmentIncome = annualise(num(common.rate), common.frequency, pattern);

    const marginMultiplier =
      marginPeriod === "week" ? pattern.weeksPerYear : marginPeriod === "month" ? 12 : 1;

    return calculateUmbrella(
      {
        assignmentIncome,
        umbrellaMargin: num(margin) * marginMultiplier,
        applyApprenticeshipLevy: applyLevy,
        holidayPayMethod: holidayMethod,
        employerPensionPercent: num(employerPension),
        employeePensionPercent: num(common.employeePensionPercent),
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
  }, [common, pattern, margin, marginPeriod, applyLevy, holidayMethod, employerPension]);

  return (
    <CalculatorShell
      eyebrow="Inside IR35 · via an umbrella company"
      title="Inside IR35 calculator"
      description="When a contract is caught by the IR35 rules and paid through an umbrella company, your assignment rate has to cover every employment cost before any taxable pay exists. This works out exactly what reaches you."
      inputs={
        <>
          <Card title="Your assignment">
            <div className="flex flex-col gap-5">
              <RateFields inputs={common} update={update} rateLabel="Assignment rate" />
              <TaxYearFields inputs={common} update={update} />
            </div>
          </Card>

          <Card title="Umbrella company">
            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="margin"
                  label="Umbrella margin"
                  hint="What the umbrella retains"
                  prefix="£"
                  value={margin}
                  onChange={setMargin}
                  step={1}
                />
                <FieldLabel label="Margin charged per">
                  <SegmentedControl
                    ariaLabel="Margin period"
                    value={marginPeriod}
                    segments={MARGIN_PERIODS}
                    onChange={setMarginPeriod}
                    size="sm"
                    full
                  />
                </FieldLabel>
              </div>

              <FieldLabel
                label="Holiday pay"
                hint="Rolled up into each payment, or held back until you take leave"
              >
                <SegmentedControl
                  ariaLabel="Holiday pay method"
                  value={holidayMethod}
                  segments={HOLIDAY_METHODS}
                  onChange={setHolidayMethod}
                  size="sm"
                  full
                />
              </FieldLabel>

              <label className="flex items-center gap-2.5 rounded-lg border border-line bg-inset px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={applyLevy}
                  onChange={(e) => setApplyLevy(e.target.checked)}
                  className="h-4 w-4 accent-[var(--pr-accent)]"
                />
                <span className="text-sm text-muted">
                  Umbrella passes on the Apprenticeship Levy
                </span>
              </label>
            </div>
          </Card>

          <AdvancedFields inputs={common} update={update}>
            <NumberField
              id="employer-pension"
              label="Employer pension contribution"
              hint="Deducted from the assignment rate before your gross pay"
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
