import { products } from "./products.mock";
import { filterGroups } from "./filters.mock";
import { proCategories as mockProCategories, proProducts } from "./pro.mock";
import { dbGetProCategories, dbGetProduct, dbGetProducts } from "./catalog";
import { getUserLocale } from "@/i18n/locale";
import type {
  Collection,
  FilterGroup,
  ProCategory,
  ProCategoryInfo,
  Product,
} from "../types";

// THE SEAM (§5). Realny backend = Supabase (lib/data/catalog.ts). Gdy baza nieskonfigurowana
// albo zapytanie padnie, wracamy na dane mockowe — dzięki temu build i dev DZIAŁAJĄ offline,
// a produkcja czyta z bazy. Sygnatury identyczne: wszystko powyżej tej warstwy jest
// niezależne od backendu i NIGDY nie importuje mocków ani Supabase bezpośrednio.

const collections: Record<string, Omit<Collection, "productCount">> = {
  collars: {
    handle: "collars",
    title: "Obroże dla psów",
    description:
      "Projektowane dla psów pracujących, noszone przez wszystkie. Nylon i łańcuszek klasy roboczej, miejsce na panel ID, kompatybilność z e-obrożą. Testowane w terenie, nie na wybiegu.",
    heroImage: "/placeholder/hero-collars.svg",
  },
};

// Mockowy katalog cywilny/pro jako fallback offline.
const mockShop = products.filter((p) => p.line === "shop");
const mockAll = [...mockShop, ...proProducts];

async function shopProducts(): Promise<Product[]> {
  const locale = await getUserLocale();
  const db = await dbGetProducts("shop", locale).catch(() => null);
  return db ?? mockShop;
}

async function proProductsAll(): Promise<Product[]> {
  const locale = await getUserLocale();
  const db = await dbGetProducts("pro", locale).catch(() => null);
  return db ?? proProducts;
}

export async function getCollection(handle: string): Promise<Collection> {
  const collection = collections[handle];
  if (!collection) throw new Error(`Unknown collection: ${handle}`);
  const list = await shopProducts();
  return { ...collection, productCount: list.length };
}

export async function getProducts(handle: string): Promise<Product[]> {
  if (!collections[handle]) throw new Error(`Unknown collection: ${handle}`);
  return shopProducts();
}

export async function getFilters(handle: string): Promise<FilterGroup[]> {
  if (!collections[handle]) throw new Error(`Unknown collection: ${handle}`);
  // Grupy filtrów pozostają statyczne (te same dane co katalog). Realne zliczanie
  // z bazy — pozycja do dopracowania (PYTANIA-NA-RANO.md).
  return filterGroups;
}

/** PDP: null (not throw) so the route can render notFound() for unknown slugs. */
export async function getProduct(slug: string): Promise<Product | null> {
  const locale = await getUserLocale();
  const fromDb = await dbGetProduct(slug, locale).catch(() => undefined);
  if (fromDb !== undefined) return fromDb; // DB odpowiedziała (produkt albo null=brak)
  return mockAll.find((p) => p.slug === slug) ?? null;
}

/** Powiazane produkty zawsze z tej samej linii: sklep nie podsuwa sprzetu Dog Store Pro i odwrotnie. */
export async function getRelatedProducts(slug: string, limit = 8): Promise<Product[]> {
  const [shop, pro] = await Promise.all([shopProducts(), proProductsAll()]);
  const all = [...shop, ...pro];
  const current = all.find((p) => p.slug === slug);
  if (!current) return [];

  const pool = all.filter((p) => p.line === current.line);
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
  const locale = await getUserLocale();
  const db = await dbGetProCategories(locale).catch(() => null);
  return db ?? mockProCategories;
}

export async function getProCategory(slug: string): Promise<ProCategoryInfo | null> {
  const cats = await getProCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}

export async function getProProducts(category?: ProCategory): Promise<Product[]> {
  const list = await proProductsAll();
  return category ? list.filter((p) => p.proCategory === category) : list;
}
