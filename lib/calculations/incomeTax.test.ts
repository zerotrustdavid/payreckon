import { describe, expect, it } from "vitest";
import { getRates } from "../constants";
import { incomeTax, personalAllowance } from "./incomeTax";

const r2627 = getRates("2026/27");
const r2526 = getRates("2025/26");
const r2425 = getRates("2024/25");

describe("personalAllowance (taper)", () => {
  it("is the full £12,570 up to £100,000", () => {
    expect(personalAllowance(50_000, r2627)).toBe(12_570);
    expect(personalAllowance(100_000, r2627)).toBe(12_570);
  });

  it("tapers by £1 for every £2 above £100,000", () => {
    // £115,000 -> 12,570 - (15,000/2) = 5,070
    expect(personalAllowance(115_000, r2627)).toBe(5_070);
  });

  it("reaches £0 at £125,140", () => {
    expect(personalAllowance(125_140, r2627)).toBe(0);
    expect(personalAllowance(200_000, r2627)).toBe(0);
  });

  it("adds Blind Person's Allowance for the correct year", () => {
    expect(personalAllowance(30_000, r2627, { blindPersons: true })).toBe(
      12_570 + 3_250,
    );
    expect(personalAllowance(30_000, r2526, { blindPersons: true })).toBe(
      12_570 + 3_130,
    );
    expect(personalAllowance(30_000, r2425, { blindPersons: true })).toBe(
      12_570 + 3_070,
    );
  });

  it("adds or removes the Marriage Allowance transfer", () => {
    expect(personalAllowance(30_000, r2627, { marriageAllowance: "receiving" })).toBe(
      13_830,
    );
    expect(
      personalAllowance(30_000, r2627, { marriageAllowance: "transferring" }),
    ).toBe(11_310);
  });

  it("uses a tax code allowance in place of the standard one", () => {
    expect(personalAllowance(30_000, r2627, { codeAllowance: 0 })).toBe(0);
    expect(personalAllowance(30_000, r2627, { codeAllowance: 10_000 })).toBe(10_000);
  });
});

describe("incomeTax — England/Wales/NI", () => {
  it("is £0 at or below the personal allowance", () => {
    expect(incomeTax(12_570, r2627).total).toBe(0);
    expect(incomeTax(0, r2627).total).toBe(0);
  });

  it("taxes the full basic-rate band at 20% (income £50,270)", () => {
    // 37,700 x 20% = 7,540
    expect(incomeTax(50_270, r2627).total).toBeCloseTo(7_540, 2);
  });

  it("applies the 40% band above £50,270 (income £60,000)", () => {
    // 7,540 + 9,730 x 40% = 11,432
    expect(incomeTax(60_000, r2627).total).toBeCloseTo(11_432, 2);
  });

  it("handles the personal-allowance taper (income £115,000)", () => {
    // PA 5,070; 37,700 x 20% + 72,230 x 40% = 36,432
    expect(incomeTax(115_000, r2627).total).toBeCloseTo(36_432, 2);
  });

  it("reaches the additional rate at £125,140 (PA fully tapered)", () => {
    // 37,700 x 20% + 87,440 x 40% = 42,516
    expect(incomeTax(125_140, r2627).total).toBeCloseTo(42_516, 2);
  });

  it("is identical across years while UK bands are frozen", () => {
    for (const rates of [r2425, r2526, r2627]) {
      expect(incomeTax(60_000, rates).total).toBeCloseTo(11_432, 2);
    }
  });

  it("returns a band breakdown that sums to the total", () => {
    const result = incomeTax(115_000, r2627);
    const summed = result.bands.reduce((s, b) => s + b.tax, 0);
    expect(summed).toBeCloseTo(result.total, 6);
    expect(result.allowance).toBe(5_070);
    expect(result.taxableIncome).toBeCloseTo(109_930, 6);
  });
});

describe("incomeTax — Scotland", () => {
  const scotland = { region: "scotland" as const };

  it("charges the starter rate on the first slice (2026/27, £16,537)", () => {
    // Gross 16,537 -> taxable 3,967 all at 19% = 753.73
    expect(incomeTax(16_537, r2627, scotland).total).toBeCloseTo(753.73, 2);
  });

  it("stacks starter, basic and intermediate (2026/27, £43,662)", () => {
    // 3,967x19% + 12,989x20% + 14,136x21% = 753.73 + 2,597.80 + 2,968.56
    expect(incomeTax(43_662, r2627, scotland).total).toBeCloseTo(6_320.09, 2);
  });

  it("charges the 42% higher rate above £43,662 (2026/27, £60,000)", () => {
    // 6,320.09 + (60,000-43,662) x 42% = 6,320.09 + 6,861.96
    expect(incomeTax(60_000, r2627, scotland).total).toBeCloseTo(13_182.05, 2);
  });

  it("differs from the UK calculation at the same income", () => {
    const uk = incomeTax(60_000, r2627).total;
    const scot = incomeTax(60_000, r2627, scotland).total;
    expect(scot).toBeGreaterThan(uk);
  });

  it("uses each year's own Scottish bands", () => {
    // Starter band width differs by year, so the same income gives different tax.
    const a = incomeTax(30_000, r2425, scotland).total;
    const b = incomeTax(30_000, r2526, scotland).total;
    const c = incomeTax(30_000, r2627, scotland).total;
    expect(a).not.toBeCloseTo(b, 2);
    expect(b).not.toBeCloseTo(c, 2);
  });
});
