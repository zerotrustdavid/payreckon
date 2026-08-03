# Changelog

All notable changes to this project are documented in this file.
This project follows [Semantic Versioning](https://semver.org/).

## [2.1.1] - 2026-08-03

### Fixed
- The gold accent failed WCAG AA as text: at 2.3:1 on cream it was being used
  for eyebrows, links, the "Reckon" wordmark and field hints. The accent token
  is now the deep gold (4.6:1), with the brand gold kept as a separate
  `--pr-accent-bright` token reserved for the logo tile and other large shapes.
  `--pr-faint` was likewise darkened from 2.7:1 to 4.7:1.

### Added
- A brand kit zip of every logo file, built by `npm run brand` and offered as a
  single "Download everything" button on /brand.

### Changed
- The bundled `public/brand/README.md` still documented the old teal palette;
  it now documents the gold system and the rule separating the two golds.

## [2.1.0] - 2026-08-03

Re-themed to match the Invision Solutions brand system: a warm cream base with
a gold accent, replacing the original dark teal theme.

### Changed
- Design tokens rebuilt around a cream/white surface stack, near-black ink and
  a gold accent (`#c9a227`, deep gold `#8a6d1a` for light-background contrast)
  in place of the dark teal palette.
- Headline typography now uses Space Grotesk alongside Geist Sans for body
  and UI text; section eyebrows moved to a tracked monospace treatment.
- Primary buttons and the segmented control's selected state changed from a
  filled accent pill to a solid ink pill with cream text, matching the
  reference site's button convention; gold stays reserved for text accents,
  links and tags.
- The composition chart's eight-colour categorical palette was retuned for
  contrast on a white surface (it was previously validated only for the dark
  theme) and no longer overlaps the gold accent hue.
- Semantic positive/warning/danger colours darkened for legibility on a light
  background.
- All logo, icon, favicon, Open Graph and Twitter card assets regenerated
  from `scripts/generate-brand-assets.mjs` with the new palette.

## [2.0.0] - 2026-08-02

Renamed to **PayReckon** and rebuilt from a single-page IR35 dashboard into a
multi-page calculator site. This is a breaking rewrite of both the calculation
layer and the UI.

### Added
- **Three calculators**: Inside IR35 via an umbrella company, Outside IR35 via a
  limited company, and PAYE salary for permanent employment.
- **Three tax years** — 2024/25, 2025/26 and 2026/27 — each self-contained and
  verified against gov.uk/gov.scot with sources cited inline, selectable per
  calculation.
- **Scottish income tax** bands, alongside rest-of-UK.
- **Shared personal tax engine** used by all three calculators, covering income
  tax, National Insurance, dividend tax and student loans.
- Tax code parsing (numeric, K, BR/D0/D1/D2, NT, S/C prefixes), NI category
  letters A/B/C/H/J/M/V/Z, student loan plans 1/2/4/5 and postgraduate
  (chargeable together), three pension methods, Blind Person's and Marriage
  Allowance, benefits in kind, expenses, Employment Allowance, joint ownership
  and Business Asset Disposal Relief.
- Results as a collapsible breakdown, a composition chart, and a band-by-band
  tax table, viewable per year, month, week, day or hour.
- Guides on IR35, umbrella companies and limited companies.
- Site shell, PayReckon visual identity, sitemap and robots.

### Changed
- Calculations take a rates object rather than importing a single tax year, so
  changing year re-runs identical maths against a different rate set.
- Income tax uses a unified band model over taxable income, covering UK and
  Scottish bands and returning a per-band breakdown.
- Test suite grown from 40 to 138, including an exact round-trip on the umbrella
  solver and "no money unaccounted for" invariants per scenario per year.

### Removed
- The v1 single-page dashboard and its sole-trader scenario, which is outside
  the scope of the three arrangements this site compares.

### Fixed
- Employer's NI, the Apprenticeship Levy and employer pension in umbrella
  working are now solved algebraically against the assignment rate rather than
  approximated — the figures reconcile to the penny.
- Mobile horizontal overflow caused by grid children defaulting to
  `min-width: auto`.

## [1.0.0] - 2026-07-15

First public release — the v1 feature set is complete and deployed to Vercel.

### Added
- Keyboard navigation for the contract-type toggle (arrow keys, roving tabindex)
  following the ARIA radiogroup pattern.
- Footer with the tax-year scope (2026/27, England/Wales/NI) and "not financial
  advice" disclaimer.
- Full README: features, tax-rate sourcing, dev instructions, disclaimer.

### Changed
- Responsive pass confirmed across mobile and desktop.

## [0.4.0] - 2026-07-15

### Added
- HMRC tax-owed estimate for all three contract modes, verified against gov.uk
  2026/27 rates (cited in `lib/constants/tax-rates-2026-27.ts`):
  - Inside IR35 — income tax (PAYE) + Class 1 employee NI.
  - Outside IR35 (sole trader) — income tax + Class 4 NI.
  - Outside IR35 (own Ltd) — corporation tax (marginal relief) → dividends,
    plus income tax / NI on an adjustable director salary (default £12,570).
- Scenario orchestrators + dispatcher (`lib/calculations/scenarios/`) with
  8 scenario tests; 40 tests total.
- Results breakdown UI: itemised tax/NI, total exposure, estimated take-home,
  effective rate, and per-mode assumptions, labelled as a gross-exposure
  estimate before other expenses.
- Ltd-only director salary input.

### Note
- Dividend ordinary/upper rates rose 2 percentage points from 6 April 2026
  (Budget 2025), which narrows the Ltd route's advantage at typical day rates —
  the dashboard reflects this.

## [0.3.0] - 2026-07-15

### Added
- Contract-type toggle with three modes: Inside IR35, Outside IR35 (sole
  trader), and Outside IR35 (own Ltd company). Accessible radio group.
- Selected contract type is lifted into page state and surfaced in the results
  summary, ready to drive the per-mode tax estimate in the next milestone.

## [0.2.0] - 2026-07-15

### Added
- Day-rate to income calculator: day rate × working days/week × working weeks/year
  → gross annual revenue, updating live as inputs change.
- Pure `grossAnnualRevenue` calculation with unit tests (zero, fractional,
  negative, and non-finite input handling).
- Reusable `NumberField` and `Card` UI primitives; GBP formatting helper.

## [0.1.0] - 2026-07-15

### Added
- Project scaffold: Next.js (App Router) + TypeScript + Tailwind CSS.
- Vitest + React Testing Library for unit tests.
- Planned folder structure for calculator components and tax calculation logic.
