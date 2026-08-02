import Link from "next/link";
import { CALCULATORS } from "../../lib/calculations/scenarios";
import { CURRENT_TAX_YEAR } from "../../lib/constants";
import { Logo } from "./Logo";

const GUIDES = [
  { href: "/guides/ir35", label: "Understanding IR35" },
  { href: "/guides/umbrella-companies", label: "Umbrella companies" },
  { href: "/guides/limited-companies", label: "Limited companies" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Work out what you actually keep, whichever way you contract.
            </p>
          </div>

          <nav aria-label="Calculators">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-faint">
              Calculators
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {CALCULATORS.map((calc) => (
                <li key={calc.slug}>
                  <Link
                    href={`/calculators/${calc.slug}`}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {calc.name} — {calc.subtitle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Guides">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-faint">
              Guides
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {GUIDES.map((guide) => (
                <li key={guide.href}>
                  <Link
                    href={guide.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {guide.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-faint">
              Tax data
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Rates for {CURRENT_TAX_YEAR} and the two preceding years, taken from
              gov.uk and gov.scot and cited in the source.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <p className="text-xs leading-relaxed text-faint">
            PayReckon provides estimates for planning purposes only and is not
            financial, tax or legal advice. Figures cover England, Wales, Northern
            Ireland and Scotland, and assume a full tax year unless you specify
            contract dates. Always confirm your position with a qualified
            accountant before acting on it.
          </p>
        </div>
      </div>
    </footer>
  );
}
