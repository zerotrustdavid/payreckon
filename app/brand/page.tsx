import type { Metadata } from "next";
import Image from "next/image";
import { BRAND_COLOURS, BRAND_GROUPS } from "../../lib/content/brandAssets";

export const metadata: Metadata = {
  title: "Brand assets",
  description:
    "Download the PayReckon logo, icon and wordmark as SVG and high-resolution PNG, with the brand colour palette.",
};

export default function BrandPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Brand assets
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Every PayReckon logo file, ready to download. SVG scales to any size
          without losing quality — use it wherever it is accepted. The PNGs are
          transparent and go up to 4096px for print and large displays.
        </p>
        <a
          href="/payreckon-brand-kit.zip"
          download
          className="mt-6 inline-block rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-strong"
        >
          Download everything (.zip)
        </a>
      </header>

      <div className="mt-12 flex flex-col gap-12">
        {BRAND_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {group.title}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
              {group.description}
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.assets.map((asset) => (
                <div
                  key={asset.file}
                  className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface"
                >
                  <div
                    className={`flex h-32 items-center justify-center p-6 ${
                      asset.preview === "dark" ? "bg-inset" : "bg-[#f4f6f9]"
                    }`}
                  >
                    <Image
                      src={`/brand/${asset.file}`}
                      alt={`PayReckon ${asset.label}`}
                      width={200}
                      height={64}
                      className="max-h-full w-auto object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 border-t border-line p-4">
                    <p className="text-sm font-medium text-ink">{asset.label}</p>
                    <p className="text-xs text-faint">{asset.detail}</p>
                    <a
                      href={`/brand/${asset.file}`}
                      download
                      className="mt-3 inline-block w-fit rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:border-accent"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-xl font-semibold tracking-tight text-ink">Colours</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
            The blue changes with the background. The brand blue is pitched for
            the charcoal UI and only manages 2.2:1 on white, so anything set in
            blue on a light background steps down to the deep blue instead.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BRAND_COLOURS.map((colour) => (
              <div
                key={colour.hex}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
              >
                <span
                  aria-hidden="true"
                  className="h-10 w-10 shrink-0 rounded-lg border border-line"
                  style={{ background: colour.hex }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {colour.name}{" "}
                    <span className="tnum font-normal text-faint">{colour.hex}</span>
                  </p>
                  <p className="text-xs leading-snug text-muted">{colour.use}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-base font-semibold text-ink">Using the logo</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {[
              "Leave clear space around the logo of at least the height of the icon.",
              "Use the light version on light backgrounds and the dark version on dark ones — do not place the dark version on a busy photograph.",
              "Do not stretch, recolour, rotate, or add effects to the logo.",
              "Below about 24px, use the icon on its own rather than the full logo.",
              "Match the blue to the background: the brand blue is built for the dark UI, and blue type on a light background uses the deep blue instead.",
            ].map((rule) => (
              <li key={rule} className="text-sm leading-relaxed text-muted">
                • {rule}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
