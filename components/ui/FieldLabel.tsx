interface FieldLabelProps {
  htmlFor?: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
  /** Renders the label beside the control rather than above it. */
  inline?: boolean;
}

/** Shared label + hint wrapper so every control lines up identically. */
export function FieldLabel({
  htmlFor,
  label,
  hint,
  children,
  inline = false,
}: FieldLabelProps) {
  if (inline) {
    return (
      <div className="flex items-center justify-between gap-4 py-1">
        <div className="min-w-0">
          <label htmlFor={htmlFor} className="text-sm text-ink">
            {label}
          </label>
          {hint && <p className="mt-0.5 text-xs leading-snug text-faint">{hint}</p>}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    );
  }

  // min-w-0 lets this shrink inside a grid or flex parent, whose default
  // min-width:auto would otherwise force the column to its content width.
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {hint && <p className="text-xs leading-snug text-faint">{hint}</p>}
      {children}
    </div>
  );
}
