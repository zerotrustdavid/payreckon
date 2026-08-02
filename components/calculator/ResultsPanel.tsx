"use client";

import { useState } from "react";
import type { DisplayPeriod, WorkingPattern } from "../../lib/calculations/annualise";
import { perPeriod } from "../../lib/calculations/annualise";
import type { CalculatorResult } from "../../lib/calculations/scenarios";
import { formatGBP, formatPercent } from "../../lib/format";
import { SegmentedControl } from "../ui/SegmentedControl";
import { BreakdownChart, type ChartSegment } from "./BreakdownChart";
import { BreakdownRows } from "./BreakdownRows";
import { TaxBandTable } from "./TaxBandTable";

const PERIODS = [
  { value: "year", label: "Year" },
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
  { value: "hour", label: "Hour" },
] as const;

const VIEWS = [
  { value: "breakdown", label: "Breakdown" },
  { value: "chart", label: "Chart" },
  { value: "bands", label: "Tax bands" },
] as const;

type View = (typeof VIEWS)[number]["value"];

interface ResultsPanelProps {
  result: CalculatorResult;
  pattern: WorkingPattern;
  /** Segments for the composition chart, in fixed entity order. */
  chartSegments: ChartSegment[];
}

export function ResultsPanel({ result, pattern, chartSegments }: ResultsPanelProps) {
  const [period, setPeriod] = useState<DisplayPeriod>("year");
  const [view, setView] = useState<View>("breakdown");

  const convert = (annual: number) => perPeriod(annual, period, pattern);
  const periodLabel = period === "year" ? "a year" : `a ${period}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight text-ink">Results</h2>
          <SegmentedControl
            ariaLabel="Show results per"
            value={period}
            segments={PERIODS}
            onChange={(v) => setPeriod(v as DisplayPeriod)}
            size="sm"
          />
        </div>

        <div className="grid gap-4 border-b border-line px-5 py-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-faint">
              Take home
            </p>
            <p className="tnum mt-1 text-2xl font-semibold text-positive">
              {formatGBP(convert(result.takeHome))}
            </p>
            <p className="mt-0.5 text-xs text-faint">per {periodLabel.replace("a ", "")}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-faint">
              Total capital
            </p>
            <p className="tnum mt-1 text-2xl font-semibold text-ink">
              {formatGBP(convert(result.totalCapital))}
            </p>
            <p className="mt-0.5 text-xs text-faint">incl. pension</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-faint">
              Total tax &amp; NI
            </p>
            <p className="tnum mt-1 text-2xl font-semibold text-ink">
              {formatGBP(convert(result.totalTax))}
            </p>
            <p className="mt-0.5 text-xs text-faint">
              {formatPercent(result.effectiveRate)} effective
            </p>
          </div>
        </div>

        <div className="px-5 py-4">
          <SegmentedControl
            ariaLabel="Result view"
            value={view}
            segments={VIEWS}
            onChange={(v) => setView(v as View)}
            size="sm"
            full
          />

          <div className="mt-4">
            {view === "breakdown" && (
              <BreakdownRows lines={result.lines} convert={convert} />
            )}
            {view === "chart" && (
              <BreakdownChart
                segments={chartSegments.map((s) => ({
                  ...s,
                  value: convert(s.value),
                }))}
                total={convert(result.grossInput)}
                caption="Where each pound goes"
              />
            )}
            {view === "bands" && <TaxBandTable result={result} />}
          </div>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/5 px-4 py-3">
          <ul className="flex flex-col gap-1.5">
            {result.warnings.map((warning) => (
              <li key={warning} className="text-sm leading-relaxed text-warning">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.notes.length > 0 && (
        <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">
            Assumptions
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {result.notes.map((note) => (
              <li key={note} className="text-xs leading-relaxed text-muted">
                • {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
