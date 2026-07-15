import type { ContractMode, ScenarioResult } from "../../lib/types";
import { formatGBP } from "../../lib/format";

const MODE_LABELS: Record<ContractMode, string> = {
  inside: "Inside IR35",
  "outside-sole-trader": "Outside IR35 — Sole trader",
  "outside-ltd": "Outside IR35 — Own Ltd company",
};

interface ResultsSummaryProps {
  contractMode: ContractMode;
  result: ScenarioResult;
}

/**
 * Renders the headline outputs of the calculator for the selected contract
 * mode: gross revenue, an itemised tax/NI breakdown, total exposure, estimated
 * take-home, effective rate, and the mode's modelling assumptions.
 */
export function ResultsSummary({ contractMode, result }: ResultsSummaryProps) {
  const { grossRevenue, lines, totalTax, takeHome, effectiveRate, notes } = result;
  const effectivePct = (effectiveRate * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Contract type
        </span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {MODE_LABELS[contractMode]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Gross revenue
          </span>
          <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatGBP(grossRevenue)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Estimated take-home
          </span>
          <span className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatGBP(takeHome)}
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900/60">
        <ul className="flex flex-col gap-2">
          {lines.map((line) => (
            <li
              key={line.label}
              className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300"
            >
              <span>{line.label}</span>
              <span className="tabular-nums">{formatGBP(line.amount)}</span>
            </li>
          ))}
          <li className="mt-1 flex items-center justify-between border-t border-zinc-200 pt-2 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
            <span>Total tax &amp; NI</span>
            <span className="tabular-nums">{formatGBP(totalTax)}</span>
          </li>
        </ul>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Effective rate {effectivePct}% of gross revenue.
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Assumptions
        </p>
        <ul className="flex flex-col gap-1">
          {notes.map((note) => (
            <li
              key={note}
              className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400"
            >
              • {note}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
          Gross-exposure estimate before other business or company expenses
          (accountancy, equipment, pension, etc.). Not financial advice —
          confirm with your accountant.
        </p>
      </div>
    </div>
  );
}
