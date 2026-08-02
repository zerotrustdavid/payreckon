/**
 * PayReckon logo.
 *
 * The geometry here is the same source of truth as the downloadable brand files
 * in `public/brand/` — both come from `scripts/generate-brand-assets.mjs`. Keep
 * them in step: change the script, run `npm run brand`, mirror it here.
 */
export function Logo({
  compact = false,
  size = 28,
}: {
  compact?: boolean;
  size?: number;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="64" height="64" rx="15" fill="var(--pr-accent)" />
        <rect x="15" y="36" width="9" height="13" rx="4.5" fill="var(--pr-accent-ink)" />
        <rect x="27.5" y="26.5" width="9" height="22.5" rx="4.5" fill="var(--pr-accent-ink)" />
        <rect x="40" y="17" width="9" height="32" rx="4.5" fill="var(--pr-accent-ink)" />
      </svg>
      {!compact && (
        <span className="text-[17px] font-semibold tracking-tight text-ink">
          Pay<span className="text-accent">Reckon</span>
        </span>
      )}
    </span>
  );
}
