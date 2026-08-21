# PayReckon

UK take-home pay calculators for contractors and employees. Compare being caught
by IR35 through an umbrella company, working outside IR35 through your own
limited company, and permanent employment on PAYE — with the same tax engine
behind all three, so the comparison is genuinely like for like.

> **Not financial advice.** PayReckon produces estimates for planning purposes.
> Always confirm your position with a qualified accountant before acting on it.

This repository is public so the engineering behind it can be read and
evaluated. It is not licensed for reuse: see [LICENSE.md](LICENSE.md).

## Calculators

| Calculator | Models |
|---|---|
| **Inside IR35** (umbrella) | Assignment rate, umbrella margin, employer's NI, Apprenticeship Levy, employer pension, rolled-up vs accrued holiday pay |
| **Outside IR35** (limited company) | Corporation tax with marginal relief, salary strategy, dividends, expenses, Employment Allowance, joint ownership, Business Asset Disposal Relief |
| **Salary** (PAYE) | Bonus, overtime, cash allowances, benefits in kind, pension contributions |

All three support **2024/25, 2025/26 and 2026/27**, rest-of-UK and Scottish
income tax, tax codes, NI category letters, student loan plans 1/2/4/5 and
postgraduate, three pension methods, Blind Person's and Marriage Allowance.

## What makes the numbers trustworthy

**The umbrella calculation is solved, not estimated.** Employer's NI, the
Apprenticeship Levy and employer pension are deducted from the assignment rate
but charged on the gross pay that remains, so each one depends on the others.
That circular dependency is solved exactly rather than approximated, and the
figures reconcile to the penny against the assignment rate they came from.

**One tax engine, three calculators.**
[`personalTax.ts`](lib/calculations/personalTax.ts) handles income tax, National
Insurance, dividend tax and student loans for all three, so identical taxable
income is taxed identically regardless of which arrangement produced it. The
calculators differ only where the tax treatment genuinely does.

**Every rate is cited.** Figures come from gov.uk and gov.scot with the source
URL in a comment beside the number — see
[`lib/constants/`](lib/constants/). Rates are never edited in place when a new
year arrives; a new `tax-rates-YYYY-YY.ts` is added, so historical calculations
stay reproducible.

**Details that are usually glossed over are modelled properly.** Benefits in
kind raise taxable income without raising take-home and carry Class 1A employer
NI rather than employee NI. Relief-at-source pensions extend the basic-rate band
instead of reducing taxable pay. Scottish taxpayers pay Scottish rates on earned
income but UK rates on dividends. Employment Allowance is refused to
sole-director companies. Plan 5 student loans are flagged as not repayable
before 2026/27 rather than silently charging nothing.

## Tech

Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel. Charts are
hand-built with no charting dependency.

The theme is a charcoal base with a blue accent, and none of it is judged by
eye: `npm run palette` holds every text colour to WCAG AA against each surface
it actually renders on, checks that anything conveying state clears 3:1, and
verifies that no two chart fills collapse into each other under protanopia,
deuteranopia or tritanopia. It exits non-zero on failure, so a palette change
that breaks contrast cannot land quietly.

## Development

```bash
npm install
cp .env.example .env.local   # then fill in the Web3Forms key (see below)
npm run dev      # http://localhost:3000
npm test         # 155 unit tests covering the tax engine
npm run build    # production build
npm run lint     # eslint
npm run brand    # regenerate every logo asset and the brand kit zip
npm run palette  # check theme contrast and chart colour separation
```

### Environment

The feedback form at `/feedback` posts to [Web3Forms](https://web3forms.com), so
the site stays fully static with no server or database.
`NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` must be set locally and in Vercel (Production,
Preview and Development) — see [`.env.example`](.env.example). Without it the
page still renders and validates, but submitting reports that the form is not
configured rather than silently dropping the message. Everything else in the
site runs with no configuration at all.

The calculation layer lives in [`lib/calculations/`](lib/calculations/) as pure,
unit-tested functions — shared primitives composed by per-arrangement scenarios
in [`lib/calculations/scenarios/`](lib/calculations/scenarios/). No UI code is
involved in any calculation, so the engine can be tested and reused
independently.

## Versioning

Semantic versioning; changes are recorded in [CHANGELOG.md](CHANGELOG.md).
