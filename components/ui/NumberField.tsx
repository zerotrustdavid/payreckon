import { FieldLabel } from "./FieldLabel";

interface NumberFieldProps {
  id: string;
  label: string;
  /** Held as a string so the field can be cleared mid-edit. */
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  prefix,
  suffix,
  min = 0,
  max,
  step,
  placeholder,
}: NumberFieldProps) {
  return (
    <FieldLabel htmlFor={id} label={label} hint={hint}>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-faint">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          className={`tnum w-full rounded-lg border border-line bg-inset py-2.5 text-sm text-ink transition-colors placeholder:text-faint hover:border-line-strong focus:border-accent focus:outline-none ${
            prefix ? "pl-7" : "pl-3"
          } ${suffix ? "pr-9" : "pr-3"}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-faint">
            {suffix}
          </span>
        )}
      </div>
    </FieldLabel>
  );
}
