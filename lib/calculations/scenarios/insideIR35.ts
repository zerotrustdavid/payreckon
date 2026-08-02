import { getRates } from "../../constants";
import { incomeTax } from "../incomeTax";
import { class1EmployeeNI } from "../nationalInsurance";
import type { ScenarioResult } from "../../types";

/**
 * Inside IR35 — deemed employment. The engagement's gross fee is treated as
 * employment income, taxed via PAYE income tax plus Class 1 employee NI.
 *
 * Simplification: this models the contractor's own income tax + employee NI on
 * the gross figure. It does not separately deduct the employer NI that a
 * fee-payer accounts for on the deemed payment — consistent with the dashboard's
 * "tax on gross income before expenses" altitude.
 */
export function insideIR35(grossRevenue: number): ScenarioResult {
  const rates = getRates();
  const gross = Math.max(0, grossRevenue);
  const tax = incomeTax(gross, rates).total;
  const ni = class1EmployeeNI(gross, rates);
  const totalTax = tax + ni;

  return {
    grossRevenue: gross,
    lines: [
      { label: "Income tax (PAYE)", amount: tax },
      { label: "Employee NI (Class 1)", amount: ni },
    ],
    totalTax,
    takeHome: gross - totalTax,
    effectiveRate: gross > 0 ? totalTax / gross : 0,
    notes: [
      "Deemed employment: gross fee taxed as employment income.",
      "Does not separately model the employer NI a fee-payer accounts for on the deemed payment.",
    ],
  };
}
