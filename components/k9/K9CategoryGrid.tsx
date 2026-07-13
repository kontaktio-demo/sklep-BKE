import Link from "next/link";
import type { CSSProperties } from "react";
import type { K9CategoryInfo } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn, plural } from "@/lib/utils";

// Rytm siatki: 4+2 / 2+4 / 6. Kafle nie sa rowne, bo kategorie nie sa rowne.
const SPANS = [
  "md:col-span-4",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-4",
  "md:col-span-6",
];

export function K9CategoryGrid({ categories }: { categories: K9CategoryInfo[] }) {
  return (
    <section id="kategorie" className="bg-nf-bg">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-24">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] tracking-[0.25em] text-nf-red-bright">
            01
          </span>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
            Kategorie
          </h2>
          <span aria-hidden="true" className="hatch h-px flex-1" />
        </div>

        <Reveal
          selector="[data-tile]"
          stagger={0.06}
          className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-6"
        >
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              data-tile
              href={`/k9/${cat.slug}`}
              className={cn(
                "group relative flex min-h-[220px] flex-col overflow-hidden rounded-[2px] border border-nf-border bg-nf-elevated p-6",
                "transition-colors duration-250 ease-nf hover:border-nf-red",
                SPANS[i % SPANS.length]
              )}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 grid-tech opacity-40 transition-opacity duration-300 ease-nf group-hover:opacity-100"
                style={{ "--grid-size": "32px" } as CSSProperties}
              />

              <span className="relative font-mono text-[11px] tracking-[0.2em] text-nf-dim">
                {cat.code}
              </span>
              <h3 className="relative mt-4 font-display text-2xl uppercase tracking-tight text-white">
                {cat.title}
              </h3>
              <p className="relative mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-nf-muted">
                {cat.description}
              </p>

              <span className="relative mt-auto flex items-center justify-between pt-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-nf-dim">
                  {cat.productCount}{" "}
                  {plural(cat.productCount, "pozycja", "pozycje", "pozycji")}
                </span>
                <ArrowRightIcon
                  className="size-4 text-nf-dim transition-[transform,color] duration-250 ease-nf group-hover:text-white motion-safe:group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
