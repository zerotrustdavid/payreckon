import type { ContractMode, ScenarioResult } from "../../types";
import { insideIR35 } from "./insideIR35";
import { outsideSoleTrader } from "./outsideSoleTrader";
import { DEFAULT_DIRECTOR_SALARY, outsideLtd } from "./outsideLtd";

export { DEFAULT_DIRECTOR_SALARY, insideIR35, outsideSoleTrader, outsideLtd };

/** Options that only apply to specific scenarios. */
export interface ScenarioOptions {
  /** Director salary for the Outside-Ltd mode (defaults to the personal allowance). */
  ltdSalary?: number;
}

/**
 * Runs the tax scenario for the selected contract mode against a gross revenue.
 */
export function calculateScenario(
  mode: ContractMode,
  grossRevenue: number,
  options: ScenarioOptions = {},
): ScenarioResult {
  switch (mode) {
    case "inside":
      return insideIR35(grossRevenue);
    case "outside-sole-trader":
      return outsideSoleTrader(grossRevenue);
    case "outside-ltd":
      return outsideLtd(grossRevenue, options.ltdSalary ?? DEFAULT_DIRECTOR_SALARY);
  }
}
