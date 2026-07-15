# IR35 Contractor Dashboard

A web dashboard for UK contractors to model income, contract type, and estimated
tax exposure before running the numbers past an accountant.

> **Not financial advice.** These are gross-exposure estimates before business or
> company expenses (accountancy, equipment, pension, etc.). Always confirm with a
> qualified accountant.

## Features

- **Day-rate → income** — day rate × working days/week × working weeks/year =
  gross annual revenue.
- **Contract type** — compare three tax treatments side by side:
  - **Inside IR35** — deemed employment: income tax (PAYE) + Class 1 employee NI.
  - **Outside IR35, sole trader** — income tax + Class 4 NI on profit.
  - **Outside IR35, own Ltd company** — corporation tax (with marginal relief),
    then a low director salary + dividends. The salary is adjustable (default
    £12,570).
- **Tax estimate** — an itemised breakdown, total tax & NI, estimated take-home,
  and the effective rate, updating live as inputs change.

## Tax rates

Rates are for the **2026/27 UK tax year** (England, Wales & Northern Ireland;
Scotland sets its own income tax bands and is not modelled). Every figure is
verified against gov.uk and cited inline in
[`lib/constants/tax-rates-2026-27.ts`](lib/constants/tax-rates-2026-27.ts).

Rates change every tax year (and sometimes mid-year via Budget). When they do,
add a new `tax-rates-YYYY-YY.ts` file rather than editing historical years in
place, so past years stay inspectable.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Vitest for unit tests
- Deployed on Vercel

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # run the unit tests (tax calculations)
npm run build    # production build
npm run lint     # eslint
```

The tax logic lives in [`lib/calculations/`](lib/calculations/) as pure,
unit-tested functions: shared primitives (income tax, NI, corporation tax,
dividend tax) composed by per-mode scenarios in
[`lib/calculations/scenarios/`](lib/calculations/scenarios/).

## Versioning

Semantic versioning; changes are recorded in [CHANGELOG.md](CHANGELOG.md).
