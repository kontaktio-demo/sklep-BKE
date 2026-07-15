"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FilterGroup, Product } from "@/lib/types";
import {
  applyFilters,
  countActiveFilters,
  EMPTY_FILTERS,
  priceBounds,
  SORT_OPTIONS,
  sortProducts,
  type FilterState,
  type SortOption,
} from "@/lib/filtering";
import { Toolbar } from "@/components/collection/Toolbar";
import { FilterSidebar } from "@/components/collection/FilterSidebar";
import { FilterDrawer } from "@/components/collection/FilterDrawer";
import { ProductGrid } from "@/components/collection/ProductGrid";

// Stan filtrow i sortowania zyje w query stringu, nie tylko w useState:
//   ?kategoria=working,e-collar&rodzaj=nylon&szerokosc=1.75&rozmiar=large
//   &panel=1&dostepnosc=in-stock&kolor=Czarny,Coyote&cena=150-300&sort=price-asc
// Dzieki temu link do wyfiltrowanej listy dziala, odswiezenie strony nic nie gubi,
// a "wstecz" cofa ostatnia zmiane filtra zamiast wyrzucac ze sklepu.

type ListKey = "category" | "type" | "width" | "size" | "availability" | "color";

/** Klucz FilterState -> nazwa parametru w URL. Parametry po polsku, wartosci techniczne. */
const LIST_PARAM: Record<ListKey, string> = {
  category: "kategoria",
  type: "rodzaj",
  width: "szerokosc",
  size: "rozmiar",
  availability: "dostepnosc",
  color: "kolor",
};

const LIST_KEYS = Object.keys(LIST_PARAM) as ListKey[];

const PANEL_PARAM = "panel";
const PRICE_PARAM = "cena";
const SORT_PARAM = "sort";

/**
 * Dozwolone wartosci filtrow, wzięte z faset z seamu (FilterGroup[]). Zaden reczny slownik
 * nie moze sie tu rozjechac z danymi, a smiec w URL (?kolor=Rozowy) nie udaje aktywnego filtra.
 */
export type FilterVocab = ReadonlyMap<string, ReadonlySet<string>>;

export function parseFilters(
  params: URLSearchParams,
  vocab?: FilterVocab,
  bounds?: [number, number]
): FilterState {
  const list = (key: ListKey): string[] => {
    const raw = params.get(LIST_PARAM[key]);
    if (!raw) return [];

    const allowed = vocab?.get(key);
    const seen = new Set<string>();
    const values: string[] = [];

    for (const part of raw.split(",")) {
      const value = part.trim();
      if (!value || seen.has(value)) continue;
      if (allowed && !allowed.has(value)) continue;
      seen.add(value);
      values.push(value);
    }
    return values;
  };

  return {
    category: list("category"),
    type: list("type"),
    width: list("width"),
    size: list("size"),
    idPanel: params.get(PANEL_PARAM) === "1",
    availability: list("availability"),
    color: list("color"),
    price: parsePrice(params.get(PRICE_PARAM), bounds),
  };
}

function parsePrice(raw: string | null, bounds?: [number, number]): [number, number] | null {
  if (!raw) return null;

  const match = /^(\d+)-(\d+)$/.exec(raw);
  if (!match) return null;

  let lo = Number(match[1]);
  let hi = Number(match[2]);
  if (lo > hi) [lo, hi] = [hi, lo];
  if (!bounds) return [lo, hi];

  const clamp = (n: number) => Math.min(Math.max(n, bounds[0]), bounds[1]);
  lo = clamp(lo);
  hi = clamp(hi);

  // pelny zakres to brak filtra - inaczej licznik aktywnych filtrow klamie
  return lo === bounds[0] && hi === bounds[1] ? null : [lo, hi];
}

export function parseSort(params: URLSearchParams): SortOption {
  const raw = params.get(SORT_PARAM);
  const option = SORT_OPTIONS.find((o) => o.value === raw);
  return option ? option.value : "featured";
}

/** Stan -> query string. Domyslne wartosci nie trafiaja do URL, wiec czysta lista ma czysty adres. */
function buildQuery(filters: FilterState, sort: SortOption): string {
  const params = new URLSearchParams();

  for (const key of LIST_KEYS) {
    const values = filters[key];
    if (values.length > 0) params.set(LIST_PARAM[key], values.join(","));
  }
  if (filters.idPanel) params.set(PANEL_PARAM, "1");
  if (filters.price) params.set(PRICE_PARAM, `${filters.price[0]}-${filters.price[1]}`);
  if (sort !== "featured") params.set(SORT_PARAM, sort);

  // URLSearchParams koduje przecinek na %2C. W query stringu przecinek jest legalny,
  // a "kategoria=working,e-collar" czyta czlowiek - nie tylko parser.
  return params.toString().replace(/%2C/g, ",");
}

