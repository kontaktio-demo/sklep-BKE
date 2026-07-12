"use client";

import { countActiveFilters } from "@/lib/filtering";
import { FilterControls, type FilterControlsProps } from "./FilterControls";

export function FilterSidebar({
  onClearAll,
  ...controls
}: FilterControlsProps & { onClearAll: () => void }) {
  const activeCount = countActiveFilters(controls.state);

  return (
    <aside aria-label="Filtry" className="hidden w-64 shrink-0 lg:block xl:w-72">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
        <div className="flex min-h-11 items-center justify-between border-b border-nf-border">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-nf-white">
            Filtry
          </h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="min-h-11 text-xs text-nf-muted underline underline-offset-2 transition-colors duration-250 ease-nf hover:text-white"
            >
              Wyczyść wszystko
            </button>
          )}
        </div>
        <FilterControls {...controls} />
      </div>
    </aside>
  );
}
