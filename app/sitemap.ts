import type { MetadataRoute } from "next";
import { getK9Categories, getK9Products, getProducts } from "@/lib/data";
import { productHref } from "@/lib/routes";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Adres karty zalezy od linii (sklep vs K9), wiec mapa strony czyta oba katalogi
  // i sklada adresy tym samym helperem co interfejs. Lista samych slugow nie wystarczy:
  // po slugu nie widac, do ktorego sklepu pozycja nalezy.
  const [shop, k9, categories] = await Promise.all([
    getProducts("collars"),
    getK9Products(),
    getK9Categories(),
  ]);

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

  const productRoutes: MetadataRoute.Sitemap = [...shop, ...k9].map((product) => ({
    url: `${BASE}${productHref(product)}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...k9Routes, ...productRoutes];
}
