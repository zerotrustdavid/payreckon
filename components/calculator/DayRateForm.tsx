import { NumberField } from "../ui/NumberField";

/**
 * Raw form values, kept as strings so inputs can be cleared while editing.
 * The page parses these into numbers for the income calculation.
 */
export interface DayRateFormValues {
  dayRate: string;
  daysPerWeek: string;
  weeksPerYear: string;
}

interface DayRateFormProps {
  values: DayRateFormValues;
  onChange: (field: keyof DayRateFormValues, value: string) => void;
}

/**
 * Collects the three inputs that drive gross annual revenue: day rate,
 * working days per week, and working weeks per year.
 */
export function DayRateForm({ values, onChange }: DayRateFormProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <NumberField
        id="day-rate"
        label="Day rate"
        prefix="£"
        value={values.dayRate}
        onChange={(v) => onChange("dayRate", v)}
        min={0}
        step={25}
      />
      <NumberField
        id="days-per-week"
        label="Working days / week"
        value={values.daysPerWeek}
        onChange={(v) => onChange("daysPerWeek", v)}
        min={0}
        max={7}
        step={0.5}
      />
      <NumberField
        id="weeks-per-year"
        label="Working weeks / year"
        hint="After holiday and gaps between contracts"
        value={values.weeksPerYear}
        onChange={(v) => onChange("weeksPerYear", v)}
        min={0}
        max={52}
        step={1}
      />
    </div>
  );
}
