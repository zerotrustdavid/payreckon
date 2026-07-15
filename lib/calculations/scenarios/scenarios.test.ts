import { describe, expect, it } from "vitest";
import { calculateScenario, insideIR35, outsideLtd, outsideSoleTrader } from "./index";

// Reference gross used across cases: £500/day × 5 × 46 = £115,000.
const GROSS = 115_000;

describe("insideIR35", () => {
  it("sums income tax + Class 1 NI on the gross (£115,000)", () => {
    // incomeTax 36,432 + class1 (3,016 + 1,294.60) = 40,742.60
    const r = insideIR35(GROSS);
    expect(r.totalTax).toBeCloseTo(40_742.6, 1);
    expect(r.takeHome).toBeCloseTo(74_257.4, 1);
  });
});

describe("outsideSoleTrader", () => {
  it("sums income tax + Class 4 NI on the gross (£115,000)", () => {
    // incomeTax 36,432 + class4 (2,262 + 1,294.60) = 39,988.60
    const r = outsideSoleTrader(GROSS);
    expect(r.totalTax).toBeCloseTo(39_988.6, 1);
    expect(r.takeHome).toBeCloseTo(75_011.4, 1);
  });
});

describe("outsideLtd", () => {
  it("combines employer NI, corporation tax and dividend tax (£115,000, £12,570 salary)", () => {
    // employerNI 1,135.50; profit 101,294.50; CT 23,093.0425; dividends 78,201.4575;
    // dividend tax 18,478.2716 -> total 42,706.81
    const r = outsideLtd(GROSS);
    expect(r.totalTax).toBeCloseTo(42_706.81, 1);
    expect(r.takeHome).toBeCloseTo(72_293.19, 1);
  });

  it("clamps the salary to available revenue", () => {
    const r = outsideLtd(10_000, 12_570);
    // Salary can't exceed gross; no dividends left, but should not throw or go negative.
    expect(r.totalTax).toBeGreaterThanOrEqual(0);
    expect(r.takeHome + r.totalTax).toBeCloseTo(10_000, 6);
  });

  it("leaves fewer dividends (and shifts the mix) as salary rises", () => {
    const low = outsideLtd(GROSS, 12_570);
    const high = outsideLtd(GROSS, 30_000);
    const lowDiv = low.lines.find((l) => l.label === "Dividend tax")!.amount;
    const highCorp = high.lines.find((l) => l.label === "Corporation tax")!.amount;
    const lowCorp = low.lines.find((l) => l.label === "Corporation tax")!.amount;
    // A bigger salary is deductible, so corporation tax falls.
    expect(highCorp).toBeLessThan(lowCorp);
    expect(lowDiv).toBeGreaterThan(0);
  });
});

describe("scenario invariants", () => {
  const modes = ["inside", "outside-sole-trader", "outside-ltd"] as const;

  it("keeps takeHome + totalTax === gross for every mode", () => {
    for (const mode of modes) {
      const r = calculateScenario(mode, GROSS);
      expect(r.takeHome + r.totalTax).toBeCloseTo(GROSS, 6);
    }
  });

  it("returns zero tax and a 0% effective rate at zero revenue", () => {
    for (const mode of modes) {
      const r = calculateScenario(mode, 0);
      expect(r.totalTax).toBe(0);
      expect(r.effectiveRate).toBe(0);
    }
  });

  it("routes each mode to the right scenario via the dispatcher", () => {
    expect(calculateScenario("inside", GROSS).totalTax).toBeCloseTo(
      insideIR35(GROSS).totalTax,
      6,
    );
    expect(calculateScenario("outside-ltd", GROSS, { ltdSalary: 20_000 }).totalTax).toBeCloseTo(
      outsideLtd(GROSS, 20_000).totalTax,
      6,
    );
  });
});
