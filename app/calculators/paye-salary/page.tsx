import type { Metadata } from "next";
import { PayeCalculator } from "../../../components/calculator/PayeCalculator";

export const metadata: Metadata = {
  title: "PAYE salary calculator",
  description:
    "Work out your take-home pay as a permanent employee on PAYE, including bonus, overtime, benefits in kind, pension contributions and student loan repayments.",
};

export default function PayeSalaryPage() {
  return <PayeCalculator />;
}
