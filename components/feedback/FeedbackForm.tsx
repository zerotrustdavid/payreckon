"use client";

import { useId, useState } from "react";
import {
  interpretResponse,
  networkFailure,
  normaliseAccessKey,
} from "../../lib/feedback/web3forms";
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
  const accessKey = normaliseAccessKey(
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
  );

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

    if (!accessKey.ok) {
      // Both cases are a deployment problem rather than anything the visitor
      // did, so say so plainly and put the specifics in the console.
      console.error("Feedback form is misconfigured —", accessKey.detail);
      setStatus({
        kind: "error",
        message:
          accessKey.reason === "missing"
            ? "This form is not configured yet, so the message was not sent. Please try again later."
            : "This form is misconfigured, so the message was not sent. Please try again later.",
      });
      return;
    }

    setStatus({ kind: "sending" });

    let outcome;
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Without this the API is entitled to answer with its HTML success
          // page rather than JSON, which reads here as a failed submission
          // even when the message went through.
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey.key,
          subject: `PayReckon feedback — ${typeLabel}`,
          from_name: "PayReckon",
          // Populates the name column in the Web3Forms dashboard, which would
          // otherwise be blank on every row: the form collects no personal
          // details, so there is no real name to send.
          name: "PayReckon visitor",
          feedback_type: typeLabel,
          message: trimmed,
        }),
      });

      // Read as text, not json: a non-JSON reply is itself diagnostic, and
      // response.json() would discard it.
      outcome = interpretResponse(response.status, await response.text());
    } catch (error) {
      outcome = networkFailure(error);
    }

    if (!outcome.ok) {
      // The visitor sees the summary; the detail goes to the console so a
      // report can say precisely what the API objected to.
      console.error("Feedback submission failed —", outcome.detail);
      setStatus({ kind: "error", message: outcome.message });
      return;
    }

    setStatus({ kind: "sent" });
    setMessage("");
    setAttempted(false);
  }

  if (status.kind === "sent") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-line bg-surface p-6 text-center"
      >
        <p className="text-lg font-semibold text-ink">Thank you</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          Your feedback has been sent. Every message is read — corrections to the
          tax figures in particular go straight to the top of the list.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-5 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-line-strong"
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
          className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
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
