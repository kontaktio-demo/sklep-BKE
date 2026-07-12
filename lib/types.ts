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

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number; // whole PLN for phase 1; keep consistent when backend lands
  fromPrice: boolean; // true -> render "od X zł"
  currency: string; // "PLN"
  images: [string, string]; // [primary, hover] - the card
  gallery: string[]; // PDP gallery, >=3 shots; gallery[0] === images[0]
  tagline: string; // one line under the name on the PDP
  description: string; // 2-3 sentences
  highlights: string[]; // 4-5 bullets
  specs: ProductSpec[]; // spec table (materiał, szerokość, obwód...)
  sku: string;
  colors: ProductColor[];
  badges: ProductBadge[];
  category: CollarCategory;
  type: CollarType;
  width: CollarWidth;
  size: CollarSize;
  idPanelCompatible: boolean;
  inStock: boolean;
  bestsellerRank?: number; // for Top 10 row
  productType: string; // "Collar" label shown under price (K9TG pattern)
  createdAt: string; // ISO date - required by the Date new->old / old->new sorts (§8-E)
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
