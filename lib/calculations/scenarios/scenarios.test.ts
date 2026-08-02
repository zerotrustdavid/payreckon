import { describe, expect, it } from "vitest";
import { getRates } from "../../constants";
import { employerNI } from "../nationalInsurance";
import { calculateLimitedCompany } from "./limitedCompany";
import { calculatePaye } from "./paye";
import { calculateUmbrella, solveGrossPay } from "./umbrella";

const rates = getRates("2026/27");
const ASSIGNMENT = 115_000; // £500/day x 5 x 46

describe("solveGrossPay — the umbrella circular solve", () => {
  it("recomposes exactly to the money available (round trip)", () => {
    const available = 110_000;
    const gross = solveGrossPay(available, rates, { levyRate: 0.005 });

    const recomposed =
      gross + employerNI(gross, rates) + gross * 0.005;

    // Exact to the penny — this is the "no estimates" guarantee.
    expect(recomposed).toBeCloseTo(available, 6);
  });

  it("round trips with employer pension in the mix", () => {
    const available = 90_000;
    const gross = solveGrossPay(available, rates, {
      levyRate: 0.005,
      employerPensionRate: 0.03,
    });
    const recomposed =
      gross + employerNI(gross, rates) + gross * 0.005 + gross * 0.03;
    expect(recomposed).toBeCloseTo(available, 6);
  });

  it("round trips below the employer NI threshold", () => {
    // £4,000 is under the £5,000 secondary threshold, so no employer NI arises.
    const gross = solveGrossPay(4_000, rates, { levyRate: 0.005 });
    expect(gross + employerNI(gross, rates) + gross * 0.005).toBeCloseTo(4_000, 6);
    expect(employerNI(gross, rates)).toBe(0);
  });

  it("picks the correct branch either side of the threshold", () => {
    const below = solveGrossPay(4_000, rates);
    expect(below).toBeCloseTo(4_000, 6);
    const above = solveGrossPay(50_000, rates);
    expect(above).toBeLessThan(50_000);
  });

  it("round trips for a zero-rate employer category (under 21)", () => {
    const gross = solveGrossPay(60_000, rates, { niCategory: "M" });
    expect(gross + employerNI(gross, rates, "M")).toBeCloseTo(60_000, 6);
  });

  it("returns 0 for no available income", () => {
    expect(solveGrossPay(0, rates)).toBe(0);
    expect(solveGrossPay(-100, rates)).toBe(0);
  });
});

describe("calculateUmbrella", () => {
  const base = { assignmentIncome: ASSIGNMENT, umbrellaMargin: 25 * 46 };

  it("leaves no money unaccounted for", () => {
    const r = calculateUmbrella(base, rates);
    // Assignment = margin + employment taxes + personal taxes + take-home.
    expect(r.takeHome + r.totalTax + (base.umbrellaMargin ?? 0)).toBeCloseTo(
      ASSIGNMENT,
      4,
    );
  });

  it("charges more tax once the apprenticeship levy applies", () => {
    const without = calculateUmbrella(base, rates);
    const withLevy = calculateUmbrella(
      { ...base, applyApprenticeshipLevy: true },
      rates,
    );
    expect(withLevy.takeHome).toBeLessThan(without.takeHome);
  });

  it("moves accrued holiday pay out of take-home but keeps it in total capital", () => {
    const rolled = calculateUmbrella(
      { ...base, holidayPayMethod: "advanced" },
      rates,
    );
    const accrued = calculateUmbrella(
      { ...base, holidayPayMethod: "accrued" },
      rates,
    );
    expect(accrued.takeHome).toBeLessThan(rolled.takeHome);
    expect(accrued.totalCapital).toBeCloseTo(rolled.totalCapital, 4);
  });

  it("reduces take-home but preserves capital when pensions are paid", () => {
    const none = calculateUmbrella(base, rates);
    const withPension = calculateUmbrella(
      { ...base, pensionMethod: "salary-sacrifice", employeePensionPercent: 5 },
      rates,
    );
    expect(withPension.takeHome).toBeLessThan(none.takeHome);
    expect(withPension.totalCapital).toBeGreaterThan(none.takeHome);
  });

  it("a bigger margin leaves less take-home", () => {
    const small = calculateUmbrella({ ...base, umbrellaMargin: 500 }, rates);
    const large = calculateUmbrella({ ...base, umbrellaMargin: 5_000 }, rates);
    expect(large.takeHome).toBeLessThan(small.takeHome);
  });

  it("warns when a student loan plan is not repayable in the year", () => {
    const r = calculateUmbrella(
      { ...base, studentLoanPlan: "plan5" },
      getRates("2024/25"),
    );
    expect(r.warnings.length).toBeGreaterThan(0);
  });
});

