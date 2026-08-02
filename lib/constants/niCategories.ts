import type { NICategory, NICategoryLetter } from "./types";

/**
 * Builds the National Insurance category table for a tax year.
 *
 * The *structure* of the categories is stable across years — what changes is the
 * employer rate, the upper secondary threshold, and the married women's reduced
 * rate — so each year file passes its own verified figures in rather than
 * restating twelve objects (which invites transcription errors).
 *
 * Categories modelled (source: https://www.gov.uk/national-insurance-rates-letters):
 *   A  standard
 *   B  married women / widows paying the reduced rate
 *   C  over State Pension age (no employee contributions)
 *   H  apprentice under 25            } employer pays 0% up to the
 *   M  under 21                       } upper secondary threshold
 *   V  qualifying veteran (first year) }
 *   J  deferred (employee pays the upper rate only)
 *   Z  under 21 and deferred
 *
 * Not modelled: F, I, L and S (Freeport and Investment Zone categories), which use
 * a separate upper secondary threshold. The UI states this rather than guessing.
 */
export function buildNICategories(params: {
  employerRate: number;
  /** Upper secondary threshold for under-21 / apprentice / veteran categories. */
  upperSecondaryThreshold: number;
  employeeMainRate: number;
  employeeUpperRate: number;
  /** Married women's reduced rate (category B). */
  reducedRate: number;
}): Record<NICategoryLetter, NICategory> {
  const {
    employerRate,
    upperSecondaryThreshold,
    employeeMainRate,
    employeeUpperRate,
    reducedRate,
  } = params;

  return {
    A: {
      label: "A — Standard rate",
      employeeMain: employeeMainRate,
      employeeUpper: employeeUpperRate,
      employerRate,
      employerZeroRateUpTo: 0,
    },
    B: {
      label: "B — Married women's reduced rate",
      employeeMain: reducedRate,
      employeeUpper: employeeUpperRate,
      employerRate,
      employerZeroRateUpTo: 0,
    },
    C: {
      label: "C — Over State Pension age",
      employeeMain: 0,
      employeeUpper: 0,
      employerRate,
      employerZeroRateUpTo: 0,
    },
    H: {
      label: "H — Apprentice under 25",
      employeeMain: employeeMainRate,
      employeeUpper: employeeUpperRate,
      employerRate,
      employerZeroRateUpTo: upperSecondaryThreshold,
    },
    J: {
      label: "J — Deferred contributions",
      employeeMain: employeeUpperRate,
      employeeUpper: employeeUpperRate,
      employerRate,
      employerZeroRateUpTo: 0,
    },
    M: {
      label: "M — Under 21",
      employeeMain: employeeMainRate,
      employeeUpper: employeeUpperRate,
      employerRate,
      employerZeroRateUpTo: upperSecondaryThreshold,
    },
    V: {
      label: "V — Veteran's first civilian year",
      employeeMain: employeeMainRate,
      employeeUpper: employeeUpperRate,
      employerRate,
      employerZeroRateUpTo: upperSecondaryThreshold,
    },
    Z: {
      label: "Z — Under 21, deferred",
      employeeMain: employeeUpperRate,
      employeeUpper: employeeUpperRate,
      employerRate,
      employerZeroRateUpTo: upperSecondaryThreshold,
    },
  };
}
