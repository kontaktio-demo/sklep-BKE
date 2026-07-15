"use client";

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useState, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll zrobiony TAK, zeby nie wrocila "guma" sprzed usuniecia Lenisa - i tak,
 * zeby NIE przemontowywac calej aplikacji:
 *
 *  1. Korzen to ZAWSZE <>{children}</> (staly typ). Lenis powstaje i ginie IMPERATYWNIE
 *     w efekcie, a nie przez podmiane elementu opakowujacego. Wczesniej korzen zmienial
 *     sie z Fragmentu na <ReactLenis> po pierwszym efekcie klienta - React niszczyl i
 *     montowal od nowa cale poddrzewo (blysk hero, restart reveali, reset stanu koszyka).
 *  2. Jeden zegar. Lenis nie ma wlasnego rAF (autoRaf:false); napedza go ticker GSAP z
 *     lagSmoothing(0). Dwa niezalezne rAF-y rozjezdzaly sie przy ciezkich klatkach i
 *     scroll robil sie ciagliwy.
 *  3. Krotki lerp (0.12) i syncTouch wylaczone - na dotyku zostaje scroll natywny.
 *  4. prefers-reduced-motion (oraz pierwszy render/SSR): Lenis w ogole nie powstaje,
 *     strona jedzie na scrollu natywnym. Nic do przemontowania, bo korzen sie nie zmienia.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced !== false) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.12, syncTouch: false });
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(update);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
