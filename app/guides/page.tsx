import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "../../lib/content/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Plain-English guides to IR35, umbrella companies and working through your own limited company.",
};

export default function GuidesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Guides
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          The rules behind the calculators, explained in plain English — so you can
          understand the number, not just read it.
        </p>
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group flex flex-col rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-accent"
          >
            <span className="text-xs text-faint">{guide.readingTime}</span>
            <h2 className="mt-2 text-lg font-semibold text-ink">{guide.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              {guide.summary}
            </p>
            <span className="mt-4 text-sm font-medium text-accent">Read →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
