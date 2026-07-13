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
    className: "border-nf-border-strong text-nf-white",
  },
};

export function Badge({ badge }: { badge: ProductBadge }) {
  const { label, className } = BADGE_CONFIG[badge];
  return (
    <span
      className={cn(
        // Plytka jest NIEPRZEZROCZYSTA. Przy bg-nf-bg/85 kolor tla plakietki zalezal od
        // zdjecia pod spodem, wiec kontrast tekstu byl loteria: "Ostatnia szansa"
        // (nf-red-bright) na plytce podbitej ciemnym kadrem schodzila do 3.91:1, czyli
        // ponizej AA dla drobnego tekstu. Na pelnym nf-bg kazda plakietka ma >=4.8:1
        // niezaleznie od kadru. Rozmycie tla znika razem z przezroczystoscia - nie mialo
        // juz czego rozmywac, a kosztowalo osobna warstwe kompozytu.
        "inline-block rounded-[2px] border bg-nf-bg px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        className
      )}
    >
      {label}
    </span>
  );
}
