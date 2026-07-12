"use client";

import { useMemo, useState } from "react";
import type { FilterGroup, Product } from "@/lib/types";
import {
  applyFilters,
  countActiveFilters,
  EMPTY_FILTERS,
  priceBounds,
  sortProducts,
  type FilterState,
  type SortOption,
} from "@/lib/filtering";
import { Toolbar } from "@/components/collection/Toolbar";
import { FilterSidebar } from "@/components/collection/FilterSidebar";
import { FilterDrawer } from "@/components/collection/FilterDrawer";
import { ProductGrid } from "@/components/collection/ProductGrid";

interface CollectionViewProps {
  products: Product[];
  groups: FilterGroup[];
}

export function CollectionView({ products, groups }: CollectionViewProps) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>("featured");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bounds = useMemo(() => priceBounds(products), [products]);

  const colorHexes = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of products) for (const c of p.colors) map[c.name] = c.hex;
    return map;
  }, [products]);

  const visible = useMemo(
    () => sortProducts(applyFilters(products, filters), sort),
    [products, filters, sort]
  );

  const clearAll = () => setFilters(EMPTY_FILTERS);

  return (
    <div className="flex items-start gap-8 xl:gap-10">
      <FilterSidebar
        groups={groups}
        state={filters}
        onChange={setFilters}
        bounds={bounds}
        colorHexes={colorHexes}
        onClearAll={clearAll}
      />

      <div className="min-w-0 flex-1">
        <Toolbar
          count={visible.length}
          sort={sort}
          onSortChange={setSort}
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
        onChange={setFilters}
        bounds={bounds}
        colorHexes={colorHexes}
        onClearAll={clearAll}
        resultCount={visible.length}
      />
    </div>
  );
}
