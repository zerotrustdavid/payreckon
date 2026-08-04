import Link from "next/link";
import { CALCULATORS } from "../lib/calculations/scenarios";
import { CURRENT_TAX_YEAR, TAX_YEARS } from "../lib/constants";

const PILLARS = [
  {
    title: "Exact, not estimated",
    body: "Employer's NI, the Apprenticeship Levy and employer pension are solved against your assignment rate rather than approximated, so the figures reconcile to the penny.",
  },
  {
    title: "Detailed where it matters",
    body: "Tax code, NI category, Scottish rates, student loan plans, pension method, expenses and holiday pay treatment all change the answer — so they are all inputs, not assumptions.",
  },
  {
    title: "Readable at a glance",
    body: "Every result is an itemised breakdown you can expand, a band-by-band tax table, and a chart of where each pound goes.",
  },
];

export default function Home() {
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 text-center">
          <p className="text-sm font-medium text-accent">
            Tax years {TAX_YEARS[0]} to {CURRENT_TAX_YEAR}
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Work out what you actually keep
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Compare the three ways to be paid in the UK — caught by IR35 through an
            umbrella company, outside IR35 through your own limited company, or on a
            permanent salary — and see the real difference in take-home pay.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/calculators"
              className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-strong"
            >
              Choose a calculator
            </Link>
            <Link
              href="/guides/ir35"
              className="rounded-lg border border-line px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-line-strong"
            >
              What is IR35?
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <h2 className="text-base font-semibold text-ink">{pillar.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Three calculators, one tax engine
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          All three share the same income tax, National Insurance, dividend and
          student loan logic, so a like-for-like comparison is genuinely like for
          like — they differ only where the tax treatment genuinely differs.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {CALCULATORS.map((calc) => (
            <Link
              key={calc.slug}
              href={`/calculators/${calc.slug}`}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent"
            >
              <span className="text-sm font-medium text-accent">
                {calc.subtitle}
              </span>
              <span className="mt-2 text-lg font-semibold text-ink">{calc.name}</span>
              <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {calc.description}
              </span>
              <span className="mt-4 text-sm font-medium text-accent">
                Open calculator →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
