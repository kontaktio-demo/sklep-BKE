"use client";

import { useEffect, useRef, type ReactNode } from "react";
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
// maska (clip-path od dolu) w rytmie scrolla. Bez fade, bez rozmycia - twarda krawedz,
// ktora wyglada jak ciecie, a nie jak efekt.
export function SeamTransition({ from, to, className }: SeamTransitionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

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
          end: "+=90%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      // dolna warstwa lekko odjezdza w glab (bez skalowania w dol, zeby nie bylo "gumy")
      tl.fromTo(
        base,
        { yPercent: 0 },
        { yPercent: -12, ease: "none" },
        0
      );

      // gorna warstwa odslania sie maska; jej tresc jedzie wolniej niz maska,
      // wiec kadr "dogania" tresc zamiast wjezdzac calym blokiem
      tl.fromTo(
        cover,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none" },
        0
      );
      tl.fromTo(
        coverInner,
        { yPercent: 14 },
        { yPercent: 0, ease: "none" },
        0
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={rootRef} className={cn("relative h-svh overflow-hidden", className)}>
      <div className="absolute inset-0">
        <div data-seam-base-inner className="h-full w-full">
          {from}
        </div>
      </div>
      <div
        data-seam-cover
        className="absolute inset-0"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      >
        <div data-seam-cover-inner className="h-full w-full">
          {to}
        </div>
      </div>
    </div>
  );
}
