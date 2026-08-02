/**
 * Converting a quoted rate into an annual figure, and an annual figure back into
 * any display period.
 *
 * Contract rates are quoted per hour, day, week, month or year, so everything is
 * normalised to an annual amount before tax is applied, then converted back for
 * display. Conversions use the *actual working pattern* rather than a nominal
 * 52 weeks or 365 days, so "per day" means per day actually worked.
 */

export type RateFrequency = "hour" | "day" | "week" | "month" | "year";
export type DisplayPeriod = RateFrequency;

export interface WorkingPattern {
  hoursPerWeek: number;
  weeksPerYear: number;
  daysPerYear: number;
  monthsPerYear: number;
}

export const DEFAULT_WORKING_PATTERN: WorkingPattern = {
  hoursPerWeek: 37.5,
  weeksPerYear: 46,
  daysPerYear: 230,
  monthsPerYear: 12,
};

/** Guards a pattern value so a blank or nonsensical input can't produce NaN. */
function positive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function normalisePattern(pattern: Partial<WorkingPattern>): WorkingPattern {
  return {
    hoursPerWeek: positive(
      pattern.hoursPerWeek ?? NaN,
      DEFAULT_WORKING_PATTERN.hoursPerWeek,
    ),
    weeksPerYear: positive(
      pattern.weeksPerYear ?? NaN,
      DEFAULT_WORKING_PATTERN.weeksPerYear,
    ),
    daysPerYear: positive(
      pattern.daysPerYear ?? NaN,
      DEFAULT_WORKING_PATTERN.daysPerYear,
    ),
    monthsPerYear: positive(
      pattern.monthsPerYear ?? NaN,
      DEFAULT_WORKING_PATTERN.monthsPerYear,
    ),
  };
}

/** How many of the given period occur in a year, under this working pattern. */
export function periodsPerYear(
  period: DisplayPeriod,
  pattern: WorkingPattern,
): number {
  switch (period) {
    case "hour":
      return pattern.hoursPerWeek * pattern.weeksPerYear;
    case "day":
      return pattern.daysPerYear;
    case "week":
      return pattern.weeksPerYear;
    case "month":
      return pattern.monthsPerYear;
    case "year":
      return 1;
  }
}

/** Converts a rate quoted for `frequency` into a gross annual amount. */
export function annualise(
  amount: number,
  frequency: RateFrequency,
  pattern: Partial<WorkingPattern> = {},
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return amount * periodsPerYear(frequency, normalisePattern(pattern));
}

/** Converts an annual amount into the given display period. */
export function perPeriod(
  annualAmount: number,
  period: DisplayPeriod,
  pattern: Partial<WorkingPattern> = {},
): number {
  if (!Number.isFinite(annualAmount)) return 0;
  const divisor = periodsPerYear(period, normalisePattern(pattern));
  return divisor > 0 ? annualAmount / divisor : 0;
}

/**
 * Counts weekdays (Mon–Fri) inclusive between two dates. Used by the
 * specific-dates mode, where a contract's length is known exactly rather than
 * estimated from a weeks-per-year figure. Public holidays are not deducted —
 * whether a contractor works them varies by engagement.
 */
export function workingDaysBetween(start: Date, end: Date): number {
  if (
    !(start instanceof Date) ||
    !(end instanceof Date) ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return 0;
  }

  let count = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (cursor <= last) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}
