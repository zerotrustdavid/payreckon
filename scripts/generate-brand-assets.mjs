#!/usr/bin/env node
/**
 * Generates every PayReckon brand asset from a single source of truth.
 *
 * Run with `npm run brand`. Everything below is derived geometry and text, so
 * changing a colour or a proportion here regenerates the whole set consistently
 * — no hand-edited binaries to drift out of sync.
 *
 * Output:
 *   public/brand/  downloadable logo files (SVG + high-res PNG)
 *   app/           icon, apple-icon and opengraph-image picked up by Next.js
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND_DIR = join(ROOT, "public", "brand");
const APP_DIR = join(ROOT, "app");

const COLOUR = {
  teal: "#2dd4bf",
  /** Darker teal for use on light backgrounds, where #2dd4bf lacks contrast. */
  tealDeep: "#0d9488",
  /** Near-black with a green cast, used inside the mark. */
  markInk: "#04211f",
  darkBg: "#080b0f",
  white: "#ffffff",
  lightInk: "#0b1220",
  muted: "#93a5b6",
};

const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";

/**
 * The mark: three ascending bars in a rounded square — a pay figure resolving
 * into its parts, and legible down to a 16px favicon.
 *
 * (An earlier version split the tallest bar to echo the stacked breakdown chart.
 * It read as four unrelated bars at small sizes and destroyed the ascending
 * progression, so the bars are kept whole.)
 */
function markSVG({ size = 64, rounded = true } = {}) {
  const bars = [
    { x: 15, y: 36, h: 13 },
    { x: 27.5, y: 26.5, h: 22.5 },
    { x: 40, y: 17, h: 32 },
  ]
    .map(
      (b) =>
        `<rect x="${b.x}" y="${b.y}" width="9" height="${b.h}" rx="4.5" fill="${COLOUR.markInk}"/>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" role="img" aria-label="PayReckon">
<rect width="64" height="64" rx="${rounded ? 15 : 0}" fill="${COLOUR.teal}"/>
${bars}
</svg>`;
}

/** Mark plus wordmark, laid out horizontally. */
function lockupSVG({ width = 340, variant = "dark", withMark = true } = {}) {
  const onDark = variant === "dark";
  const payFill = onDark ? COLOUR.white : COLOUR.lightInk;
  const reckonFill = onDark ? COLOUR.teal : COLOUR.tealDeep;

  const VB_W = withMark ? 340 : 258;
  const VB_H = 64;
  const height = Math.round((width / VB_W) * VB_H);
  const textX = withMark ? 82 : 0;

  const mark = withMark
    ? `<g>${markSVG({ size: 64 })
        .replace(/<svg[^>]*>/, "")
        .replace("</svg>", "")}</g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${VB_W} ${VB_H}" role="img" aria-label="PayReckon">
${mark}
<text x="${textX}" y="45" font-family="${FONT}" font-size="44" font-weight="700" letter-spacing="-1.2" fill="${payFill}">Pay<tspan fill="${reckonFill}">Reckon</tspan></text>
</svg>`;
}

/** Social sharing card. */
function ogImageSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${COLOUR.darkBg}"/>
<rect x="0" y="0" width="1200" height="4" fill="${COLOUR.teal}"/>
<g transform="translate(96, 150) scale(1.5)">${markSVG({ size: 64 })
    .replace(/<svg[^>]*>/, "")
    .replace("</svg>", "")}</g>
<text x="96" y="330" font-family="${FONT}" font-size="72" font-weight="700" letter-spacing="-2" fill="${COLOUR.white}">Work out what you</text>
<text x="96" y="410" font-family="${FONT}" font-size="72" font-weight="700" letter-spacing="-2" fill="${COLOUR.white}">actually keep</text>
<text x="96" y="480" font-family="${FONT}" font-size="30" font-weight="400" fill="${COLOUR.muted}">Inside IR35 · Outside IR35 · PAYE salary — UK take-home calculators</text>
<text x="96" y="560" font-family="${FONT}" font-size="28" font-weight="700" letter-spacing="-0.5" fill="${COLOUR.white}">Pay<tspan fill="${COLOUR.teal}">Reckon</tspan></text>
<text x="280" y="560" font-family="${FONT}" font-size="28" font-weight="400" fill="${COLOUR.muted}">payreckon.co.uk</text>
</svg>`;
}

const render = (svg, out, { trim = false } = {}) => {
  let pipeline = sharp(Buffer.from(svg));
  if (trim) pipeline = pipeline.trim({ threshold: 0 });
  return pipeline.png({ compressionLevel: 9 }).toFile(out);
};

async function main() {
  await mkdir(BRAND_DIR, { recursive: true });

  const written = [];
  const note = (p) => written.push(p.replace(`${ROOT}/`, ""));

  // ---- Vector sources -------------------------------------------------------
  const files = {
    "payreckon-mark.svg": markSVG({ size: 512 }),
    "payreckon-mark-square.svg": markSVG({ size: 512, rounded: false }),
    "payreckon-logo-dark.svg": lockupSVG({ width: 680, variant: "dark" }),
    "payreckon-logo-light.svg": lockupSVG({ width: 680, variant: "light" }),
    "payreckon-wordmark-dark.svg": lockupSVG({
      width: 516,
      variant: "dark",
      withMark: false,
    }),
    "payreckon-wordmark-light.svg": lockupSVG({
      width: 516,
      variant: "light",
      withMark: false,
    }),
  };
  for (const [name, svg] of Object.entries(files)) {
    const out = join(BRAND_DIR, name);
    await writeFile(out, svg, "utf8");
    note(out);
  }

  // ---- Mark PNGs (transparent, square) --------------------------------------
  for (const size of [256, 512, 1024, 2048]) {
    const out = join(BRAND_DIR, `payreckon-mark-${size}.png`);
    await render(markSVG({ size }), out);
    note(out);
  }

  // ---- Lockup and wordmark PNGs --------------------------------------------
  for (const variant of ["dark", "light"]) {
    for (const width of [1024, 2048, 4096]) {
      const out = join(BRAND_DIR, `payreckon-logo-${variant}-${width}.png`);
      await render(lockupSVG({ width, variant }), out, { trim: true });
      note(out);
    }
    const wordmarkOut = join(BRAND_DIR, `payreckon-wordmark-${variant}-2048.png`);
    await render(
      lockupSVG({ width: 2048, variant, withMark: false }),
      wordmarkOut,
      { trim: true },
    );
    note(wordmarkOut);
  }

  // ---- Next.js app icons ----------------------------------------------------
  await render(markSVG({ size: 512 }), join(APP_DIR, "icon.png"));
  note(join(APP_DIR, "icon.png"));

  // Apple touch icons are composited onto a solid tile, so render without the
  // corner radius and let iOS apply its own mask.
  await render(markSVG({ size: 180, rounded: false }), join(APP_DIR, "apple-icon.png"));
  note(join(APP_DIR, "apple-icon.png"));

  await render(ogImageSVG(), join(APP_DIR, "opengraph-image.png"));
  note(join(APP_DIR, "opengraph-image.png"));

  // Reuse the social card for Twitter, which expects its own file name.
  await render(ogImageSVG(), join(APP_DIR, "twitter-image.png"));
  note(join(APP_DIR, "twitter-image.png"));

  console.log(`Generated ${written.length} brand assets:`);
  for (const path of written) console.log(`  ${path}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
