import { useRef } from "react";
import type { ContractMode } from "../../lib/types";

interface ContractTypeOption {
  value: ContractMode;
  label: string;
  description: string;
}

const OPTIONS: ContractTypeOption[] = [
  {
    value: "inside",
    label: "Inside IR35",
    description: "Deemed employment — PAYE income tax + employee NI.",
  },
  {
    value: "outside-sole-trader",
    label: "Outside IR35 — Sole trader",
    description: "Trading profit taxed as income + Class 4 NI.",
  },
  {
    value: "outside-ltd",
    label: "Outside IR35 — Own Ltd company",
    description: "Corporation tax, then low salary + dividends.",
  },
];

interface ContractTypeToggleProps {
  value: ContractMode;
  onChange: (value: ContractMode) => void;
}

/**
 * Radio group for selecting how the contract is taxed. Supports mouse and
 * keyboard: arrow keys move between options (roving tabindex), matching the
 * ARIA radiogroup pattern.
 */
export function ContractTypeToggle({ value, onChange }: ContractTypeToggleProps) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const selectAt = (index: number) => {
    const wrapped = (index + OPTIONS.length) % OPTIONS.length;
    onChange(OPTIONS[wrapped].value);
    buttonsRef.current[wrapped]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        selectAt(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        selectAt(index - 1);
        break;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Contract type"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {OPTIONS.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonsRef.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`flex flex-col gap-1 rounded-lg border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-zinc-100/20 ${
              selected
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600"
            }`}
          >
            <span className="text-sm font-semibold">{option.label}</span>
            <span
              className={`text-xs ${
                selected
                  ? "text-zinc-300 dark:text-zinc-600"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
