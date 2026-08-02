/** Formats a number as GBP with no pence, e.g. 115000 -> "£115,000". */
export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/** Formats GBP including pence, for figures where rounding would obscure detail. */
export function formatGBPExact(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/** Formats a 0–1 rate as a percentage, e.g. 0.354 -> "35.4%". */
export function formatPercent(rate: number, decimals = 1): string {
  const safe = Number.isFinite(rate) ? rate : 0;
  return `${(safe * 100).toFixed(decimals)}%`;
}
