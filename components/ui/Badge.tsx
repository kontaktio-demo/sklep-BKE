import type { ProductBadge } from "@/lib/types";
import { cn } from "@/lib/utils";

// §8-G: NSDW wording for sold-out / last-chance
const BADGE_CONFIG: Record<ProductBadge, { label: string; className: string }> = {
  "sold-out": {
    label: "Wyprzedane",
    className: "border border-nf-border-strong bg-nf-elevated-2 text-nf-muted",
  },
  "last-chance": {
    label: "Ostatnia szansa",
    // solid plate + red-bright: nf-red small text fails AA over photos (§10)
    className: "border border-nf-red bg-nf-bg text-nf-red-bright",
  },
  bestseller: {
    label: "Bestseller",
    className: "bg-nf-red text-white",
  },
  new: {
    label: "Nowość",
    className: "bg-white text-black",
  },
};

export function Badge({ badge }: { badge: ProductBadge }) {
  const { label, className } = BADGE_CONFIG[badge];
  return (
    <span
      className={cn(
        "inline-block rounded-[3px] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        className
      )}
    >
      {label}
    </span>
  );
}
