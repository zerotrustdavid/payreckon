#!/usr/bin/env node
/**
 * Checks every colour in the theme against the surface it actually renders on.
 *
 * Run with `npm run palette`. The theme is dark, which makes it easy to pick
 * tones that look right in isolation and then fail badly for anyone with low
 * vision — so nothing here is judged by eye. Text is held to WCAG AA (4.5:1,
 * or 3:1 where it is large), and chart fills to the 3:1 required of
 * non-text UI, with a further check that no two chart slots collapse into
 * each other under the common forms of colour-vision deficiency.
 *
 * Exits non-zero on any failure, so this can gate a change to the palette.
 */

// ---- colour maths ---------------------------------------------------------

const srgbToLinear = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const parse = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const luminance = (hex) => {
  const [r, g, b] = parse(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Rough CIE76 ΔE in Lab, good enough to catch two fills reading as one. */
const toLab = (hex) => {
  let [r, g, b] = parse(hex).map(srgbToLinear);
  // sRGB -> XYZ (D65)
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
};

const deltaE = (a, b) => {
  const [l1, a1, b1] = toLab(a);
  const [l2, a2, b2] = toLab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};

/**
 * Brettel-style approximation of dichromatic vision, applied in linear light.
 * Not clinically exact, but it reliably surfaces pairs that merge.
 */
const simulate = (hex, kind) => {
  const [r, g, b] = parse(hex).map(srgbToLinear);
  const matrices = {
    protanopia: [0.152, 1.053, -0.205, 0.115, 0.786, 0.099, -0.004, -0.048, 1.052],
    deuteranopia: [0.367, 0.861, -0.228, 0.28, 0.673, 0.047, -0.012, 0.043, 0.969],
    tritanopia: [1.256, -0.077, -0.179, -0.078, 0.931, 0.148, 0.005, 0.691, 0.304],
  };
  const m = matrices[kind];
  const out = [
    m[0] * r + m[1] * g + m[2] * b,
    m[3] * r + m[4] * g + m[5] * b,
    m[6] * r + m[7] * g + m[8] * b,
  ];
  const toHex = (v) => {
    const c = Math.max(0, Math.min(1, v));
    const s = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(s * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${out.map(toHex).join("")}`;
};

// ---- the palette under test ----------------------------------------------
// Keep in step with the tokens in app/globals.css.

const BG = "#22262c";
const SURFACE = "#2a2f36";
const SURFACE_2 = "#333942";
const INSET = "#1c2026";

const TEXT_ON = {
  "text        ": ["#eef1f5", [BG, SURFACE, SURFACE_2, INSET]],
  "muted       ": ["#b6bfca", [BG, SURFACE, SURFACE_2, INSET]],
  "faint       ": ["#a0aab6", [BG, SURFACE, SURFACE_2, INSET]],
  "accent      ": ["#7fb2ff", [BG, SURFACE, SURFACE_2, INSET]],
  "accent-strong": ["#a3c8ff", [BG, SURFACE]],
  "positive    ": ["#5fd39a", [BG, SURFACE]],
  "warning     ": ["#f0b64d", [BG, SURFACE]],
  "danger      ": ["#ff8f8f", [BG, SURFACE]],
};

/** Dark text sitting on a filled accent button. */
const ON_ACCENT = ["#101418", "#7fb2ff"];

/**
 * Non-text UI. WCAG 1.4.11 asks 3:1 of anything needed to identify a control
 * or its state, which covers the focus ring and the stronger border used on
 * input hover. A plain divider between two cards conveys nothing that is not
 * already obvious from layout, so it only has to be perceivable — holding it
 * to 3:1 would mean hard bright lines all over a dark surface.
 */
const UI_MEANINGFUL = {
  "focus ring / accent": ["#7fb2ff", [BG, SURFACE, INSET]],
  "border-strong      ": ["#747e8b", [BG, SURFACE, INSET]],
};

const UI_DECORATIVE = {
  "border (divider)": ["#3d444e", [BG, SURFACE]],
};

/**
 * Categorical chart palette. Chosen by searching a candidate pool for the set
 * with the widest worst-case separation, then ordered so the entity mapping
 * below reads sensibly — take-home is green, matching the positive colour the
 * headline figure is already set in.
 */
const CHART = [
  "#4fc48a", // take home
  "#f0885d", // income tax
  "#ffd166", // national insurance
  "#c3ccd8", // employment costs / other
  "#ef7fae", // corporation tax
  "#8f76d4", // dividend tax
  "#2f9d69", // student loan
  "#6ea8fe", // pension
];

// ---- checks ---------------------------------------------------------------

let failures = 0;
const pass = (ok) => (ok ? "ok  " : (failures++, "FAIL"));

console.log("Text — needs 4.5:1\n");
for (const [name, [hex, backgrounds]] of Object.entries(TEXT_ON)) {
  const results = backgrounds.map((bg) => {
    const ratio = contrast(hex, bg);
    return `${bg} ${ratio.toFixed(2).padStart(5)} ${pass(ratio >= 4.5)}`;
  });
  console.log(`  ${name} ${hex}   ${results.join("   ")}`);
}

console.log("\nDark text on the accent button — needs 4.5:1\n");
{
  const ratio = contrast(...ON_ACCENT);
  console.log(
    `  ${ON_ACCENT[0]} on ${ON_ACCENT[1]}   ${ratio.toFixed(2)} ${pass(ratio >= 4.5)}`,
  );
}

console.log("\nUI that carries meaning — needs 3:1\n");
for (const [name, [hex, backgrounds]] of Object.entries(UI_MEANINGFUL)) {
  const results = backgrounds.map((bg) => {
    const ratio = contrast(hex, bg);
    return `${bg} ${ratio.toFixed(2).padStart(5)} ${pass(ratio >= 3)}`;
  });
  console.log(`  ${name} ${hex}   ${results.join("   ")}`);
}

console.log("\nDecorative dividers — only need to be perceivable (1.2:1)\n");
for (const [name, [hex, backgrounds]] of Object.entries(UI_DECORATIVE)) {
  const results = backgrounds.map((bg) => {
    const ratio = contrast(hex, bg);
    return `${bg} ${ratio.toFixed(2).padStart(5)} ${pass(ratio >= 1.2)}`;
  });
  console.log(`  ${name} ${hex}   ${results.join("   ")}`);
}

console.log("\nChart fills on the panel surface — needs 3:1\n");
CHART.forEach((hex, i) => {
  const ratio = contrast(hex, SURFACE);
  console.log(`  slot ${i} ${hex}   ${ratio.toFixed(2).padStart(5)} ${pass(ratio >= 3)}`);
});

console.log("\nChart fills kept apart, including under CVD — needs ΔE >= 8\n");
{
  let worst = { d: Infinity, pair: "", kind: "" };
  for (let i = 0; i < CHART.length; i++) {
    for (let j = i + 1; j < CHART.length; j++) {
      for (const kind of ["normal", "protanopia", "deuteranopia", "tritanopia"]) {
        const a = kind === "normal" ? CHART[i] : simulate(CHART[i], kind);
        const b = kind === "normal" ? CHART[j] : simulate(CHART[j], kind);
        const d = deltaE(a, b);
        if (d < worst.d) worst = { d, pair: `${CHART[i]} / ${CHART[j]}`, kind };
      }
    }
  }
  console.log(
    `  worst pair ${worst.pair} under ${worst.kind}: ΔE ${worst.d.toFixed(1)} ${pass(worst.d >= 8)}`,
  );
}

console.log(
  failures === 0
    ? "\nAll checks passed.\n"
    : `\n${failures} check(s) failed.\n`,
);
process.exit(failures === 0 ? 0 : 1);
