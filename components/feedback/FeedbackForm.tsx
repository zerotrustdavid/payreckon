"use client";

import { useId, useState } from "react";
import { SelectField } from "../ui/SelectField";
import { TextareaField } from "../ui/TextareaField";

const ENDPOINT = "/api/feedback";
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
 * Feedback form, posting to this site's own /api/feedback route, which sends
 * through Resend server-side. Previously posted directly to Web3Forms from
 * the browser; that put a publishable key in the bundle (an accepted risk,
 * not a secret) but also meant a failure between the browser and Web3Forms
 * was unobservable — the form could report "sent" with nothing having
 * arrived, and nothing in the code could say why. Routing through the
 * server fixes the second problem regardless of what is thought of the
 * first: success is now gated on the mail provider returning a real id.
 */
export function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>("accuracy");
  const [message, setMessage] = useState("");
  const [botField, setBotField] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const errorId = useId();
  const trimmed = message.trim();
  const tooShort = trimmed.length < MIN_MESSAGE;
  const showError = attempted && tooShort;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setAttempted(true);
    if (tooShort || status.kind === "sending") return;

    setStatus({ kind: "sending" });

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: trimmed,
          // Honeypot: only a bot fills a field it cannot see. The route
          // reports success without sending anything, so it does not learn
          // to work around the check.
          botcheck: botField,
        }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok || !body?.ok) {
        const detail =
          typeof body?.error === "string"
            ? body.error
            : `The server returned an unexpected response (${response.status}).`;
        console.error("Feedback submission failed —", detail);
        setStatus({
          kind: "error",
          message:
            typeof body?.error === "string"
              ? body.error
              : "Something went wrong sending this. Please try again.",
        });
        return;
      }
    } catch (error) {
      console.error("Feedback submission failed —", error);
      setStatus({
        kind: "error",
        message: "Could not reach the server. Check your connection and try again.",
      });
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
