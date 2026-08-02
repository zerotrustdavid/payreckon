import type { Metadata } from "next";
import Link from "next/link";
import { CALCULATORS } from "../../lib/calculations/scenarios";
import { TAX_YEARS } from "../../lib/constants";

export const metadata: Metadata = {
  title: "Contractor calculators",
  description:
    "Inside IR35 umbrella, outside IR35 limited company and PAYE salary calculators, covering three UK tax years with HMRC methodology.",
};

export default function CalculatorsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Contractor calculators
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Model each working arrangement in turn to compare them properly. Every
          calculator supports {TAX_YEARS.join(", ")}, Scottish and rest-of-UK rates,
          your own tax code and NI category, student loans and pension
          contributions.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-4">
        {CALCULATORS.map((calc) => (
          <Link
            key={calc.slug}
            href={`/calculators/${calc.slug}`}
            className="group flex flex-col gap-2 rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h2 className="text-lg font-semibold text-ink">{calc.name}</h2>
                <span className="text-sm text-accent">{calc.subtitle}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {calc.description}
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-accent">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
