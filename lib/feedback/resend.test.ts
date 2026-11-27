import { describe, expect, it } from "vitest";
import {
  buildEmail,
  interpretResendResponse,
  RateLimiter,
  validateSubmission,
} from "./resend";

describe("validateSubmission", () => {
  it("accepts a well-formed submission", () => {
    expect(
      validateSubmission({ type: "accuracy", message: "A proper feedback message." }),
    ).toEqual({ ok: true, type: "accuracy", message: "A proper feedback message." });
  });

  it("trims the message before checking its length", () => {
    const result = validateSubmission({
      type: "general",
      message: "   padded message here   ",
    });
    expect(result).toMatchObject({ ok: true, message: "padded message here" });
  });

  it("rejects a non-object body", () => {
    expect(validateSubmission(null)).toMatchObject({ ok: false, status: 400 });
    expect(validateSubmission("a string")).toMatchObject({ ok: false, status: 400 });
    expect(validateSubmission(42)).toMatchObject({ ok: false, status: 400 });
  });

  it("rejects an unrecognised feedback type", () => {
    const result = validateSubmission({ type: "not-a-real-type", message: "1234567890" });
    expect(result).toMatchObject({ ok: false, status: 400 });
  });

  it("rejects a missing type", () => {
    expect(validateSubmission({ message: "1234567890" })).toMatchObject({
      ok: false,
      status: 400,
    });
  });

  it("rejects a non-string message", () => {
    expect(validateSubmission({ type: "bug", message: 12345 })).toMatchObject({
      ok: false,
      status: 400,
    });
  });

  it("rejects a message under the minimum length", () => {
    const result = validateSubmission({ type: "bug", message: "short" });
    expect(result).toMatchObject({ ok: false, status: 400 });
    if (!result.ok) expect(result.error).toContain("at least");
  });

  it("rejects a message over the maximum length", () => {
    const result = validateSubmission({ type: "bug", message: "x".repeat(2001) });
    expect(result).toMatchObject({ ok: false, status: 400 });
    if (!result.ok) expect(result.error).toContain("at most");
  });

  it("accepts a message at exactly the minimum length", () => {
    expect(validateSubmission({ type: "bug", message: "x".repeat(10) }).ok).toBe(true);
  });

  it("accepts a message at exactly the maximum length", () => {
    expect(validateSubmission({ type: "bug", message: "x".repeat(2000) }).ok).toBe(true);
  });
});

describe("buildEmail", () => {
  it("builds a plain-text email with the type in the subject", () => {
    const email = buildEmail({
      from: "a@example.com",
      to: "b@example.com",
      type: "accuracy",
      message: "the message",
    });
    expect(email).toEqual({
      from: "a@example.com",
      to: "b@example.com",
      subject: "PayReckon feedback — A figure looks wrong",
      text: "the message",
    });
  });
});

describe("interpretResendResponse", () => {
  it("accepts a 2xx response carrying an id", () => {
    expect(interpretResendResponse(200, { id: "abc-123" })).toEqual({
      ok: true,
      id: "abc-123",
    });
  });

  it("does not trust a 2xx response with no id", () => {
    const outcome = interpretResendResponse(200, {});
    expect(outcome.ok).toBe(false);
  });

  it("does not trust a 2xx response with a non-string id", () => {
    const outcome = interpretResendResponse(201, { id: 12345 });
    expect(outcome.ok).toBe(false);
  });

  it("surfaces Resend's own rejection message", () => {
    const outcome = interpretResendResponse(401, { message: "Invalid API key" });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.detail).toContain("Invalid API key");
  });

  it("copes with a null body", () => {
    const outcome = interpretResendResponse(500, null);
    expect(outcome.ok).toBe(false);
  });

  it("copes with a body with no message field", () => {
    const outcome = interpretResendResponse(500, { name: "internal_error" });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.detail).toContain("no message in response body");
  });
});

describe("RateLimiter", () => {
  it("allows requests under the limit", () => {
    const limiter = new RateLimiter(3, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("a", 1)).toBe(true);
    expect(limiter.check("a", 2)).toBe(true);
  });

  it("refuses once the limit is reached within the window", () => {
    const limiter = new RateLimiter(2, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("a", 1)).toBe(true);
    expect(limiter.check("a", 2)).toBe(false);
  });

  it("resets once the window has elapsed", () => {
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("a", 500)).toBe(false);
    expect(limiter.check("a", 1001)).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("b", 0)).toBe(true);
    expect(limiter.check("a", 1)).toBe(false);
    expect(limiter.check("b", 1)).toBe(false);
  });
});
