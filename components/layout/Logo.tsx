/**
 * PayReckon wordmark. The mark is a stylised tally/ledger stroke — three bars
 * stepping up to a rule, echoing a pay breakdown resolving into a total.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="26" height="26" rx="7" fill="var(--pr-accent)" />
        <rect x="6" y="14" width="3" height="6" rx="1.5" fill="var(--pr-accent-ink)" />
        <rect x="11.5" y="10" width="3" height="10" rx="1.5" fill="var(--pr-accent-ink)" />
        <rect x="17" y="6" width="3" height="14" rx="1.5" fill="var(--pr-accent-ink)" />
      </svg>
      {!compact && (
        <span className="text-[17px] font-semibold tracking-tight text-ink">
          Pay<span className="text-accent">Reckon</span>
        </span>
      )}
    </span>
  );
}
