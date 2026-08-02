import { getRates } from "../../constants";
import { incomeTax } from "../incomeTax";
import { class4NI } from "../nationalInsurance";
import type { ScenarioResult } from "../../types";

/**
 * Outside IR35 as a sole trader. Trading profit (here taken as the gross figure,
 * before any business expenses) is taxed as personal income plus Class 4 NI.
 * Mandatory Class 2 NI is £0 for 2026/27 and is not added.
 */
export function outsideSoleTrader(grossRevenue: number): ScenarioResult {
  const rates = getRates();
  const gross = Math.max(0, grossRevenue);
  const tax = incomeTax(gross, rates).total;
  const ni = class4NI(gross, rates);
  const totalTax = tax + ni;

  return {
    grossRevenue: gross,
    lines: [
      { label: "Income tax", amount: tax },
      { label: "Class 4 NI", amount: ni },
    ],
    totalTax,
    takeHome: gross - totalTax,
    effectiveRate: gross > 0 ? totalTax / gross : 0,
    notes: [
      "Profit taken as the gross figure before deducting business expenses.",
      "Mandatory Class 2 NI is £0 for 2026/27.",
    ],
  };
}
