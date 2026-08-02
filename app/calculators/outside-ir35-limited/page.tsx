import type { Metadata } from "next";
import { LimitedCompanyCalculator } from "../../../components/calculator/LimitedCompanyCalculator";

export const metadata: Metadata = {
  title: "Outside IR35 calculator (limited company)",
  description:
    "Work out your take-home pay outside IR35 through your own limited company, including corporation tax with marginal relief, salary and dividend extraction, expenses and Business Asset Disposal Relief.",
};

export default function OutsideIR35Page() {
  return <LimitedCompanyCalculator />;
}
