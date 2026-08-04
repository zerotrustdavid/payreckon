import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "../../../lib/content/guides";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.summary };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article className="max-w-2xl">
          <p className="text-sm text-faint">{guide.readingTime}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{guide.summary}</p>

          <div className="mt-10 flex flex-col gap-10">
            {guide.sections.map((section) => (
              <section key={section.heading} id={slugify(section.heading)}>
                <h2 className="text-xl font-semibold tracking-tight text-ink">
                  {section.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((paragraph, index) => (
                    <p key={index} className="text-sm leading-relaxed text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {guide.relatedCalculator && (
            <div className="mt-12 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-base font-semibold text-ink">
                Put it to the test
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Run your own figures through the calculator this guide describes.
              </p>
              <Link
                href={`/calculators/${guide.relatedCalculator.slug}`}
                className="mt-4 inline-block rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-strong"
              >
                {guide.relatedCalculator.label} →
              </Link>
            </div>
          )}
        </article>

        <nav
          aria-label="On this page"
          className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-faint">
            On this page
          </p>
          <ul className="mt-3 flex flex-col gap-2 border-l border-line pl-4">
            {guide.sections.map((section) => (
              <li key={section.heading}>
                <a
                  href={`#${slugify(section.heading)}`}
                  className="text-sm leading-snug text-muted transition-colors hover:text-ink"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
