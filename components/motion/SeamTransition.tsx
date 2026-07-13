"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./useReducedMotion";

interface SeamTransitionProps {
  /** warstwa nizsza (to, z czego wychodzimy) */
  from: ReactNode;
  /** warstwa wyzsza (to, w co wchodzimy) - wjezdza maska od dolu */
  to: ReactNode;
  className?: string;
}

// Szew miedzy dwoma swiatami: dolna warstwa jest przypieta, gorna odslania sie
// maska (clip-path od dolu) w rytmie scrolla. Bez fade, bez rozmycia - twarda krawedz.
//
// WARIANT BEZPIECZNY jest domyslny: dopoki JS nie potwierdzi, ze animacja ruszy
// (brak JS, prefers-reduced-motion, blad GSAP), oba panele stoja jeden pod drugim
// w normalnym przeplywie. Wczesniej gorna warstwa byla renderowana z clip-path: inset(0),
// wiec przy wylaczonym ruchu przykrywala dolna na stale i wejscie do sklepu znikalo.
export function SeamTransition({ from, to, className }: SeamTransitionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const baseRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  // pierwszy render (takze SSR) idzie wariantem bezpiecznym; warstwy wlaczamy dopiero,
  // gdy wiemy, ze jestesmy w przegladarce i ruch jest dozwolony
  useEffect(() => setMounted(true), []);
  const layered = mounted && !reduced;

  useEffect(() => {
    const root = rootRef.current;
    if (!layered || !root) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cover = root.querySelector<HTMLElement>("[data-seam-cover]");
      const coverInner = root.querySelector<HTMLElement>("[data-seam-cover-inner]");
      const base = root.querySelector<HTMLElement>("[data-seam-base-inner]");
      if (!cover || !coverInner || !base) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          // wysokosc liczona funkcja, nie procentem: na mobile chowanie paska adresu
          // zmienia innerHeight i procent przeliczalby sie w trakcie scrolla
          end: () => `+=${window.innerHeight * 0.9}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // gdy gorna warstwa juz przykryla dolna, dolna wypada z tab ordera
            // i z drzewa dostepnosci - inaczej Tab wchodzi w niewidoczny link
            const covered = self.progress > 0.92;
            if (baseRef.current) {
              baseRef.current.inert = covered;
            }
          },
        },
      });

      tl.fromTo(base, { yPercent: 0 }, { yPercent: -12, ease: "none" }, 0);
      tl.fromTo(
        cover,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
        0
      );
      tl.fromTo(coverInner, { yPercent: 14 }, { yPercent: 0, ease: "none" }, 0);
    }, root);

    return () => {
      ctx.revert();
      if (baseRef.current) baseRef.current.inert = false;
    };
  }, [layered]);

  // wariant bezpieczny: dwie zwykle sekcje, jedna pod druga
  if (!layered) {
    return (
      <div className={className}>
        <section className="min-h-svh">{from}</section>
        <section className="min-h-svh">{to}</section>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative h-svh overflow-hidden", className)}>
      <div ref={baseRef} className="absolute inset-0">
        <div data-seam-base-inner className="h-full w-full">
          {from}
        </div>
      </div>
      <div
        data-seam-cover
        className="absolute inset-0"
        style={{ clipPath: "inset(100% 0% 0% 0%)" }}
      >
        <div data-seam-cover-inner className="h-full w-full">
          {to}
        </div>
      </div>
    </div>
  );
}
