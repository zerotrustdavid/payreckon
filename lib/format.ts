/**
 * Formats a number as GBP with no pence, e.g. 115000 → "£115,000".
 */
export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}