function sameList(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

function samePrice(a: FilterState, b: FilterState): boolean {
  return a.price?.[0] === b.price?.[0] && a.price?.[1] === b.price?.[1];
}

function sameFacets(a: FilterState, b: FilterState): boolean {
  return LIST_KEYS.every((key) => sameList(a[key], b[key])) && a.idPanel === b.idPanel;
}

function sameFilters(a: FilterState, b: FilterState): boolean {
  return sameFacets(a, b) && samePrice(a, b);
}

interface CollectionViewProps {
  products: Product[];
  groups: FilterGroup[];
}

export function CollectionView({ products, groups }: CollectionViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const bounds = useMemo(() => priceBounds(products), [products]);

  const vocab = useMemo<FilterVocab>(
    () => new Map(groups.map((group) => [group.id, new Set(group.options.map((o) => o.value))])),
    [groups]
  );

  const colorHexes = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of products) for (const c of p.colors) map[c.name] = c.hex;
    return map;
  }, [products]);

  // Stan lokalny jest zrodlem renderu, URL zrodlem prawdy przy wejsciu i przy "wstecz".
  // Suwak ceny musi reagowac natychmiast - czekanie na nawigacje routera gubiloby klatki.
  const [filters, setFilters] = useState<FilterState>(() =>
    parseFilters(new URLSearchParams(query), vocab, bounds)
  );
  const [sort, setSort] = useState<SortOption>(() => parseSort(new URLSearchParams(query)));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // URL -> stan: wstecz/dalej oraz wejscie z gotowym linkiem. Po naszym wlasnym zapisie
  // parsowanie zwraca ten sam stan, wiec setFilters oddaje poprzednia referencje i nic sie
  // nie przerenderowuje - petla nie ma jak powstac.
  useEffect(() => {
    const params = new URLSearchParams(query);
    const next = parseFilters(params, vocab, bounds);
    setFilters((prev) => (sameFilters(prev, next) ? prev : next));
    setSort(parseSort(params));
  }, [query, vocab, bounds]);

  const commit = (nextFilters: FilterState, nextSort: SortOption) => {
    setFilters(nextFilters);
    setSort(nextSort);

    const qs = buildQuery(nextFilters, nextSort);
    const url = qs ? `${pathname}?${qs}` : pathname;

    // Przeciaganie suwaka ceny to dziesiatki zmian na sekunde - kolejne kroki nadpisuja
    // ten sam wpis w historii (replace). Pierwsze dotkniecie suwaka i kazda inna zmiana
    // (checkbox, kolor, panel, sortowanie, czyszczenie) zostawia wpis, zeby "wstecz"
    // cofalo ostatni filtr, a nie wyrzucalo ze sklepu.
    const dragging =
      nextSort === sort &&
      sameFacets(filters, nextFilters) &&
      !samePrice(filters, nextFilters) &&
      filters.price !== null &&
      nextFilters.price !== null;

    if (dragging) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  };

  const visible = useMemo(
    () => sortProducts(applyFilters(products, filters), sort),
    [products, filters, sort]
  );

  const clearAll = () => commit(EMPTY_FILTERS, sort);

  return (
    // BEZ items-start: domyslny stretch rozciaga <aside> do wysokosci wysokiej kolumny
    // produktow. Bez tego aside zwijal sie do wysokosci wlasnej tresci (== wysokosc
    // wewnetrznego sticky-diva), sticky nie mial toru i panel filtrow odjezdzal w gore
    // po jednym ekranie scrolla. min-w-0 na kolumnie obok chroni przed overflow-em.
    <div className="flex gap-8 xl:gap-10">
      <FilterSidebar
        groups={groups}
        state={filters}
        onChange={(next) => commit(next, sort)}
        bounds={bounds}
        colorHexes={colorHexes}
        onClearAll={clearAll}
      />

      <div className="min-w-0 flex-1">
        <Toolbar
          count={visible.length}
          sort={sort}
          onSortChange={(next) => commit(filters, next)}
          onOpenFilters={() => setDrawerOpen(true)}
          activeFilterCount={countActiveFilters(filters)}
        />
        <div className="pt-6">
          <ProductGrid products={visible} onClearFilters={clearAll} />
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        groups={groups}
        state={filters}
        onChange={(next) => commit(next, sort)}
        bounds={bounds}
        colorHexes={colorHexes}
        onClearAll={clearAll}
        resultCount={visible.length}
      />
    </div>
  );
}
