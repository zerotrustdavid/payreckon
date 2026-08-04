import { describe, expect, it } from "vitest";
import {
  interpretResponse,
  networkFailure,
  normaliseAccessKey,
} from "./web3forms";

const VALID = "def7a146-5c36-43c5-8c76-b4ef38da296e";

describe("normaliseAccessKey", () => {
  it("accepts a clean key", () => {
    expect(normaliseAccessKey(VALID)).toEqual({ ok: true, key: VALID });
  });

  it("survives the trailing newline a dashboard paste adds", () => {
    expect(normaliseAccessKey(`${VALID}\n`)).toEqual({ ok: true, key: VALID });
  });

  it("survives surrounding whitespace", () => {
    expect(normaliseAccessKey(`  ${VALID}  `)).toEqual({ ok: true, key: VALID });
  });

  it("survives quotes pasted around the value", () => {
    expect(normaliseAccessKey(`"${VALID}"`)).toEqual({ ok: true, key: VALID });
    expect(normaliseAccessKey(`'${VALID}'`)).toEqual({ ok: true, key: VALID });
  });

  it("reports an unset key as missing, not malformed", () => {
    expect(normaliseAccessKey(undefined)).toMatchObject({ reason: "missing" });
    expect(normaliseAccessKey("   ")).toMatchObject({ reason: "missing" });
  });

  it("rejects a truncated key and says how long it was", () => {
    const outcome = normaliseAccessKey(VALID.slice(0, 20));
    expect(outcome).toMatchObject({ ok: false, reason: "malformed" });
    if (!outcome.ok) expect(outcome.detail).toContain("20 characters");
  });

  it("rejects a key with an interior stray character", () => {
    expect(normaliseAccessKey(VALID.replace("-", " "))).toMatchObject({
      reason: "malformed",
    });
  });

  it("never leaks the key into the detail it logs", () => {
    const outcome = normaliseAccessKey("not-a-uuid-but-secret-looking");
    if (!outcome.ok) expect(outcome.detail).not.toContain("secret-looking");
  });
});

describe("interpretResponse", () => {
  it("accepts the documented success body", () => {
    const outcome = interpretResponse(
      200,
      JSON.stringify({ success: true, message: "Email sent successfully" }),
    );
    expect(outcome.ok).toBe(true);
  });

  it("surfaces the reason the API gives for refusing, rather than hiding it", () => {
    const outcome = interpretResponse(
      400,
      JSON.stringify({ success: false, message: "Invalid access key" }),
    );
    expect(outcome).toMatchObject({ ok: false, message: "Invalid access key" });
    if (!outcome.ok) expect(outcome.detail).toContain("400");
  });

  it("does not treat a truthy-but-not-true success flag as success", () => {
    // The API answers with a boolean; anything else means we misread it.
    const outcome = interpretResponse(200, JSON.stringify({ success: "true" }));
    expect(outcome.ok).toBe(false);
  });

  it("reports a non-JSON body instead of swallowing it", () => {
    // What we would get back if the API served its HTML success page, which
    // is the failure mode when the request omits Accept: application/json.
    const outcome = interpretResponse(200, "<!doctype html><title>Success</title>");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.detail).toContain("non-JSON");
      expect(outcome.detail).toContain("doctype");
    }
  });

  it("reports an empty body", () => {
    const outcome = interpretResponse(502, "");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.detail).toContain("502");
  });

  it("handles a JSON body that is not an object", () => {
    const outcome = interpretResponse(200, "null");
    expect(outcome.ok).toBe(false);
  });

  it("falls back when the API refuses without explaining", () => {
    const outcome = interpretResponse(500, JSON.stringify({ success: false }));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.message).toMatch(/rejected/i);
  });
});

describe("networkFailure", () => {
  it("distinguishes never reaching the API from being refused by it", () => {
    const outcome = networkFailure(new TypeError("Failed to fetch"));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.message).toMatch(/could not reach/i);
      expect(outcome.detail).toContain("Failed to fetch");
    }
  });

  it("copes with a non-Error being thrown", () => {
    const outcome = networkFailure("boom");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.detail).toContain("boom");
  });
});
