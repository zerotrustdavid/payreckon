import type { MetadataRoute } from "next";
import { CALCULATORS } from "../lib/calculations/scenarios";
import { GUIDES } from "../lib/content/guides";

const BASE = "https://payreckon.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: BASE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    {
      url: `${BASE}/calculators`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...CALCULATORS.map((calc) => ({
      url: `${BASE}/calculators/${calc.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    {
      url: `${BASE}/guides`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...GUIDES.map((guide) => ({
      url: `${BASE}/guides/${guide.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
