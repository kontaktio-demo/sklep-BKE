import { products } from "./products.mock";
import { filterGroups } from "./filters.mock";
import { proCategories, proProducts } from "./pro.mock";
import type {
  Collection,
  FilterGroup,
  ProCategory,
  ProCategoryInfo,
  Product,
} from "../types";

// THE SEAM (§5). PHASE 2: replace the bodies below with Supabase
// queries. Signatures stay identical - everything above this layer is
// backend-agnostic and must never import the *.mock files directly.

const collections: Record<string, Omit<Collection, "productCount">> = {
  collars: {
    handle: "collars",
    title: "Obroże dla psów",
    description:
      "Projektowane dla psów pracujących, noszone przez wszystkie. Nylon i łańcuszek klasy roboczej, miejsce na panel ID, kompatybilność z e-obrożą. Testowane w terenie, nie na wybiegu.",
    heroImage: "/placeholder/hero-collars.svg",
  },
};

/** Zwykly sklep widzi wylacznie linie "shop". Sprzet z tej linii jest tylko w sekcji Dog Store Pro. */
const shopProducts = products.filter((p) => p.line === "shop");

const allProducts = [...shopProducts, ...proProducts];

export async function getCollection(handle: string): Promise<Collection> {
  const collection = collections[handle];
  if (!collection) throw new Error(`Unknown collection: ${handle}`);
  return { ...collection, productCount: shopProducts.length };
}

export async function getProducts(handle: string): Promise<Product[]> {
  if (!collections[handle]) throw new Error(`Unknown collection: ${handle}`);
  return shopProducts;
}

export async function getFilters(handle: string): Promise<FilterGroup[]> {
  if (!collections[handle]) throw new Error(`Unknown collection: ${handle}`);
  return filterGroups;
}

/** PDP: null (not throw) so the route can render notFound() for unknown slugs. */
export async function getProduct(slug: string): Promise<Product | null> {
  return allProducts.find((p) => p.slug === slug) ?? null;
}

// getProductSlugs() zostal usuniety. Zwracal slugi OBU linii i nie mial juz zadnego
// odbiorcy (obie trasy buduja generateStaticParams z wlasnego zrodla: sklep z getProducts,
// Pro z getProProducts). Jako jedyna funkcja seamu mieszajaca linie byl gotowa pulapka:
// pierwsze uzycie do budowy tras sklepu wygenerowaloby karty Dog Store Pro pod adresem /products/<slug>,
// czyli sprzet sluzbowy w cywilnym motywie. Potrzebna lista slugow jednej linii? Bierz ja
// z getProducts("collars") albo getProProducts() - te funkcje nie potrafia skrzyzowac swiatow.

/** Powiazane produkty zawsze z tej samej linii: sklep nie podsuwa sprzetu Dog Store Pro i odwrotnie. */
export async function getRelatedProducts(slug: string, limit = 8): Promise<Product[]> {
  const current = allProducts.find((p) => p.slug === slug);
  if (!current) return [];

  const pool = allProducts.filter((p) => p.line === current.line);

  const rank = (p: Product) =>
    (p.category === current.category ? 0 : 10) +
    (p.type === current.type ? 0 : 2) +
    (p.bestsellerRank ?? 20) / 100;

  return pool
    .filter((p) => p.slug !== slug && p.inStock)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit);
}

// ---- Dog Store Pro ----

export async function getProCategories(): Promise<ProCategoryInfo[]> {
  return proCategories;
}

export async function getProCategory(slug: string): Promise<ProCategoryInfo | null> {
  return proCategories.find((c) => c.slug === slug) ?? null;
}

export async function getProProducts(category?: ProCategory): Promise<Product[]> {
  return category ? proProducts.filter((p) => p.proCategory === category) : proProducts;
}
