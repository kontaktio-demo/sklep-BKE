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
      {/* Kontener przewijany przycina wszystko poza swoim polem wypelnienia, a obwodka
          fokusu wychodzi 8px poza kontrolke (2px linii + 2px odstepu + 4px otoczki).
          Bez zapasu ginela od lewej (padding byl tylko z prawej, pod pasek przewijania)
          i na skrajnych kontrolkach od gory i dolu. p-2 daje zapas, -m-2 zdejmuje go
          z ukladu, wiec kolumna filtrow stoi tam, gdzie stała. */}
      <div
        data-lenis-prevent
        className="slim-scroll sticky top-24 -m-2 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain p-2"
      >
        <div className="flex min-h-11 items-center justify-between gap-3 border-b border-nf-border">
          <h2 className="type-h3 text-nf-white">Filtry</h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="type-label inline-flex min-h-11 items-center text-nf-dim transition-colors duration-250 ease-nf hover:text-nf-white"
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
