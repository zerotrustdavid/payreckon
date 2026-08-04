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
