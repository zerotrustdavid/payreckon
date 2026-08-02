import { FieldLabel } from "./FieldLabel";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  hint?: string;
  inline?: boolean;
}

export function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  hint,
  inline = false,
}: SelectFieldProps<T>) {
  return (
    <FieldLabel htmlFor={id} label={label} hint={hint} inline={inline}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`rounded-lg border border-line bg-inset px-3 py-2.5 text-sm text-ink transition-colors hover:border-line-strong focus:border-accent focus:outline-none ${
          inline ? "min-w-[9rem]" : "w-full"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldLabel>
  );
}
