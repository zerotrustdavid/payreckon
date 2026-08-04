# PayReckon brand assets

Every file here is generated from `scripts/generate-brand-assets.mjs`. Run
`npm run brand` to regenerate the whole set after changing the geometry or
colours — don't hand-edit the images, or they'll drift out of sync with each
other and with the logo component in `components/layout/Logo.tsx`.

A browsable version with previews and download buttons lives at `/brand`.

## What to use where

| Use | File |
|---|---|
| The site itself, dark UI, dark slides, photography | `payreckon-logo-dark.svg` |
| Documents, invoices, anything on white | `payreckon-logo-light.svg` |
| Favicon, app icon, social avatar | `payreckon-mark.svg` or `payreckon-mark-512.png` |
| Platforms that apply their own corner mask | `payreckon-mark-square.svg` |
| Print, large format | `payreckon-logo-*-4096.png` |
| Letterhead or email signature beside an existing icon | `payreckon-wordmark-*` |

Prefer SVG wherever it's accepted — it stays sharp at any size. The PNGs are
transparent, so they sit on any background of the matching tone.

## Colours

| Name | Hex | Use |
|---|---|---|
| Blue | `#7FB2FF` | The brand blue. Fills the logo tile, and sets type on dark backgrounds |
| Deep blue | `#2563EB` | Blue type on light backgrounds |
| Charcoal | `#22262C` | Page background |
| Panel | `#2A2F36` | Cards and panels |
| Ink | `#101418` | The bars inside the icon |
| Text | `#EEF1F5` | Body text on charcoal |

Match the blue to the background. `#7FB2FF` is the brand colour and is pitched
for the charcoal UI, where it reads at 7:1, but on white it drops to 2.2:1 and
fails accessible-contrast minimums for text. On a light background, set type in
`#2563EB`, which clears them at 5.2:1. The tile itself keeps the brand blue
either way — a logo is exempt from those minimums, and consistency matters more.

## Rules

- Leave clear space around the logo of at least the height of the icon.
- Match the variant to the background — light logo on light, dark on dark.
- Don't stretch, recolour, rotate or add effects.
- Below roughly 24px, drop the wordmark and use the icon alone.

## A note on the wordmark

The icon is pure geometry, so it renders identically everywhere.

The wordmark is set in Helvetica Neue. In the **PNG** files the letterforms are
already rasterised, so they look the same on any machine. The **SVG** wordmark
files reference the font by name, so a viewer without Helvetica Neue will
substitute something close but not identical — use the PNGs when exact
reproduction matters, or on a machine without that font.

If you later register the wordmark as a trademark, it's worth commissioning a
custom-drawn wordmark (or confirming licensing for the typeface), which is the
normal step at that point. Nothing here blocks commercial use of the artwork
today.
