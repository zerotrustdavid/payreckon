import { FieldLabel } from "./FieldLabel";

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  /** Id of the element describing an error, wired to aria-describedby. */
  errorId?: string;
  invalid?: boolean;
}

export function TextareaField({
  id,
  label,
  value,
  onChange,
  hint,
  placeholder,
  rows = 6,
  maxLength,
  required = false,
  errorId,
  invalid = false,
}: TextareaFieldProps) {
  return (
    <FieldLabel htmlFor={id} label={label} hint={hint}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && errorId ? errorId : undefined}
        className={`w-full resize-y rounded-lg border bg-inset px-3 py-2.5 text-sm leading-relaxed text-ink transition-colors placeholder:text-faint focus:outline-none ${
          invalid
            ? "border-danger focus:border-danger"
            : "border-line hover:border-line-strong focus:border-accent"
        }`}
      />
      {maxLength && (
        <p className="tnum text-right text-xs text-faint">
          {value.length} / {maxLength}
        </p>
      )}
    </FieldLabel>
  );
}
