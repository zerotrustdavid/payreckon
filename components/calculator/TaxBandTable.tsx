import type { CalculatorResult } from "../../lib/calculations/scenarios";
import { formatGBPExact, formatPercent } from "../../lib/format";

/**
 * Band-by-band working, so the headline number can be checked rather than
 * trusted. This doubles as the table view that keeps the chart accessible.
 */
export function TaxBandTable({ result }: { result: CalculatorResult }) {
  const { incomeTax, dividendTax } = result.personal;

  const sections = [
    { title: "Income tax", rows: incomeTax.bands },
    { title: "Dividend tax", rows: dividendTax.bands },
  ].filter((section) => section.rows.length > 0);

  if (sections.length === 0) {
    return <p className="text-sm text-faint">No tax is due on these figures.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[26rem] text-sm">
        <caption className="sr-only">
          Income falling in each tax band and the tax charged on it
        </caption>
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-faint">
            <th scope="col" className="py-2 pr-4 font-medium">
              Band
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">
              Income
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">
              Rate
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Tax
            </th>
          </tr>
        </thead>
        {sections.map((section) => (
          <tbody key={section.title}>
            <tr>
              <th
                scope="colgroup"
                colSpan={4}
                className="pt-4 pb-1 text-left text-xs font-semibold uppercase tracking-wider text-muted"
              >
                {section.title}
              </th>
            </tr>
            {section.rows.map((band, index) => (
              <tr key={`${section.title}-${band.name}-${index}`} className="border-t border-line">
                <td className="py-2 pr-4 text-muted">{band.name}</td>
                <td className="tnum py-2 pr-4 text-right text-muted">
                  {formatGBPExact(band.amount)}
                </td>
                <td className="tnum py-2 pr-4 text-right text-muted">
                  {formatPercent(band.rate, 2)}
                </td>
                <td className="tnum py-2 text-right text-ink">
                  {formatGBPExact(band.tax)}
                </td>
              </tr>
            ))}
          </tbody>
        ))}
        <tfoot>
          <tr className="border-t border-line-strong">
            <td className="py-2.5 pr-4 font-semibold text-ink">Total</td>
            <td />
            <td />
            <td className="tnum py-2.5 text-right font-semibold text-ink">
              {formatGBPExact(incomeTax.total + dividendTax.total)}
            </td>
          </tr>
        </tfoot>
      </table>

      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <div className="flex justify-between gap-3 rounded-md bg-inset px-3 py-2">
          <dt className="text-faint">Personal allowance used</dt>
          <dd className="tnum text-muted">{formatGBPExact(incomeTax.allowance)}</dd>
        </div>
        <div className="flex justify-between gap-3 rounded-md bg-inset px-3 py-2">
          <dt className="text-faint">Adjusted net income</dt>
          <dd className="tnum text-muted">
            {formatGBPExact(result.personal.adjustedNetIncome)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
