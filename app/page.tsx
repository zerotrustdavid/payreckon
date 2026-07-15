"use client";

import { useMemo, useState } from "react";
import { ContractTypeToggle } from "../components/calculator/ContractTypeToggle";
import {
  DayRateForm,
  type DayRateFormValues,
} from "../components/calculator/DayRateForm";
import { ResultsSummary } from "../components/calculator/ResultsSummary";
import { Card } from "../components/ui/Card";
import { NumberField } from "../components/ui/NumberField";
import { grossAnnualRevenue } from "../lib/calculations/income";
import {
  calculateScenario,
  DEFAULT_DIRECTOR_SALARY,
} from "../lib/calculations/scenarios";
import type { ContractMode } from "../lib/types";

const DEFAULT_VALUES: DayRateFormValues = {
  dayRate: "500",
  daysPerWeek: "5",
  weeksPerYear: "46",
};

/** Parses a form string to a non-negative number, defaulting to 0 when blank. */
function toNumber(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export default function Home() {
  const [values, setValues] = useState<DayRateFormValues>(DEFAULT_VALUES);
  const [contractMode, setContractMode] = useState<ContractMode>("inside");
  const [ltdSalary, setLtdSalary] = useState<string>(
    String(DEFAULT_DIRECTOR_SALARY),
  );

  const handleChange = (field: keyof DayRateFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const revenue = useMemo(
    () =>
      grossAnnualRevenue({
        dayRate: toNumber(values.dayRate),
        daysPerWeek: toNumber(values.daysPerWeek),
        weeksPerYear: toNumber(values.weeksPerYear),
      }),
    [values],
  );

  const result = useMemo(
    () =>
      calculateScenario(contractMode, revenue, {
        ltdSalary: toNumber(ltdSalary),
      }),
    [contractMode, revenue, ltdSalary],
  );

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            IR35 Contractor Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Model your income and tax exposure before running the numbers past
            your accountant. Rates: 2026/27 (England, Wales &amp; NI).
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <Card title="Day rate">
            <DayRateForm values={values} onChange={handleChange} />
          </Card>

          <Card title="Contract type">
            <ContractTypeToggle
              value={contractMode}
              onChange={setContractMode}
            />
            {contractMode === "outside-ltd" && (
              <div className="mt-5 max-w-xs">
                <NumberField
                  id="ltd-salary"
                  label="Director salary"
                  hint="Taken as salary; the rest is paid as dividends"
                  prefix="£"
                  value={ltdSalary}
                  onChange={setLtdSalary}
                  min={0}
                  step={500}
                />
              </div>
            )}
          </Card>

          <Card title="Estimate">
            <ResultsSummary contractMode={contractMode} result={result} />
          </Card>
        </div>

        <footer className="mt-10 border-t border-zinc-200 pt-6 text-xs leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            Estimates use 2026/27 UK tax rates for England, Wales &amp; Northern
            Ireland (Scotland sets different income tax bands). This is a
            gross-exposure guide before other business or company expenses, not
            financial advice — always confirm with a qualified accountant.
          </p>
        </footer>
      </main>
    </div>
  );
}
