import type { MetadataRoute } from "next";
import { getProCategories, getProProducts, getProducts } from "@/lib/data";
import { productHref } from "@/lib/routes";

import { SITE_URL as BASE } from "@/lib/site";

// Wersje językowe każdej trasy (hreflang w sitemapie spina się z canonical/hreflang w metadanych).
function alts(path: string): MetadataRoute.Sitemap[number]["alternates"] {
  return { languages: { pl: `${BASE}${path}`, en: `${BASE}/en${path}` } };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Adres karty zalezy od linii (Dog Store vs Dog Store Pro), wiec mapa strony czyta oba katalogi
  // i sklada adresy tym samym helperem co interfejs. Lista samych slugow nie wystarczy:
  // po slugu nie widac, do ktorego sklepu pozycja nalezy.
  const [shop, pro, categories] = await Promise.all([
    getProducts("collars").catch(() => []),
    getProProducts().catch(() => []),
    getProCategories().catch(() => []),
  ]);

  // Statyczne trasy indeksowalne (kasa/konto/panel/opinie/logowanie/wkrotce są noindex).
  const staticPaths: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/collections/collars", priority: 0.9, freq: "weekly" },
    { path: "/pro", priority: 0.9, freq: "monthly" },
    { path: "/szukaj", priority: 0.4, freq: "monthly" },
    { path: "/o-nas", priority: 0.6, freq: "monthly" },
    { path: "/kontakt", priority: 0.6, freq: "monthly" },
    { path: "/dostawa-i-platnosci", priority: 0.6, freq: "monthly" },
    { path: "/zwroty-i-reklamacje", priority: 0.5, freq: "monthly" },
    { path: "/gwarancja-i-serwis", priority: 0.5, freq: "monthly" },
    { path: "/tabela-rozmiarow", priority: 0.5, freq: "monthly" },
    { path: "/regulamin", priority: 0.3, freq: "yearly" },
    { path: "/polityka-prywatnosci", priority: 0.3, freq: "yearly" },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((s) => ({
    url: `${BASE}${s.path || "/"}`,
    changeFrequency: s.freq,
    priority: s.priority,
    alternates: alts(s.path),
  }));

  const proRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/pro/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: alts(`/pro/${c.slug}`),
  }));

  const productRoutes: MetadataRoute.Sitemap = [...shop, ...pro].map((product) => {
    const path = productHref(product);
    return {
      url: `${BASE}${path}`,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: alts(path),
    };
  });

  return [...staticRoutes, ...proRoutes, ...productRoutes];
}
