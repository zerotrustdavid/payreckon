# PayReckon brand assets

Every file here is generated from `scripts/generate-brand-assets.mjs`. Run
`npm run brand` to regenerate the whole set after changing the geometry or
colours — don't hand-edit the images, or they'll drift out of sync with each
other and with the logo component in `components/layout/Logo.tsx`.

A browsable version with previews and download buttons lives at `/brand`.

## What to use where

| Use | File |
|---|---|
| Website header, dark UI | `payreckon-logo-dark.svg` |
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
| Teal | `#2DD4BF` | Primary accent, on dark backgrounds |
| Deep teal | `#0D9488` | Accent on light backgrounds (the lighter teal fails contrast on white) |
| Mark ink | `#04211F` | The bars inside the icon |
| Ink | `#080B0F` | Page background |
| Surface | `#10161E` | Panels and cards |
| Text | `#E8EEF4` | Body text on dark |

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
