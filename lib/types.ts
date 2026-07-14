/** Linia produktowa: zwykly sklep vs dedykowana sekcja Dog Store Pro (sprzet sluzbowy). */
export type ProductLine = "shop" | "pro";

/** Kategorie w sekcji Pro (produkty z tej linii nie trafiaja do zwyklego sklepu). */
export type ProCategory = "patrol" | "handle" | "e-collar" | "training" | "detection";

export type CollarCategory = "working" | "non-working" | "e-collar";
export type CollarType = "nylon" | "chain";
export type CollarWidth = "1" | "1.5" | "1.75";
export type CollarSize = "small" | "medium" | "large";
export type ProductBadge = "bestseller" | "new" | "sold-out" | "last-chance";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

/**
 * Rozmiar jest wariantem, nie atrybutem produktu. Wszystko, co zalezy od rozmiaru,
 * mieszka tutaj: cena, SKU, dostepnosc, obwod szyi, waga. W Product.specs zostaja
 * wylacznie cechy wspolne dla calego modelu (material, okucia, szerokosc, panel ID).
 */
export interface ProductVariant {
  size: CollarSize;
  sku: string; // SKU modelu + kod rozmiaru, np. DS-RAN-175-M
  price: number; // whole PLN, jak Product.price
  inStock: boolean;
  neck: string; // obwod szyi, np. "38-46 cm"
  weightGrams: number; // waga samej obrozy
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** cena OD: najnizsza cena wariantu. Do koszyka zawsze idzie cena wariantu, nie ta. */
  price: number; // whole PLN for phase 1; keep consistent when backend lands
  /** true, gdy warianty roznia sie cena -> render "od X zł" */
  fromPrice: boolean;
  currency: string; // "PLN"
  images: [string, string]; // [primary, hover] - the card
  gallery: string[]; // PDP gallery, >=3 shots; gallery[0] === images[0]
  tagline: string; // one line under the name on the PDP
  description: string; // 2-3 sentences
  highlights: string[]; // 4-5 bullets
  /** cechy wspolne modelu. Obwod szyi i waga sa w wariancie - zaleza od rozmiaru. */
  specs: ProductSpec[];
  /** SKU modelu, bez kodu rozmiaru (np. DS-RAN-175). Kupowane SKU siedzi w wariancie. */
  sku: string;
  colors: ProductColor[];
  badges: ProductBadge[];
  category: CollarCategory;
  type: CollarType;
  width: CollarWidth;
  /** min. 2 warianty, posortowane small -> large */
  variants: ProductVariant[];
  /** rozmiary z variants, ta sama kolejnosc. Filtr i karta czytaja to, nie variants. */
  sizes: CollarSize[];
  idPanelCompatible: boolean;
  /** true, gdy CHOCIAZ JEDEN wariant jest dostepny */
  inStock: boolean;
  bestsellerRank?: number; // for Top 10 row
  productType: string; // "Collar" label shown under price (K9TG pattern)
  createdAt: string; // ISO date - required by the Date new->old / old->new sorts (§8-E)
  /** "shop" = zwykly sklep, "pro" = sprzet sluzbowy dostepny tylko w sekcji Dog Store Pro */
  line: ProductLine;
  /** wypelniane wylacznie dla line === "pro" */
  proCategory?: ProCategory;
  /** oznaczenie zgodnosci / normy pokazywane w sekcji Pro */
  proStandard?: string;
}

export interface ProCategoryInfo {
  slug: ProCategory;
  code: string; // oznaczenie w stylu technicznym, np. "PRO-01"
  title: string;
  description: string;
  productCount: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: { value: string; label: string; count: number }[];
}

export interface Collection {
  handle: string;
  title: string;
  description: string;
  heroImage: string;
  productCount: number;
}
