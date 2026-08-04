"use client";

import { useId, useState } from "react";
import { SelectField } from "../ui/SelectField";
import { TextareaField } from "../ui/TextareaField";

const ENDPOINT = "https://api.web3forms.com/submit";
const MAX_MESSAGE = 2000;
const MIN_MESSAGE = 10;

const TYPES = [
  { value: "accuracy", label: "A figure looks wrong" },
  { value: "bug", label: "Something is broken" },
  { value: "suggestion", label: "Feature suggestion" },
  { value: "general", label: "General feedback" },
] as const;

type FeedbackType = (typeof TYPES)[number]["value"];

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

/**
 * Feedback form, posting to Web3Forms so the site stays fully static.
 *
 * The access key is a publishable key by design — it identifies the
 * destination inbox and carries no account privileges — but it is read from
 * the environment rather than committed, so this public repo does not hand
 * out a ready-made endpoint to spam.
 */
export function FeedbackForm() {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

  const [type, setType] = useState<FeedbackType>("accuracy");
  const [message, setMessage] = useState("");
  const [botField, setBotField] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const errorId = useId();
  const trimmed = message.trim();
  const tooShort = trimmed.length < MIN_MESSAGE;
  const showError = attempted && tooShort;

  const typeLabel = TYPES.find((t) => t.value === type)?.label ?? type;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    if (tooShort || status.kind === "sending") return;

    // Honeypot: only a bot fills a field it cannot see. Report success so it
    // does not learn to work around the check.
    if (botField) {
      setStatus({ kind: "sent" });
      return;
    }

    if (!accessKey) {
      setStatus({
        kind: "error",
        message:
          "This form is not configured yet, so the message was not sent. Please try again later.",
      });
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `PayReckon feedback — ${typeLabel}`,
          from_name: "PayReckon",
          feedback_type: typeLabel,
          message: trimmed,
        }),
      });

      const result: unknown = await response.json().catch(() => null);
      const ok =
        response.ok &&
        typeof result === "object" &&
        result !== null &&
        (result as { success?: unknown }).success === true;

      if (!ok) throw new Error("Submission rejected");
      setStatus({ kind: "sent" });
      setMessage("");
      setAttempted(false);
    } catch {
      setStatus({
        kind: "error",
        message:
          "Something went wrong sending that. Check your connection and try again.",
      });
    }
  }

  if (status.kind === "sent") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-line bg-surface p-6 text-center"
      >
        <p className="font-display text-lg font-bold text-ink">Thank you</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          Your feedback has been sent. Every message is read — corrections to the
          tax figures in particular go straight to the top of the list.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-line-strong"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6"
    >
      <SelectField
        id="feedback-type"
        label="What is this about?"
        value={type}
        options={TYPES}
        onChange={(value) => setType(value as FeedbackType)}
      />

      <div>
        <TextareaField
          id="feedback-message"
          label="Your message"
          hint="If a figure looks wrong, the inputs you used and the number you expected help most."
          placeholder="Tell us what you found…"
          value={message}
          onChange={setMessage}
          maxLength={MAX_MESSAGE}
          required
          invalid={showError}
          errorId={errorId}
        />
        {showError && (
          <p id={errorId} className="mt-1.5 text-sm text-danger">
            Please write a little more so the feedback is actionable — at least{" "}
            {MIN_MESSAGE} characters.
          </p>
        )}
      </div>

      {/* Honeypot. Hidden from sight and from assistive technology, and
          skipped in the tab order, so only an automated filler reaches it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="feedback-company">Company</label>
        <input
          id="feedback-company"
          type="text"
          name="botcheck"
          tabIndex={-1}
          autoComplete="off"
          value={botField}
          onChange={(e) => setBotField(e.target.value)}
        />
      </div>

      {status.kind === "error" && (
        <p role="alert" className="text-sm leading-relaxed text-danger">
          {status.message}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.kind === "sending" ? "Sending…" : "Send feedback"}
        </button>
        <p className="text-xs leading-snug text-faint">
          No contact details are collected, so we cannot reply directly.
        </p>
      </div>
    </form>
  );
}
