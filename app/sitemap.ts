import type { MetadataRoute } from "next";
import { getProCategories, getProProducts, getProducts } from "@/lib/data";
import { productHref } from "@/lib/routes";

import { SITE_URL as BASE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Adres karty zalezy od linii (Dog Store vs Dog Store Pro), wiec mapa strony czyta oba katalogi
  // i sklada adresy tym samym helperem co interfejs. Lista samych slugow nie wystarczy:
  // po slugu nie widac, do ktorego sklepu pozycja nalezy.
  const [shop, pro, categories] = await Promise.all([
    getProducts("collars"),
    getProProducts(),
    getProCategories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/collections/collars`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/pro`, changeFrequency: "monthly", priority: 0.9 },
  ];

  const proRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/pro/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = [...shop, ...pro].map((product) => ({
    url: `${BASE}${productHref(product)}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...proRoutes, ...productRoutes];
}
