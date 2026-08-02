import type { TaxRegion } from "../constants/types";

/**
 * PAYE tax code parsing.
 *
 * A code carries two pieces of information the calculation needs: how much
 * tax-free allowance applies, and whether all income is forced into a single band.
 *
 * Reference: https://www.gov.uk/tax-codes
 *   1257L etc.  numeric codes — allowance is the number x 10
 *   K500        negative allowance — untaxed income (e.g. benefits) added to pay
 *   BR          all income at the basic rate
 *   D0 / D1 / D2 all income at the higher / additional / top rate
 *   NT          no tax
 *   S / C prefix Scottish / Welsh taxpayer (Wales currently matches UK rates)
 *   W1 / M1 / X suffix — non-cumulative; irrelevant to an annual calculation
 */
export interface ParsedTaxCode {
  /** Allowance implied by the code. Negative for K codes. */
  allowance: number;
  /** Index into the region's band list that all income is forced into, if any. */
  forcedBandIndex: number | null;
  /** True for NT codes, where no income tax is due at all. */
  noTax: boolean;
  region: TaxRegion | null;
  valid: boolean;
  normalised: string;
}

const FLAT_RATE_CODES: Record<string, number> = {
  // Index into the band array: UK [basic, higher, additional];
  // Scotland [starter, basic, intermediate, higher, advanced, top].
  BR: 0,
  D0: 1,
  D1: 2,
  D2: 3,
};

/**
 * Parses a tax code into its allowance and band effect.
 *
 * Returns `valid: false` for anything unrecognised, so the UI can fall back to
 * the standard personal allowance rather than silently mis-taxing.
 */
export function parseTaxCode(input: string): ParsedTaxCode {
  const raw = (input ?? "").toUpperCase().replace(/\s+/g, "");
  const base: ParsedTaxCode = {
    allowance: 0,
    forcedBandIndex: null,
    noTax: false,
    region: null,
    valid: false,
    normalised: raw,
  };

  if (!raw) return base;

  // Regional prefix.
  let region: TaxRegion | null = null;
  let body = raw;
  if (body.startsWith("S")) {
    region = "scotland";
    body = body.slice(1);
  } else if (body.startsWith("C")) {
    // Welsh codes currently track the UK rates.
    region = "uk";
    body = body.slice(1);
  }

  // Strip non-cumulative markers, which don't affect an annual calculation.
  body = body.replace(/(W1M1|W1|M1|X)$/, "");

  if (body === "NT") {
    return { ...base, region, noTax: true, valid: true };
  }

  if (body in FLAT_RATE_CODES) {
    // D2 only exists for Scottish taxpayers (top rate).
    if (body === "D2" && region !== "scotland") return base;
    return {
      ...base,
      region,
      allowance: 0,
      forcedBandIndex: FLAT_RATE_CODES[body],
      valid: true,
    };
  }

  // K codes: untaxed income to be added rather than an allowance to deduct.
  // The number carries the same x10 meaning, so K500 adds £5,000 to taxable pay.
  const kMatch = body.match(/^K(\d+)$/);
  if (kMatch) {
    return {
      ...base,
      region,
      allowance: -(Number.parseInt(kMatch[1], 10) * 10),
      valid: true,
    };
  }

  // Standard numeric codes with a suffix letter. The code number x 10 is the
  // annual tax-free allowance, per https://www.gov.uk/tax-codes — so 1257L is
  // £12,570. (HMRC's pay-period free-pay tables add a rounding penny-margin;
  // that belongs to per-period PAYE operation, not an annual calculation.)
  const numericMatch = body.match(/^(\d+)([LMNPTY])$/);
  if (numericMatch) {
    return {
      ...base,
      region,
      allowance: Number.parseInt(numericMatch[1], 10) * 10,
      valid: true,
    };
  }

  return base;
}

/**
 * Builds a tax code string from an allowance, for displaying the code implied by
 * the standard personal allowance (e.g. £12,570 → "1257L").
 */
export function taxCodeForAllowance(allowance: number, region?: TaxRegion): string {
  const prefix = region === "scotland" ? "S" : "";
  return `${prefix}${Math.floor(Math.max(0, allowance) / 10)}L`;
}
