import { RATES_2024_25 } from "./tax-rates-2024-25";
import { RATES_2025_26 } from "./tax-rates-2025-26";
import { RATES_2026_27 } from "./tax-rates-2026-27";
import type { TaxYear, TaxYearRates } from "./types";

export * from "./types";

/** Every supported tax year, oldest first. */
export const TAX_YEARS: TaxYear[] = ["2024/25", "2025/26", "2026/27"];

/** The year selected by default — always the most recent supported year. */
export const CURRENT_TAX_YEAR: TaxYear = "2026/27";

const REGISTRY: Record<TaxYear, TaxYearRates> = {
  "2024/25": RATES_2024_25,
  "2025/26": RATES_2025_26,
  "2026/27": RATES_2026_27,
};

/**
 * Rates and thresholds for a tax year.
 *
 * Every calculation takes its rates through this function rather than importing a
 * year directly, so switching year re-runs the identical maths against a different
 * rate set — and adding next year's rates needs no change to any calculation.
 */
export function getRates(taxYear: TaxYear = CURRENT_TAX_YEAR): TaxYearRates {
  const rates = REGISTRY[taxYear];
  if (!rates) {
    throw new Error(`No tax rates available for ${taxYear}`);
  }
  return rates;
}

export { RATES_2024_25, RATES_2025_26, RATES_2026_27 };
