"use client";

import { useState } from "react";

interface DisclosureProps {
  summary: string;
  hint?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * Progressive disclosure for the advanced inputs, so the common case stays
 * simple without hiding the detail that makes the result precise.
 */
export function Disclosure({
  summary,
  hint,
  children,
  defaultOpen = false,
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-line bg-inset">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className="text-sm font-medium text-ink">{summary}</span>
          {hint && <span className="mt-0.5 block text-xs text-faint">{hint}</span>}
        </span>
        <span
          aria-hidden="true"
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="border-t border-line px-4 py-4">{children}</div>
      )}
    </div>
  );
}
