interface NumberFieldProps {
  id: string;
  label: string;
  /** Current value as a string so the field can be cleared while typing. */
  value: string;
  onChange: (value: string) => void;
  /** Optional short helper text shown under the label. */
  hint?: string;
  /** Optional unit prefix (e.g. "£") shown inside the input. */
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Labelled numeric input. Keeps its value as a string so the user can clear the
 * box mid-edit; the parent parses to a number for calculations.
 */
export function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  prefix,
  min = 0,
  max,
  step,
}: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      {hint && <span className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>}
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500 dark:text-zinc-400">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          className={`w-full rounded-lg border border-zinc-300 bg-white py-2.5 text-zinc-900 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10 ${
            prefix ? "pl-8 pr-3" : "px-3"
          }`}
        />
      </div>
    </div>
  );
}
