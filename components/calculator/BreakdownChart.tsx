"use client";

import { useId, useState } from "react";
import { formatGBP, formatPercent } from "../../lib/format";

/**
 * Categorical palette, validated for this surface (#10161E) with
 * scripts/validate_palette.js: all eight slots sit inside the dark lightness
 * band, clear the chroma floor, hold >= 3:1 contrast, and the worst adjacent
 * pair separates at CVD ΔE 8.4 / normal-vision 19.3.
 *
 * Slots are assigned by ENTITY below, never by rank, so a segment keeps its
 * colour whether or not other segments are present.
 */
const SLOTS = [
  "#3987e5",
  "#d95926",
  "#199e70",
  "#c98500",
  "#d55181",
  "#008300",
  "#9085e9",
  "#e66767",
] as const;

/**
 * Fixed entity → slot mapping, shared across all three calculators, so a
 * category never changes colour when the series count changes.
 *
 * "Employment costs" (umbrella) and "Other" (limited company) share slot 3
 * because they are the same idea — revenue that never reaches you as income —
 * and can never appear in the same chart.
 */
export const SERIES_SLOT: Record<string, number> = {
  "Take home": 0,
  "Income tax": 1,
  "National Insurance": 2,
  "Employment costs": 3,
  Other: 3,
  "Corporation tax": 4,
  "Dividend tax": 5,
  "Student loan": 6,
  Pension: 7,
};

export interface ChartSegment {
  label: string;
  value: number;
}

export function seriesColour(label: string): string {
  const slot = SERIES_SLOT[label];
  return SLOTS[slot ?? SLOTS.length - 1];
}

interface BreakdownChartProps {
  segments: ChartSegment[];
  total: number;
  caption?: string;
}

/**
 * Where each pound of the headline figure ends up — a part-to-whole composition,
 * so a single stacked bar rather than a pie or a set of separate bars.
 */
export function BreakdownChart({ segments, total, caption }: BreakdownChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const titleId = useId();

  const visible = segments.filter((s) => s.value > 0.005);
  const sum = visible.reduce((acc, s) => acc + s.value, 0);
  const denominator = total > 0 ? total : sum;

  if (denominator <= 0 || visible.length === 0) {
    return (
      <p className="text-sm text-faint">
        Enter a rate to see where your money goes.
      </p>
    );
  }

  // Lay segments out as percentages, keeping a 2px surface gap between fills.
  const laid = visible.map((segment) => ({
    ...segment,
    share: segment.value / denominator,
  }));

  return (
    <figure className="m-0">
      <div
        className="relative flex h-11 w-full overflow-hidden rounded-lg"
        role="img"
        aria-labelledby={titleId}
      >
        {laid.map((segment, index) => (
          <div
            key={segment.label}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className="relative h-full transition-opacity"
            style={{
              width: `${segment.share * 100}%`,
              minWidth: 3,
              background: seriesColour(segment.label),
              // 2px gap between fills, achieved with a surface-coloured border
              // so it reads as a gap without breaking the percentage widths.
              borderRight:
                index < laid.length - 1 ? "2px solid var(--pr-surface)" : undefined,
              opacity: hovered === null || hovered === index ? 1 : 0.45,
            }}
          />
        ))}
      </div>

      <p id={titleId} className="sr-only">
        {caption ?? "Breakdown of gross income"}:{" "}
        {laid
          .map(
            (s) => `${s.label} ${formatGBP(s.value)} (${formatPercent(s.share)})`,
          )
          .join(", ")}
      </p>

      {/* Legend is always present, and carries the values so identity and
          magnitude never depend on colour alone. */}
      <figcaption className="mt-4 flex flex-col gap-0.5">
        {laid.map((segment, index) => (
          <div
            key={segment.label}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center justify-between gap-3 rounded-md px-1.5 py-1.5 text-sm transition-colors ${
              hovered === index ? "bg-surface-2" : ""
            }`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ background: seriesColour(segment.label) }}
              />
              <span className="text-muted">{segment.label}</span>
            </span>
            <span className="tnum shrink-0 text-ink">
              {formatGBP(segment.value)}
              <span className="ml-2 tabular-nums text-faint">
                {formatPercent(segment.share)}
              </span>
            </span>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}
