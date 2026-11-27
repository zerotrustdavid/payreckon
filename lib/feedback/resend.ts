/**
 * Server-side feedback submission logic: validation and Resend response
 * interpretation. Kept pure and separate from the route handler, same reason
 * web3forms.ts was — the failure paths need to be testable without a
 * network, and without a Next.js request/response in the way.
 */

export const FEEDBACK_TYPES = [
  "accuracy",
  "bug",
  "suggestion",
  "general",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

const TYPE_LABELS: Record<FeedbackType, string> = {
  accuracy: "A figure looks wrong",
  bug: "Something is broken",
  suggestion: "Feature suggestion",
  general: "General feedback",
};

export const MIN_MESSAGE = 10;
export const MAX_MESSAGE = 2000;

export type ValidationResult =
  | { ok: true; type: FeedbackType; message: string }
  | { ok: false; status: number; error: string };

/**
 * Validates an untrusted JSON body before anything is sent anywhere.
 *
 * Deliberately strict rather than permissive: an unknown `type` or a message
 * outside the length the form itself enforces is rejected here rather than
 * passed through, so the only way to reach Resend is with a shape this
 * function has already approved.
 */
export function validateSubmission(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, status: 400, error: "Malformed request body." };
  }

  const { type, message } = body as Record<string, unknown>;

  if (typeof type !== "string" || !FEEDBACK_TYPES.includes(type as FeedbackType)) {
    return { ok: false, status: 400, error: "Unrecognised feedback type." };
  }

  if (typeof message !== "string") {
    return { ok: false, status: 400, error: "Message must be text." };
  }

  const trimmed = message.trim();
  if (trimmed.length < MIN_MESSAGE) {
    return {
      ok: false,
      status: 400,
      error: `Message must be at least ${MIN_MESSAGE} characters.`,
    };
  }
  if (trimmed.length > MAX_MESSAGE) {
    return {
      ok: false,
      status: 400,
      error: `Message must be at most ${MAX_MESSAGE} characters.`,
    };
  }

  return { ok: true, type: type as FeedbackType, message: trimmed };
}

export function typeLabel(type: FeedbackType): string {
  return TYPE_LABELS[type];
}

/**
 * Builds the email Resend is asked to send. Plain text only: the message is
 * visitor-supplied and never passed through anything that renders HTML.
 */
export function buildEmail(params: {
  from: string;
  to: string;
  type: FeedbackType;
  message: string;
}) {
  return {
    from: params.from,
    to: params.to,
    subject: `PayReckon feedback — ${typeLabel(params.type)}`,
    text: params.message,
  };
}

export type SendOutcome =
  | { ok: true; id: string }
  | { ok: false; status: number; detail: string };

/**
 * Interprets Resend's response. Success requires an actual id in the body —
 * a 200 with no id is not trusted as sent, the same principle the old
 * Web3Forms integration applied to its own success flag.
 */
export function interpretResendResponse(
  status: number,
  body: unknown,
): SendOutcome {
  if (status >= 200 && status < 300) {
    const id = (body as Record<string, unknown> | null)?.id;
    if (typeof id === "string" && id.length > 0) {
      return { ok: true, id };
    }
    return {
      ok: false,
      status,
      detail: `Resend returned ${status} with no message id`,
    };
  }

  const message =
    typeof (body as Record<string, unknown> | null)?.message === "string"
      ? ((body as Record<string, unknown>).message as string)
      : "no message in response body";

  return { ok: false, status, detail: `Resend rejected the send (${status}): ${message}` };
}

/**
 * A fixed-window limiter per server instance. This is a backstop, not a
 * guarantee: Vercel can run several instances concurrently and each gets its
 * own counter, so a determined sender spread across instances is not
 * actually bounded by this. Worth having anyway, cheap, and it is documented
 * as what it is rather than oversold as what it is not.
 */
export class RateLimiter {
  private hits = new Map<string, { count: number; windowStart: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** Returns true if the request should be allowed. */
  check(key: string, now: number = Date.now()): boolean {
    const entry = this.hits.get(key);
    if (!entry || now - entry.windowStart >= this.windowMs) {
      this.hits.set(key, { count: 1, windowStart: now });
      return true;
    }
    if (entry.count >= this.limit) {
      return false;
    }
    entry.count += 1;
    return true;
  }
}
