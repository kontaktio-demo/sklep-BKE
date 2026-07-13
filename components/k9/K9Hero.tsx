"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/Button";
import { Lens } from "@/components/motion/Lens";
import { SplitLines } from "@/components/motion/SplitLines";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";
import { cn } from "@/lib/utils";

const LINES = ["PSY, KTÓRE", "PRACUJĄ POD", "OBCIĄŻENIEM"];

// jeden ciag klas dla obu warstw soczewki: warstwa czerwona musi trafic
// w te same linie bazowe co naglowek pod spodem (inaczej "przeswietlenie" sie rozjezdza)
const HEADING =
  "font-display text-[clamp(2.5rem,7vw,6rem)] font-black uppercase leading-[0.92] tracking-tight text-white";

const CORNERS = [
  "left-0 top-0",
  "right-0 top-0",
  "left-0 bottom-0",
  "right-0 bottom-0",
];

export function K9Hero() {
  const scrollRef = useRef<HTMLSpanElement | null>(null);
  const reduced = usePrefersReducedMotion();

  // wskaznik scrolla: 16 px odcinek przesuwa sie w dol w 56 px torze.
  // GSAP, bo keyframes zyja w globals.css, a ten plik nie jest moj.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reduced) return;

    const tween = gsap.fromTo(
      el,
      { yPercent: -110 },
      {
        yPercent: 360,
        duration: 1.9,
        ease: "power1.inOut",
        repeat: -1,
        repeatDelay: 0.2,
      }
    );

    return () => {
      tween.kill();
    };
  }, [reduced]);

  return (
    <section className="relative min-h-[88svh] overflow-hidden bg-nf-bg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-tech opacity-60"
        style={
          {
            "--grid-size": "72px",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0%, #000 42%, transparent 94%)",
            maskImage:
              "linear-gradient(to bottom, #000 0%, #000 42%, transparent 94%)",
          } as CSSProperties
        }
      />

      <div className="relative mx-auto flex min-h-[88svh] max-w-[1600px] flex-col px-4 md:px-6">
        <div className="flex items-center justify-between border-b border-nf-border py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-nf-dim">
          <span>PAKT-K9</span>
          <span>Sprzęt służbowy</span>
        </div>

        <div className="relative flex flex-1 flex-col justify-center py-16 md:py-20">
          {CORNERS.map((pos) => (
            <span
              key={pos}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute size-2 border border-nf-border-strong",
                pos
              )}
            />
          ))}

          <Lens
            size={280}
            className="w-fit"
            reveal={
              <>
                <span
                  className="absolute inset-0 hatch-red opacity-30"
                  aria-hidden="true"
                />
                <div aria-hidden="true" className={cn(HEADING, "relative text-nf-red-bright")}>
                  {LINES.map((line) => (
                    <span key={line} className="mask-line">
                      <span className="block">{line}</span>
                    </span>
                  ))}
                </div>
              </>
            }
          >
            <SplitLines immediate as="h1" lines={LINES} className={HEADING} />
          </Lens>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-nf-muted">
            Linia K9 to sprzęt do służby patrolowej, pracy węchowej i szkolenia. Pies
            służbowy obciąża obrożę inaczej niż pies rodzinny, więc taśma, okucia i
            przeszycia są tu dobierane pod inne wartości. To osobna linia produktowa:
            tych pozycji nie znajdziesz w sklepie cywilnym.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button size="lg" href="#kategorie" className="rounded-[2px]">
              Zobacz kategorie
            </Button>
            <Button size="lg" variant="ghost" href="/collections/collars" className="rounded-[2px]">
              Sklep cywilny
            </Button>
          </div>
        </div>

        <div className="flex justify-center pb-8 md:pb-10">
          <span
            aria-hidden="true"
            className="relative block h-14 w-px overflow-hidden bg-nf-border"
          >
            <span
              ref={scrollRef}
              className="absolute inset-x-0 top-0 block h-4 bg-white/70"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
