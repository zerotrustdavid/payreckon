"use client";

import { useRef } from "react";

export interface Segment<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  /** Accessible name for the group. */
  ariaLabel: string;
  value: T;
  segments: readonly Segment<T>[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
  full?: boolean;
}

/**
 * A radio group styled as a segmented control, with arrow-key navigation and a
 * roving tabindex per the ARIA radiogroup pattern.
 */
export function SegmentedControl<T extends string>({
  ariaLabel,
  value,
  segments,
  onChange,
  size = "md",
  full = false,
}: SegmentedControlProps<T>) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (index: number) => {
    const next = (index + segments.length) % segments.length;
    onChange(segments[next].value);
    buttons.current[next]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      move(index + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      move(index - 1);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      // max-w-full + overflow-x-auto keeps a wide control scrolling inside its
      // own box rather than pushing the page into a horizontal scroll.
      className={`no-scrollbar inline-flex max-w-full overflow-x-auto rounded-lg border border-line bg-inset p-0.5 ${
        full ? "w-full" : ""
      }`}
    >
      {segments.map((segment, index) => {
        const selected = segment.value === value;
        return (
          <button
            key={segment.value}
            ref={(el) => {
              buttons.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(segment.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`shrink-0 whitespace-nowrap rounded-[6px] font-medium transition-colors ${
              size === "sm" ? "px-2 py-1.5 text-xs sm:px-2.5" : "px-2.5 py-2 text-sm sm:px-3"
            } ${full ? "flex-1 shrink" : ""} ${
              selected
                ? "bg-accent text-accent-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}