describe("calculateLimitedCompany", () => {
  const base = { revenue: ASSIGNMENT };

  it("leaves no money unaccounted for", () => {
    const r = calculateLimitedCompany(base, rates);
    expect(r.takeHome + r.totalTax).toBeCloseTo(ASSIGNMENT, 4);
  });

  it("reduces corporation tax when expenses are claimed", () => {
    const withExpenses = calculateLimitedCompany(
      { ...base, recurringExpenses: 10_000 },
      rates,
    );
    const without = calculateLimitedCompany(base, rates);
    expect(withExpenses.totalTax).toBeLessThan(without.totalTax);
  });

  it("shows the personal allowance salary beating a high salary", () => {
    const efficient = calculateLimitedCompany(
      { ...base, salaryStrategy: "personal-allowance" },
      rates,
    );
    const high = calculateLimitedCompany(
      { ...base, salaryStrategy: "custom", customSalary: 50_000 },
      rates,
    );
    expect(efficient.takeHome).toBeGreaterThan(high.takeHome);
  });

  it("ignores Employment Allowance without a second employee, and warns", () => {
    const claimed = calculateLimitedCompany(
      { ...base, claimEmploymentAllowance: true },
      rates,
    );
    const notClaimed = calculateLimitedCompany(base, rates);
    expect(claimed.totalTax).toBeCloseTo(notClaimed.totalTax, 6);
    expect(claimed.warnings.length).toBeGreaterThan(0);
  });

  it("applies Employment Allowance when there is a second employee", () => {
    const eligible = calculateLimitedCompany(
      {
        ...base,
        salaryStrategy: "custom",
        customSalary: 30_000,
        claimEmploymentAllowance: true,
        hasSecondEmployee: true,
      },
      rates,
    );
    const ineligible = calculateLimitedCompany(
      { ...base, salaryStrategy: "custom", customSalary: 30_000 },
      rates,
    );
    expect(eligible.takeHome).toBeGreaterThan(ineligible.takeHome);
  });

  it("halves dividends for a 50% owned business", () => {
    const full = calculateLimitedCompany(base, rates);
    const half = calculateLimitedCompany(
      { ...base, ownershipSharePercent: 50 },
      rates,
    );
    expect(half.takeHome).toBeLessThan(full.takeHome);
  });

  it("adds a BADR gain net of tax to total capital", () => {
    const withGain = calculateLimitedCompany({ ...base, badrGain: 100_000 }, rates);
    const without = calculateLimitedCompany(base, rates);
    // 18% BADR in 2026/27 leaves £82,000 of a £100,000 gain.
    expect(withGain.totalCapital - without.totalCapital).toBeCloseTo(82_000, 2);
  });
});

describe("calculatePaye", () => {
  it("matches a plain salary calculation", () => {
    const r = calculatePaye({ salary: 60_000 }, rates);
    expect(r.personal.incomeTax.total).toBeCloseTo(11_432, 2);
    expect(r.personal.nationalInsurance).toBeCloseTo(3_210.6, 2);
    expect(r.takeHome).toBeCloseTo(60_000 - 14_642.6, 2);
  });

  it("leaves no money unaccounted for", () => {
    const r = calculatePaye({ salary: 60_000, bonus: 5_000 }, rates);
    expect(r.takeHome + r.totalTax).toBeCloseTo(65_000, 4);
  });

  it("taxes benefits in kind without adding them to take-home", () => {
    const plain = calculatePaye({ salary: 60_000 }, rates);
    const withBenefits = calculatePaye(
      { salary: 60_000, taxableBenefits: 5_000 },
      rates,
    );
    // More income tax, no extra employee NI, and lower take-home.
    expect(withBenefits.personal.incomeTax.total).toBeGreaterThan(
      plain.personal.incomeTax.total,
    );
    expect(withBenefits.personal.nationalInsurance).toBeCloseTo(
      plain.personal.nationalInsurance,
      6,
    );
    expect(withBenefits.takeHome).toBeLessThan(plain.takeHome);
  });

  it("counts bonus and overtime in gross pay", () => {
    const r = calculatePaye(
      { salary: 40_000, bonus: 5_000, overtime: 3_000, cashAllowances: 2_000 },
      rates,
    );
    expect(r.grossInput).toBe(50_000);
  });
});

describe("cross-scenario consistency", () => {
  it("taxes the same salary identically through PAYE and a limited company", () => {
    const paye = calculatePaye({ salary: 12_570 }, rates);
    const ltd = calculateLimitedCompany(
      { revenue: 12_570, salaryStrategy: "personal-allowance" },
      rates,
    );
    expect(paye.personal.incomeTax.total).toBeCloseTo(
      ltd.personal.incomeTax.total,
      6,
    );
    expect(paye.personal.nationalInsurance).toBeCloseTo(
      ltd.personal.nationalInsurance,
      6,
    );
  });

  it("produces a result for every calculator in every supported year", () => {
    for (const year of ["2024/25", "2025/26", "2026/27"] as const) {
      const y = getRates(year);
      expect(calculateUmbrella({ assignmentIncome: ASSIGNMENT }, y).takeHome).toBeGreaterThan(0);
      expect(calculateLimitedCompany({ revenue: ASSIGNMENT }, y).takeHome).toBeGreaterThan(0);
      expect(calculatePaye({ salary: 60_000 }, y).takeHome).toBeGreaterThan(0);
    }
  });

  it("shows the 2026/27 dividend rise costing a limited company more", () => {
    const before = calculateLimitedCompany({ revenue: ASSIGNMENT }, getRates("2025/26"));
    const after = calculateLimitedCompany({ revenue: ASSIGNMENT }, getRates("2026/27"));
    expect(after.takeHome).toBeLessThan(before.takeHome);
  });

  it("returns zeros rather than NaN for empty input", () => {
    for (const r of [
      calculateUmbrella({ assignmentIncome: 0 }, rates),
      calculateLimitedCompany({ revenue: 0 }, rates),
      calculatePaye({ salary: 0 }, rates),
    ]) {
      expect(r.takeHome).toBe(0);
      expect(r.totalTax).toBe(0);
      expect(r.effectiveRate).toBe(0);
    }
  });
});
