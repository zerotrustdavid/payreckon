interface CalculatorShellProps {
  eyebrow: string;
  title: string;
  description: string;
  inputs: React.ReactNode;
  results: React.ReactNode;
}

/**
 * Two-column calculator layout: inputs on the left, results on the right, and a
 * single stacked column on narrow screens with inputs first.
 */
export function CalculatorShell({
  eyebrow,
  title,
  description,
  inputs,
  results,
}: CalculatorShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>
      </header>

      {/* min-w-0 on both grid items: a grid item's default min-width:auto
          refuses to shrink below its content's natural width, which forced
          an 8px horizontal scroll at 320px before this was added — the same
          trap FieldLabel already guards against one level deeper. */}
      <div className="mt-9 grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">{inputs}</div>
        <div className="min-w-0 lg:sticky lg:top-20">{results}</div>
      </div>
    </div>
  );
}
