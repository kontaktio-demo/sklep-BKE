import { products } from "./products.mock";
import { filterGroups } from "./filters.mock";
import type { Product, FilterGroup, Collection } from "../types";

// THE SEAM (§5). PHASE 2: replace the three bodies below with Supabase
// queries. Signatures stay identical - everything above this layer is
// backend-agnostic and must never import the *.mock files directly.

const collections: Record<string, Omit<Collection, "productCount">> = {
  collars: {
    handle: "collars",
    title: "Obroże dla psów",
    description:
      "Projektowane dla psów pracujących, noszone przez wszystkie. Nylon i łańcuszek klasy służbowej, miejsce na panel ID, kompatybilność z e-obrożą. Testowane w terenie, nie na wybiegu.",
    heroImage: "/placeholder/hero-collars.svg",
  },
};

export async function getCollection(handle: string): Promise<Collection> {
  const collection = collections[handle];
  if (!collection) throw new Error(`Unknown collection: ${handle}`);
  return { ...collection, productCount: products.length };
}

export async function getProducts(handle: string): Promise<Product[]> {
  if (!collections[handle]) throw new Error(`Unknown collection: ${handle}`);
  return products;
}

export async function getFilters(handle: string): Promise<FilterGroup[]> {
  if (!collections[handle]) throw new Error(`Unknown collection: ${handle}`);
  return filterGroups;
}

/** PDP: null (not throw) so the route can render notFound() for unknown slugs. */
export async function getProduct(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductSlugs(): Promise<string[]> {
  return products.map((p) => p.slug);
}

/** Same category first, then bestsellers; never the product itself. */
export async function getRelatedProducts(slug: string, limit = 8): Promise<Product[]> {
  const current = products.find((p) => p.slug === slug);
  if (!current) return [];

  const rank = (p: Product) =>
    (p.category === current.category ? 0 : 10) +
    (p.type === current.type ? 0 : 2) +
    (p.bestsellerRank ?? 20) / 100;

  return products
    .filter((p) => p.slug !== slug && p.inStock)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit);
}
