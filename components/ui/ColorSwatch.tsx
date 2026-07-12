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
        selected
          ? "ring-2 ring-white ring-offset-2 ring-offset-nf-bg"
          : "ring-1 ring-nf-border-strong"
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
