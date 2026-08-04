/**
 * Interpreting a Web3Forms response.
 *
 * Kept separate from the component, and pure, so the failure paths can be
 * tested without a network. The first version of the feedback form collapsed
 * every failure into "check your connection", which is actively misleading
 * when the connection is fine and the API is refusing the request for a
 * reason it has already told us — a rejected key, say. Nothing here throws
 * that reason away.
 */

/** Web3Forms access keys are UUIDs, and it rejects anything else outright. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type AccessKeyCheck =
  | { ok: true; key: string }
  | { ok: false; reason: "missing" | "malformed"; detail: string };

/**
 * Cleans up and checks the configured access key before it is ever sent.
 *
 * A key pasted into a hosting dashboard picks up a trailing newline or a pair
 * of quotes remarkably easily, and the API's reply for that — "Invalid
 * form_id/access_key format" — points at the code rather than at the
 * deployment setting that actually needs fixing. Stripping the usual
 * accidents means the common case simply works, and anything still wrong is
 * named as a configuration problem.
 */
export function normaliseAccessKey(raw: string | undefined): AccessKeyCheck {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { ok: false, reason: "missing", detail: "no access key configured" };
  }

  const key = raw
    .trim()
    // Quotes are meant to delimit the value, not be part of it.
    .replace(/^["']|["']$/g, "")
    .trim();

  if (!UUID.test(key)) {
    // Deliberately describes the value rather than printing it: the key is
    // publishable, but a log that quotes secrets is a habit worth not having.
    return {
      ok: false,
      reason: "malformed",
      detail:
        `access key is not a UUID — ${key.length} characters` +
        `${raw.length !== key.length ? `, ${raw.length - key.length} stripped as whitespace or quotes` : ""}`,
    };
  }

  return { ok: true, key };
}

export type SubmissionOutcome =
  | { ok: true }
  | {
      ok: false;
      /** Shown to the visitor. */
      message: string;
      /** The underlying cause, for the console and for bug reports. */
      detail: string;
    };

/** What the API sends back when it accepts or refuses a submission. */
interface Web3FormsBody {
  success?: unknown;
  message?: unknown;
}

function parseBody(raw: string): Web3FormsBody | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Web3FormsBody)
      : null;
  } catch {
    return null;
  }
}

/**
 * @param status  HTTP status of the response.
 * @param raw     Raw response body, read as text so a non-JSON reply (an
 *                error page, or the HTML success page the API serves when it
 *                is not asked for JSON) is reported rather than swallowed.
 */
export function interpretResponse(status: number, raw: string): SubmissionOutcome {
  const body = parseBody(raw);

  if (body?.success === true) return { ok: true };

  // The API explains itself when it refuses — surface that verbatim, since it
  // is the difference between "your key is wrong" and "try again later".
  if (typeof body?.message === "string" && body.message.trim()) {
    return {
      ok: false,
      message: body.message.trim(),
      detail: `web3forms responded ${status}: ${body.message.trim()}`,
    };
  }

  if (body === null) {
    return {
      ok: false,
      message:
        "The feedback service returned an unexpected response. Please try again shortly.",
      detail: `web3forms responded ${status} with a non-JSON body: ${raw.slice(0, 200)}`,
    };
  }

  return {
    ok: false,
    message: "The feedback service rejected that. Please try again shortly.",
    detail: `web3forms responded ${status} without a success flag: ${raw.slice(0, 200)}`,
  };
}

/** A fetch that never reached the API at all — offline, DNS, CORS, blocked. */
export function networkFailure(error: unknown): SubmissionOutcome {
  return {
    ok: false,
    message:
      "Could not reach the feedback service. Check your connection and try again.",
    detail: `request failed before a response: ${
      error instanceof Error ? error.message : String(error)
    }`,
  };
}
