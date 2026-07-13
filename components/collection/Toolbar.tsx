"use client";

import { useId } from "react";
import { SORT_OPTIONS, type SortOption } from "@/lib/filtering";
import { Button } from "@/components/ui/Button";
import { plural } from "@/lib/utils";

export function Toolbar({
  count,
  sort,
  onSortChange,
  onOpenFilters,
  activeFilterCount,
}: {
  count: number;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}) {
  const sortId = useId();

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-nf-border py-4">
      <p aria-live="polite" className="text-sm text-nf-muted">
        {count} {plural(count, "produkt", "produkty", "produktów")}
      </p>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="h-11 lg:hidden" onClick={onOpenFilters}>
          Filtruj
          {activeFilterCount > 0 && (
            <>
              {/* Licznik dziedziczyl kolor liter po przycisku. Na jasnym tle przycisk ma
                  ciemne litery, a ciemne litery na czerwonym kraku sie nie czytaja - pastylka
                  pilnuje wiec wlasnego koloru. Biel na plaskiej czerwieni dziala w obu swiatach. */}
              <span
                aria-hidden="true"
                className="flex size-5 items-center justify-center rounded-full bg-nf-red text-xs font-bold leading-none text-white"
              >
                {activeFilterCount}
              </span>
              <span className="sr-only">
                {activeFilterCount}{" "}
                {plural(activeFilterCount, "aktywny filtr", "aktywne filtry", "aktywnych filtrów")}
              </span>
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          {/* type-label zamiast rozstrzelonego uppercase 0.1em: pasek narzedzi sklepu
              cywilnego przestaje udawac panel techniczny */}
          <label htmlFor={sortId} className="type-label whitespace-nowrap text-nf-dim">
            Sortuj
          </label>
          {/* nf-control: krawedz jest jedynym sygnalem, ze to lista wyboru (WCAG 1.4.11) */}
          <select
            id={sortId}
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-11 max-w-48 rounded-[2px] border border-nf-control bg-transparent px-3 text-sm text-nf-text"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
