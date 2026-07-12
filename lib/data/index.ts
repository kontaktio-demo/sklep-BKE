import { products } from "./products.mock";
import { filterGroups } from "./filters.mock";
import type { Product, FilterGroup, Collection } from "../types";

// THE SEAM (§5). PHASE 2: replace the three bodies below with Supabase
// queries. Signatures stay identical — everything above this layer is
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
