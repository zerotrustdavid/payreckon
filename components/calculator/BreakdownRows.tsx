"use client";

import { useState } from "react";
import type { BreakdownLine } from "../../lib/calculations/scenarios";
import { formatGBP } from "../../lib/format";

/** Deductions read as negative; additions and subtotals read as written. */
function signed(line: BreakdownLine, amount: number): string {
  const formatted = formatGBP(Math.abs(amount));
  return line.kind === "deduction" ? `−${formatted}` : formatted;
}

function toneFor(kind: BreakdownLine["kind"]): string {
  switch (kind) {
    case "total":
      return "text-ink font-semibold";
    case "subtotal":
      return "text-ink font-medium";
    case "deduction":
      return "text-muted";
    case "addition":
      return "text-muted";
    default:
      return "text-muted";
  }
}

function Row({
  line,
  convert,
  depth = 0,
}: {
  line: BreakdownLine;
  convert: (annual: number) => number;
  depth?: number;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = (line.children?.length ?? 0) > 0;
  const amount = convert(line.amount);

  const isTotal = line.kind === "total";

  return (
    <>
      <div
        className={`flex items-center justify-between gap-3 py-2.5 ${
          isTotal ? "border-t border-line-strong" : "border-t border-line"
        } ${depth > 0 ? "pl-4" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="flex items-center gap-1.5 text-left"
            >
              <span
                aria-hidden="true"
                className={`text-[10px] text-faint transition-transform ${
                  open ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
              <span className={`text-sm ${toneFor(line.kind)}`}>{line.label}</span>
            </button>
          ) : (
            <span className={`text-sm ${toneFor(line.kind)} ${depth > 0 ? "text-faint" : ""}`}>
              {line.label}
            </span>
          )}
        </div>
        <span
          className={`tnum shrink-0 text-sm ${
            isTotal ? "text-base font-semibold text-ink" : toneFor(line.kind)
          } ${line.kind === "total" && line.label === "Take home" ? "text-positive" : ""}`}
        >
          {signed(line, amount)}
        </span>
      </div>

      {line.hint && !hasChildren && (
        <p className={`pb-2 text-xs leading-snug text-faint ${depth > 0 ? "pl-4" : ""}`}>
          {line.hint}
        </p>
      )}

      {open &&
        line.children?.map((child) => (
          <Row key={child.label} line={child} convert={convert} depth={depth + 1} />
        ))}
    </>
  );
}

export function BreakdownRows({
  lines,
  convert,
}: {
  lines: BreakdownLine[];
  convert: (annual: number) => number;
}) {
  return (
    <div className="flex flex-col">
      {lines.map((line) => (
        <Row key={line.label} line={line} convert={convert} />
      ))}
    </div>
  );
}
