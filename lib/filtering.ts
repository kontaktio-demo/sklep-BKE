import type { Product } from "./types";

export interface FilterState {
  category: string[];
  type: string[];
  width: string[];
  size: string[];
  idPanel: boolean;
  availability: string[];
  color: string[];
  price: [number, number] | null;
}

export const EMPTY_FILTERS: FilterState = {
  category: [],
  type: [],
  width: [],
  size: [],
  idPanel: false,
  availability: [],
  color: [],
  price: null,
};

export type SortOption =
  | "featured"
  | "best-selling"
  | "az"
  | "za"
  | "price-asc"
  | "price-desc"
  | "date-desc"
  | "date-asc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Polecane" },
  { value: "best-selling", label: "Bestsellery" },
  { value: "az", label: "Nazwa: A-Z" },
  { value: "za", label: "Nazwa: Z-A" },
  { value: "price-asc", label: "Cena: rosnąco" },
  { value: "price-desc", label: "Cena: malejąco" },
  { value: "date-desc", label: "Najnowsze" },
  { value: "date-asc", label: "Najstarsze" },
];

export function applyFilters(products: Product[], state: FilterState): Product[] {
  return products.filter((p) => {
    if (state.category.length && !state.category.includes(p.category)) return false;
    if (state.type.length && !state.type.includes(p.type)) return false;
    if (state.width.length && !state.width.includes(p.width)) return false;
    // rozmiar jest wariantem: model pasuje, gdy MA wariant w wybranym rozmiarze.
    // Model z S i M liczy sie i pod "maly", i pod "sredni".
    if (state.size.length && !p.sizes.some((size) => state.size.includes(size))) return false;
    if (state.idPanel && !p.idPanelCompatible) return false;
    if (state.availability.length) {
      // p.inStock = chociaz jeden wariant dostepny. Model z wyprzedanym duzym
      // nadal jest "dostepny" - bo w malym da sie go kupic.
      const status = p.inStock ? "in-stock" : "out-of-stock";
      if (!state.availability.includes(status)) return false;
    }
    if (state.color.length && !p.colors.some((c) => state.color.includes(c.name))) return false;
    // p.price = cena OD (najtanszy wariant). Filtr odsiewa po cenie wejscia w model,
    // czyli po tej samej liczbie, ktora widac na karcie.
    if (state.price && (p.price < state.price[0] || p.price > state.price[1])) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "featured":
      return sorted;
    case "best-selling":
      // finite sentinel - Infinity - Infinity would be NaN and break comparator consistency
      return sorted.sort(
        (a, b) =>
          (a.bestsellerRank ?? Number.MAX_SAFE_INTEGER) -
          (b.bestsellerRank ?? Number.MAX_SAFE_INTEGER)
      );
    case "az":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "pl"));
    case "za":
      return sorted.sort((a, b) => b.name.localeCompare(a.name, "pl"));
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "date-desc":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "date-asc":
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}

export function countActiveFilters(state: FilterState): number {
  return (
    state.category.length +
    state.type.length +
    state.width.length +
    state.size.length +
    (state.idPanel ? 1 : 0) +
    state.availability.length +
    state.color.length +
    (state.price ? 1 : 0)
  );
}

/**
 * Zakres suwaka liczony po cenie OD, bo po tej samej cenie filtruje applyFilters.
 * Gorna granica to najdrozsze WEJSCIE w model, nie najdrozszy wariant w sklepie:
 * duzy rozmiar moze kosztowac wiecej niz maksimum suwaka i to jest poprawne.
 */
export function priceBounds(products: Product[]): [number, number] {
  if (!products.length) return [0, 0];
  let min = Infinity;
  let max = -Infinity;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return [Math.floor(min), Math.ceil(max)];
}
