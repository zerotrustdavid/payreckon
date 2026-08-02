import type { Metadata } from "next";
import { UmbrellaCalculator } from "../../../components/calculator/UmbrellaCalculator";

export const metadata: Metadata = {
  title: "Inside IR35 calculator (umbrella company)",
  description:
    "Work out your take-home pay inside IR35 through an umbrella company. Employer's NI, Apprenticeship Levy, umbrella margin and holiday pay solved exactly against your assignment rate.",
};

export default function InsideIR35Page() {
  return <UmbrellaCalculator />;
}
