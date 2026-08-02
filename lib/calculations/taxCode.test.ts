import { describe, expect, it } from "vitest";
import { parseTaxCode, taxCodeForAllowance } from "./taxCode";

describe("parseTaxCode", () => {
  it("reads a standard numeric code as allowance x 10", () => {
    const code = parseTaxCode("1257L");
    expect(code.valid).toBe(true);
    expect(code.allowance).toBe(12_570);
    expect(code.forcedBandIndex).toBeNull();
  });

  it("accepts the other numeric suffix letters", () => {
    for (const suffix of ["L", "M", "N", "P", "T", "Y"]) {
      expect(parseTaxCode(`1257${suffix}`).allowance).toBe(12_570);
    }
  });

  it("detects a Scottish prefix", () => {
    const code = parseTaxCode("S1257L");
    expect(code.region).toBe("scotland");
    expect(code.allowance).toBe(12_570);
  });

  it("treats a Welsh prefix as UK rates", () => {
    expect(parseTaxCode("C1257L").region).toBe("uk");
  });

  it("reads K codes as negative allowance", () => {
    // K500 adds £5,000 of untaxed income to taxable pay.
    expect(parseTaxCode("K500").allowance).toBe(-5_000);
  });

  it("maps flat-rate codes to a forced band", () => {
    expect(parseTaxCode("BR").forcedBandIndex).toBe(0);
    expect(parseTaxCode("D0").forcedBandIndex).toBe(1);
    expect(parseTaxCode("D1").forcedBandIndex).toBe(2);
  });

  it("only allows D2 for Scottish taxpayers", () => {
    expect(parseTaxCode("SD2").valid).toBe(true);
    expect(parseTaxCode("SD2").forcedBandIndex).toBe(3);
    expect(parseTaxCode("D2").valid).toBe(false);
  });

  it("handles NT", () => {
    const code = parseTaxCode("NT");
    expect(code.noTax).toBe(true);
    expect(code.valid).toBe(true);
  });

  it("ignores non-cumulative markers", () => {
    expect(parseTaxCode("1257L W1").allowance).toBe(12_570);
    expect(parseTaxCode("1257LM1").allowance).toBe(12_570);
    expect(parseTaxCode("1257LX").allowance).toBe(12_570);
  });

  it("is case and whitespace insensitive", () => {
    expect(parseTaxCode(" 1257l ").allowance).toBe(12_570);
  });

  it("reports invalid codes rather than guessing", () => {
    expect(parseTaxCode("").valid).toBe(false);
    expect(parseTaxCode("HELLO").valid).toBe(false);
    expect(parseTaxCode("12X7L").valid).toBe(false);
  });
});

describe("taxCodeForAllowance", () => {
  it("renders the standard allowance as 1257L", () => {
    expect(taxCodeForAllowance(12_570)).toBe("1257L");
  });

  it("prefixes S for Scotland", () => {
    expect(taxCodeForAllowance(12_570, "scotland")).toBe("S1257L");
  });
});
