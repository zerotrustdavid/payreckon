import Link from "next/link";
import { annualise, perPeriod } from "../lib/calculations/annualise";
import { CALCULATORS, calculateLimitedCompany } from "../lib/calculations/scenarios";
import { CURRENT_TAX_YEAR, getRates, TAX_YEARS } from "../lib/constants";
import { formatGBP } from "../lib/format";

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

/**
 * A real figure for the hero panel: £500/day run through the actual
 * outside-IR35 calculation, not a hand-typed number that could drift out of
 * sync with the tax engine it is meant to be demonstrating.
 */
function heroExample() {
  const result = calculateLimitedCompany({ revenue: annualise(500, "day") }, getRates());
  const segment = (label: string) =>
    result.chartSegments.find((s) => s.label === label)?.value ?? 0;
  const perWeek = (amount: number) => perPeriod(amount, "week");

  return {
    takeHome: perWeek(result.takeHome),
    corporationTax: perWeek(segment("Corporation tax")),
    dividendTax: perWeek(segment("Dividend tax")),
    nationalInsurance: perWeek(segment("National Insurance")),
  };
}

export default function Home() {
  const example = heroExample();

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end gap-10 px-5 py-20">
          <div className="max-w-2xl min-w-0 flex-1 basis-[480px]">
            <p className="text-sm font-medium text-accent">
              Tax years {TAX_YEARS[0]} to {CURRENT_TAX_YEAR}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Work out what you actually keep
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Compare the three ways to be paid in the UK — caught by IR35 through an umbrella
              company, outside IR35 through your own limited company, or on a permanent salary —
              and see the real difference in take-home pay.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
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

          <div className="min-w-0 max-w-sm flex-1 basis-[360px] rounded-2xl border border-line bg-surface p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-faint">
              Illustrative — outside IR35, £500/day
            </p>
            <p className="tnum mt-2 text-3xl font-semibold text-ink">
              {formatGBP(example.takeHome)}
              <span className="text-base font-medium text-faint"> /wk</span>
            </p>
            <p className="mt-0.5 text-xs text-positive">take-home, after all deductions</p>

            <dl className="mt-4 flex flex-col">
              <div className="flex items-center justify-between border-t border-line py-2 text-sm">
                <dt className="text-muted">Corporation tax</dt>
                <dd className="tnum text-ink">−{formatGBP(example.corporationTax)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-line py-2 text-sm">
                <dt className="text-muted">Dividend tax</dt>
                <dd className="tnum text-ink">−{formatGBP(example.dividendTax)}</dd>
              </div>
              <div className="flex items-center justify-between border-y border-line py-2 text-sm">
                <dt className="text-muted">National Insurance</dt>
                <dd className="tnum text-ink">−{formatGBP(example.nationalInsurance)}</dd>
              </div>
            </dl>

            <Link
              href="/calculators/outside-ir35-limited"
              className="mt-4 inline-flex text-sm font-medium text-accent hover:text-accent-strong"
            >
              See the full breakdown →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        {PILLARS.map((pillar, index) => (
          <div
            key={pillar.title}
            className="flex gap-6 border-t border-line py-7 first:border-t-0 first:pt-0"
          >
            <span className="tnum shrink-0 text-2xl font-semibold text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-ink">{pillar.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{pillar.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Three calculators, one tax engine
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          All three share the same income tax, National Insurance, dividend and student loan
          logic, so a like-for-like comparison is genuinely like for like — they differ only
          where the tax treatment genuinely differs.
        </p>

        <div className="mt-8 border-t border-line">
          {CALCULATORS.map((calc) => (
            <Link
              key={calc.slug}
              href={`/calculators/${calc.slug}`}
              className="flex flex-col gap-2 border-b border-line py-6 transition-colors hover:bg-surface sm:flex-row sm:items-baseline sm:gap-6"
            >
              <div className="min-w-0 sm:basis-56 sm:shrink-0">
                <span className="text-sm font-medium text-accent">{calc.subtitle}</span>
                <span className="mt-1 block text-lg font-semibold text-ink">{calc.name}</span>
              </div>
              <p className="min-w-0 flex-1 text-sm leading-relaxed text-muted">
                {calc.description}
              </p>
              <span className="text-sm font-medium text-accent sm:shrink-0">
                Open calculator →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
