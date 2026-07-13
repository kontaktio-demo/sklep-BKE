"use client";

import type { ProductColor } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ColorSwatch({
  color,
  selected = false,
  onSelect,
  size = "md",
}: {
  color: ProductColor;
  selected?: boolean;
  onSelect?: () => void;
  size?: "sm" | "md";
}) {
  const circle = (
    <span
      className={cn(
        "block rounded-full",
        size === "sm" ? "h-4 w-4" : "h-6 w-6",
        // Probka niezaznaczona: obwodka to JEDYNY sygnal, ze to kontrolka, i przy jasnych
        // kolorach (bezowy, piaskowy) jedyna granica probki wobec bialego kadru - wiec
        // nf-control (3.2:1 na bieli), a nie nf-border-strong (1.93:1, probka rozplywala sie w tle).
        // Zaznaczona: pierscien na tokenie maksymalnego kontrastu (tusz na papierze, biel na
        // graficie) plus przerwa w kolorze tla, zeby pierscien nie sklejal sie z kolorem probki.
        selected
          ? "ring-2 ring-nf-white ring-offset-2 ring-offset-nf-bg"
          : "ring-1 ring-nf-control"
      )}
      // hex comes from product data - the one sanctioned inline color source
      style={{ backgroundColor: color.hex }}
    />
  );

  if (!onSelect) {
    return (
      <span title={color.name} className="inline-flex">
        {circle}
        <span className="sr-only">{color.name}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={color.name}
      aria-pressed={selected}
      onClick={onSelect}
      className="inline-flex min-h-11 min-w-11 items-center justify-center"
    >
      {circle}
    </button>
  );
}
