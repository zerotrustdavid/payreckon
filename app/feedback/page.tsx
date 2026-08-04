import type { Metadata } from "next";
import Link from "next/link";
import { FeedbackForm } from "../../components/feedback/FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Report a figure that looks wrong, flag a bug, or suggest a feature for the PayReckon calculators.",
};

const NOTES = [
  {
    title: "Corrections come first",
    body: "If a number looks wrong, that is the most useful thing you can send. Include the inputs you used and the figure you expected, and it can be checked against the published HMRC rates directly.",
  },
  {
    title: "Every rate is cited",
    body: "Before reporting a rate as incorrect, it may be worth checking the guides — each tax year's figures are taken from gov.uk and gov.scot, and the source is cited alongside the calculation.",
  },
  {
    title: "Not a substitute for advice",
    body: "PayReckon cannot answer questions about your own tax position or contract. For that, speak to a qualified accountant who can see the full picture.",
  },
];

export default function FeedbackPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
          Feedback
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Tell us what to fix
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          PayReckon is only as good as its figures. If something looks wrong, is
          broken, or is missing, this is the place to say so.
        </p>
      </header>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <FeedbackForm />

        <aside className="flex flex-col gap-5">
          {NOTES.map((note) => (
            <div key={note.title}>
              <h2 className="text-sm font-semibold text-ink">{note.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {note.body}
              </p>
            </div>
          ))}
          <p className="text-sm leading-relaxed text-muted">
            Still working out which arrangement applies to you? The{" "}
            <Link
              href="/guides"
              className="text-accent underline underline-offset-2 transition-colors hover:text-accent-strong"
            >
              guides
            </Link>{" "}
            explain the rules behind each calculator.
          </p>
        </aside>
      </div>
    </div>
  );
}
