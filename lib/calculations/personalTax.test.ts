import { describe, expect, it } from "vitest";
import { getRates } from "../constants";
import { pensionContributions } from "./pension";
import { personalTax } from "./personalTax";

const rates = getRates("2026/27");

describe("personalTax — baseline", () => {
  it("matches the standalone primitives on a simple salary", () => {
    const result = personalTax({ earnedIncome: 60_000 }, rates);
    expect(result.incomeTax.total).toBeCloseTo(11_432, 2);
    expect(result.nationalInsurance).toBeCloseTo(3_210.6, 2);
    expect(result.totalTax).toBeCloseTo(14_642.6, 2);
    expect(result.adjustedNetIncome).toBe(60_000);
  });

  it("adds dividend tax stacked on top of salary", () => {
    const result = personalTax(
      { earnedIncome: 12_570, dividendIncome: 50_000 },
      rates,
    );
    expect(result.dividendTax.total).toBeCloseTo(8_396.25, 2);
    expect(result.nationalInsurance).toBe(0);
  });

  it("can suppress employee NI for non-employment income", () => {
    const result = personalTax(
      { earnedIncome: 60_000, applyEmployeeNI: false },
      rates,
    );
    expect(result.nationalInsurance).toBe(0);
  });
});

describe("personalTax — tax codes", () => {
  it("uses the allowance implied by the code", () => {
    const result = personalTax({ earnedIncome: 60_000, taxCode: "1000L" }, rates);
    expect(result.incomeTax.allowance).toBe(10_000);
    // 37,700 x 20% + (50,000 - 37,700) x 40% = 7,540 + 4,920
    expect(result.incomeTax.total).toBeCloseTo(12_460, 2);
  });

  it("charges everything at the basic rate under BR", () => {
    const result = personalTax({ earnedIncome: 60_000, taxCode: "BR" }, rates);
    expect(result.incomeTax.total).toBeCloseTo(12_000, 2);
    expect(result.incomeTax.allowance).toBe(0);
  });

  it("charges everything at the higher rate under D0", () => {
    const result = personalTax({ earnedIncome: 60_000, taxCode: "D0" }, rates);
    expect(result.incomeTax.total).toBeCloseTo(24_000, 2);
  });

  it("charges no income tax under NT but still charges NI", () => {
    const result = personalTax({ earnedIncome: 60_000, taxCode: "NT" }, rates);
    expect(result.incomeTax.total).toBe(0);
    expect(result.nationalInsurance).toBeCloseTo(3_210.6, 2);
  });

  it("adds untaxed income for a K code", () => {
    const result = personalTax({ earnedIncome: 30_000, taxCode: "K500" }, rates);
    // Allowance -5,000, so taxable is 35,000 rather than 30,000.
    expect(result.incomeTax.taxableIncome).toBeCloseTo(35_000, 2);
    expect(result.incomeTax.total).toBeCloseTo(7_000, 2);
  });

  it("switches region from an S prefix", () => {
    const result = personalTax({ earnedIncome: 60_000, taxCode: "S1257L" }, rates);
    expect(result.region).toBe("scotland");
    expect(result.incomeTax.total).toBeCloseTo(13_182.05, 2);
  });
});

describe("personalTax — pensions", () => {
  it("salary sacrifice reduces both income tax and NI", () => {
    const pension = pensionContributions(60_000, rates, {
      method: "salary-sacrifice",
      basis: "fixed",
      value: 10_000,
    });
    const result = personalTax(
      { earnedIncome: 60_000, pension },
      rates,
    );
    // Taxed and NI'd as if earning 50,000.
    expect(result.incomeTax.total).toBeCloseTo(7_486, 2);
    expect(result.nationalInsurance).toBeCloseTo(2_994.4, 2);
  });

  it("net-pay reduces income tax but not NI", () => {
    const pension = pensionContributions(60_000, rates, {
      method: "net-pay",
      basis: "fixed",
      value: 10_000,
    });
    const result = personalTax({ earnedIncome: 60_000, pension }, rates);
    expect(result.incomeTax.total).toBeCloseTo(7_486, 2);
    // NI still charged on the full 60,000.
    expect(result.nationalInsurance).toBeCloseTo(3_210.6, 2);
  });

  it("relief at source extends the basic-rate band instead", () => {
    const pension = pensionContributions(60_000, rates, {
      method: "relief-at-source",
      basis: "fixed",
      value: 10_000,
    });
    const result = personalTax({ earnedIncome: 60_000, pension }, rates);
    // Basic band widened to 47,700, so less income falls into the 40% band:
    // 47,700 x 20% + (47,430 - 47,700 -> 0)... taxable 47,430 all within basic.
    expect(result.incomeTax.total).toBeCloseTo(9_486, 2);
    expect(result.nationalInsurance).toBeCloseTo(3_210.6, 2);
  });

  it("percentage contributions can be limited to qualifying earnings", () => {
    const pension = pensionContributions(60_000, rates, {
      method: "net-pay",
      basis: "percentage",
      value: 5,
      useQualifyingEarnings: true,
    });
    // 5% of (50,270 - 6,240) = 2,201.50
    expect(pension.employeeContribution).toBeCloseTo(2_201.5, 2);
  });
});

describe("personalTax — student loans", () => {
  it("adds the repayment to total tax", () => {
    const result = personalTax(
      { earnedIncome: 60_000, studentLoanPlan: "plan2" },
      rates,
    );
    expect(result.studentLoan.total).toBeCloseTo(2_755.35, 2);
    expect(result.totalTax).toBeCloseTo(11_432 + 3_210.6 + 2_755.35, 2);
  });
});

describe("personalTax — allowances", () => {
  it("applies Blind Person's Allowance", () => {
    const result = personalTax(
      { earnedIncome: 30_000, blindPersons: true },
      rates,
    );
    expect(result.incomeTax.allowance).toBe(12_570 + 3_250);
  });

  it("applies a Marriage Allowance transfer in both directions", () => {
    const receiving = personalTax(
      { earnedIncome: 30_000, marriageAllowance: "receiving" },
      rates,
    );
    const transferring = personalTax(
      { earnedIncome: 30_000, marriageAllowance: "transferring" },
      rates,
    );
    expect(receiving.incomeTax.total).toBeLessThan(transferring.incomeTax.total);
    expect(receiving.incomeTax.allowance - transferring.incomeTax.allowance).toBe(
      2_520,
    );
  });
});
