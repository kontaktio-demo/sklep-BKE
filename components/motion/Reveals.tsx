"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Choreografia scrolla sterowana atrybutami danych - komponenty serwerowe zostaja
 * serwerowe, a klient ma JEDEN skaner na caly serwis.
 *
 *   data-reveal            wjazd elementu przy wejsciu w viewport (raz)
 *   data-reveal="group"    dzieci elementu wjezdzaja kaskada (stagger)
 *   data-parallax="0.08"   subtelna paralaksa kadru (scrub, transform only)
 *   data-scrub-words       slowa rozjasniaja sie w rytmie scrolla (manifest)
 *
 * Zasady twarde: elementy sa WIDOCZNE bez JS (stany poczatkowe nadaje gsap.set,
 * nie CSS) - brak JS albo reduced-motion oznacza po prostu strone bez ruchu.
 * Animujemy wylacznie transform / opacity / clip-path. Wszystko once: true poza
 * scrubami, ktore CZYTAJA scroll, nigdy go nie przejmuja.
 */
export function Reveals() {
  const pathname = usePathname();

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // -- wjazdy ------------------------------------------------------------
      const singles = gsap.utils.toArray<HTMLElement>('[data-reveal=""], [data-reveal="true"]');
      for (const el of singles) {
        gsap.fromTo(
          el,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      }

      const groups = gsap.utils.toArray<HTMLElement>('[data-reveal="group"]');
      for (const group of groups) {
        const kids = Array.from(group.children) as HTMLElement[];
        if (kids.length === 0) continue;
        gsap.fromTo(
          kids,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: { trigger: group, start: "top 86%", once: true },
          }
        );
      }

      // -- paralaksa kadrow ----------------------------------------------------
      const frames = gsap.utils.toArray<HTMLElement>("[data-parallax]");
      for (const el of frames) {
        const depth = parseFloat(el.dataset.parallax || "0.08");
        gsap.fromTo(
          el,
          { yPercent: -depth * 100 },
          {
            yPercent: depth * 100,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }

      // -- manifest: czytanie w rytmie scrolla --------------------------------
      const scrubbed = gsap.utils.toArray<HTMLElement>("[data-scrub-words]");
      for (const block of scrubbed) {
        const words = block.querySelectorAll<HTMLElement>("[data-word]");
        if (words.length === 0) continue;
        gsap.fromTo(
          words,
          { opacity: 0.22 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.06,
            scrollTrigger: {
              trigger: block,
              start: "top 78%",
              end: "bottom 45%",
              scrub: 0.4,
            },
          }
        );
      }

      return () => {
        // matchMedia sprzata tweeny; triggery dobijamy jawnie przy zmianie trasy
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    });

    return () => mm.revert();
    // pathname w zaleznosciach: nowa trasa = nowy skan DOM
  }, [pathname]);

  return null;
}
