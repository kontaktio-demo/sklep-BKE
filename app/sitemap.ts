import type { MetadataRoute } from "next";
import { getK9Categories, getProductSlugs } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories] = await Promise.all([getProductSlugs(), getK9Categories()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/collections/collars`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/k9`, changeFrequency: "monthly", priority: 0.9 },
  ];

  const k9Routes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/k9/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE}/products/${slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...k9Routes, ...productRoutes];
}
