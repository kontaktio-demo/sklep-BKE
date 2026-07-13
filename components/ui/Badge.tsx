import type { ProductBadge } from "@/lib/types";
import { cn } from "@/lib/utils";

// §8-G: NSDW wording for sold-out / last-chance.
// Plakietki sa rzeczowe, nie krzykliwe: wspolna, spokojna plytka na tle kadru.
// Czerwone wypelnienie na kazdej karcie robilo z siatki choinke - czerwien zostaje dla CTA,
// jedyny czerwony akcent to "ostatnia szansa".
const BADGE_CONFIG: Record<ProductBadge, { label: string; className: string }> = {
  "sold-out": {
    label: "Wyprzedane",
    className: "border-nf-border text-nf-muted",
  },
  "last-chance": {
    label: "Ostatnia szansa",
    // red-bright: nf-red small text fails AA over photos (§10)
    className: "border-nf-red text-nf-red-bright",
  },
  bestseller: {
    label: "Bestseller",
    className: "border-nf-border-strong text-nf-text",
  },
  new: {
    label: "Nowość",
    className: "border-nf-border-strong text-white",
  },
};

export function Badge({ badge }: { badge: ProductBadge }) {
  const { label, className } = BADGE_CONFIG[badge];
  return (
    <span
      className={cn(
        "inline-block rounded-[2px] border bg-nf-bg/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] backdrop-blur-sm",
        className
      )}
    >
      {label}
    </span>
  );
}
