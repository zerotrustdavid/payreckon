"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CALCULATORS } from "../../lib/calculations/scenarios";
import { Logo } from "./Logo";

const NAV = [
  { href: "/calculators", label: "Calculators" },
  { href: "/guides", label: "Guides" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-5 py-3.5">
        <Link href="/" className="shrink-0" aria-label="PayReckon home">
          <Logo />
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-surface-2 text-ink"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/calculators"
          className="ml-auto hidden rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-strong md:block"
        >
          Run a calculation
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="ml-auto rounded-lg border border-line px-3 py-2 text-sm text-muted md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-surface md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col px-5 py-3" aria-label="Mobile">
            {CALCULATORS.map((calc) => (
              <Link
                key={calc.slug}
                href={`/calculators/${calc.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-ink"
              >
                {calc.name} — {calc.subtitle}
              </Link>
            ))}
            <Link
              href="/guides"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-ink"
            >
              Guides
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
