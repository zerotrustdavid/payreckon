import { NextResponse, type NextRequest } from "next/server";
import {
  buildEmail,
  interpretResendResponse,
  RateLimiter,
  validateSubmission,
} from "../../../lib/feedback/resend";

// Replaces the client-side Web3Forms integration. That approach put a public
// access key in the bundle, which was an accepted risk rather than a secret,
// but it also meant a failure between the browser and Web3Forms was silently
// unobservable: the form could report "sent" with no way to tell whether it
// actually reached anyone. Routing through this server means the success
// path is gated on Resend actually returning a message id, and a failure has
// somewhere to be logged.
export const runtime = "nodejs";

const FROM = process.env.FEEDBACK_FROM ?? "PayReckon <feedback@invisionsolutions.co.uk>";
const TO = process.env.FEEDBACK_TO ?? "payreckon@invisionsolutions.co.uk";

// Per-instance, see RateLimiter's own note on what this does and does not
// guarantee across Vercel's multiple concurrent instances.
const limiter = new RateLimiter(5, 10 * 60 * 1000);

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function clientKey(request: NextRequest): string {
  // Vercel sets this at the edge; it is the closest thing to a stable
  // per-visitor key available without asking for anything from the visitor.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: NextRequest) {
  if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") {
    return NextResponse.json({ ok: false, error: "Expected application/json." }, { status: 415 });
  }

  if (!sameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Cross-origin requests are not accepted." }, { status: 403 });
  }

  if (!limiter.check(clientKey(request))) {
    return NextResponse.json({ ok: false, error: "Too many submissions. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request body." }, { status: 400 });
  }

  // Honeypot: a real visitor never populates this field. Report success
  // without sending anything, so a bot has no signal that it was caught.
  const honeypot = (body as Record<string, unknown> | null)?.botcheck;
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const validated = validateSubmission(body);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: validated.status });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Feedback route is misconfigured — RESEND_API_KEY is not set.");
    return NextResponse.json(
      { ok: false, error: "This form is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  const email = buildEmail({ from: FROM, to: TO, type: validated.type, message: validated.message });

  let outcome;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(email),
    });
    const responseBody = await response.json().catch(() => null);
    outcome = interpretResendResponse(response.status, responseBody);
  } catch (error) {
    // Deliberately no message content in this log line — see buildEmail,
    // which is the only place the visitor's text is used.
    console.error("Feedback send failed to reach Resend —", error);
    return NextResponse.json(
      { ok: false, error: "Could not reach the mail provider. Please try again." },
      { status: 502 },
    );
  }

  if (!outcome.ok) {
    console.error("Feedback send rejected —", outcome.detail);
    return NextResponse.json(
      { ok: false, error: "The message could not be sent. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
