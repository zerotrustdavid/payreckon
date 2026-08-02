"use client";

import { TAX_YEARS } from "../../lib/constants";
import type { TaxYear } from "../../lib/constants/types";
import { Disclosure } from "../ui/Disclosure";
import { FieldLabel } from "../ui/FieldLabel";
import { NumberField } from "../ui/NumberField";
import { SegmentedControl } from "../ui/SegmentedControl";
import { SelectField } from "../ui/SelectField";
import {
  FREQUENCIES,
  MARRIAGE_ALLOWANCE,
  NI_CATEGORIES,
  PENSION_METHODS,
  REGIONS,
  STUDENT_LOAN_PLANS,
  type CommonInputs,
} from "./commonInputs";

type Update = <K extends keyof CommonInputs>(key: K, value: CommonInputs[K]) => void;

/** Rate, frequency and the working pattern that annualises it. */
export function RateFields({
  inputs,
  update,
  rateLabel,
}: {
  inputs: CommonInputs;
  update: Update;
  rateLabel: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id="rate"
          label={rateLabel}
          prefix="£"
          value={inputs.rate}
          onChange={(v) => update("rate", v)}
          step={25}
        />
        <FieldLabel label="Paid per">
          <SegmentedControl
            ariaLabel="Rate frequency"
            value={inputs.frequency}
            segments={FREQUENCIES}
            onChange={(v) => update("frequency", v)}
            size="sm"
            full
          />
        </FieldLabel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {inputs.frequency === "hour" && (
          <NumberField
            id="hours-per-week"
            label="Hours per week"
            value={inputs.hoursPerWeek}
            onChange={(v) => update("hoursPerWeek", v)}
            step={0.5}
            max={168}
          />
        )}
        {(inputs.frequency === "hour" || inputs.frequency === "week") && (
          <NumberField
            id="weeks-per-year"
            label="Weeks per year"
            hint="After holidays and gaps between contracts"
            value={inputs.weeksPerYear}
            onChange={(v) => update("weeksPerYear", v)}
            max={52}
          />
        )}
        {inputs.frequency === "day" && (
          <NumberField
            id="days-per-year"
            label="Days per year"
            hint="Billable days after holidays and gaps"
            value={inputs.daysPerYear}
            onChange={(v) => update("daysPerYear", v)}
            max={365}
          />
        )}
        {inputs.frequency === "month" && (
          <NumberField
            id="months-per-year"
            label="Months per year"
            value={inputs.monthsPerYear}
            onChange={(v) => update("monthsPerYear", v)}
            max={12}
          />
        )}
      </div>
    </div>
  );
}

/** Tax year and region — the two settings that change every figure. */
export function TaxYearFields({
  inputs,
  update,
}: {
  inputs: CommonInputs;
  update: Update;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField
        id="tax-year"
        label="Tax year"
        value={inputs.taxYear}
        options={TAX_YEARS.map((year) => ({ value: year, label: year }))}
        onChange={(v) => update("taxYear", v as TaxYear)}
      />
      <SelectField
        id="region"
        label="Where you pay tax"
        hint="Scotland sets its own income tax bands"
        value={inputs.region}
        options={REGIONS}
        onChange={(v) => update("region", v)}
      />
    </div>
  );
}

/**
 * The detail that makes the result precise rather than indicative. Tucked behind
 * a disclosure so the common case stays a two-field form.
 */
export function AdvancedFields({
  inputs,
  update,
  children,
}: {
  inputs: CommonInputs;
  update: Update;
  /** Calculator-specific advanced inputs, rendered above the shared ones. */
  children?: React.ReactNode;
}) {
  return (
    <Disclosure
      summary="Advanced options"
      hint="Tax code, NI category, student loan, pension and other income"
    >
      <div className="flex flex-col gap-5">
        {children}

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="pension-method"
            label="Pension contributions"
            value={inputs.pensionMethod}
            options={PENSION_METHODS}
            onChange={(v) => update("pensionMethod", v)}
          />
          {inputs.pensionMethod !== "none" && (
            <NumberField
              id="pension-percent"
              label="Your contribution"
              suffix="%"
              value={inputs.employeePensionPercent}
              onChange={(v) => update("employeePensionPercent", v)}
              step={1}
              max={100}
            />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="student-loan"
            label="Student loan"
            value={inputs.studentLoanPlan}
            options={STUDENT_LOAN_PLANS}
            onChange={(v) => update("studentLoanPlan", v)}
          />
          <FieldLabel label="Postgraduate loan" hint="Repaid alongside any other plan">
            <label className="flex items-center gap-2.5 rounded-lg border border-line bg-inset px-3 py-2.5">
              <input
                type="checkbox"
                checked={inputs.hasPostgraduateLoan}
                onChange={(e) => update("hasPostgraduateLoan", e.target.checked)}
                className="h-4 w-4 accent-[var(--pr-accent)]"
              />
              <span className="text-sm text-muted">
                I also have a postgraduate loan
              </span>
            </label>
          </FieldLabel>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="tax-code"
            label="Tax code"
            hint="Leave blank for the standard allowance"
            value={inputs.taxCode}
            onChange={(v) => update("taxCode", v)}
            placeholder="1257L"
          />
          <SelectField
            id="ni-category"
            label="NI category"
            value={inputs.niCategory}
            options={NI_CATEGORIES}
            onChange={(v) => update("niCategory", v)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            id="other-income"
            label="Other income"
            hint="Taxed alongside this engagement"
            prefix="£"
            value={inputs.otherIncome}
            onChange={(v) => update("otherIncome", v)}
            step={1000}
          />
          <NumberField
            id="other-dividends"
            label="Other dividends"
            prefix="£"
            value={inputs.otherDividends}
            onChange={(v) => update("otherDividends", v)}
            step={1000}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="marriage-allowance"
            label="Marriage Allowance"
            value={inputs.marriageAllowance}
            options={MARRIAGE_ALLOWANCE}
            onChange={(v) => update("marriageAllowance", v)}
          />
          <FieldLabel label="Blind Person's Allowance">
            <label className="flex items-center gap-2.5 rounded-lg border border-line bg-inset px-3 py-2.5">
              <input
                type="checkbox"
                checked={inputs.blindPersons}
                onChange={(e) => update("blindPersons", e.target.checked)}
                className="h-4 w-4 accent-[var(--pr-accent)]"
              />
              <span className="text-sm text-muted">Claim the allowance</span>
            </label>
          </FieldLabel>
        </div>
      </div>
    </Disclosure>
  );
}
