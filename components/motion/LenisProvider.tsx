"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Instancja jest wystawiona modulowo, bo blokada scrolla w nakladkach musi ja zatrzymac.
// Lenis przewija strone PROGRAMOWO (window.scrollTo w reakcji na wheel), a body { overflow:
// hidden } blokuje tylko przewijanie inicjowane przez przegladarke - przy otwartym koszyku
// tlo pod spodem dalej uciekalo.
let current: Lenis | null = null;

/** Wstrzymuje smooth scroll (nakladki). Bezpieczne, gdy Lenis nie dziala (reduced motion). */
export function pauseSmoothScroll(): void {
  current?.stop();
}

export function resumeSmoothScroll(): void {
  current?.start();
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    let tick: ((time: number) => void) | null = null;

    const start = () => {
      if (current) return;
      gsap.registerPlugin(ScrollTrigger);
      // ignoreMobileResize: na telefonie chowanie i pokazywanie paska adresu zmienia wysokosc
      // viewportu, a kazda taka zmiana przeliczala piny w trakcie scrolla (skoki tresci)
      ScrollTrigger.config({ ignoreMobileResize: true });
      // allowNestedScroll - inaczej Lenis przechwytuje wheel nad szufladami i dialogami,
      // przez co ich tresci nie da sie przewijac kolkiem
      const instance = new Lenis({ allowNestedScroll: true });
      current = instance;
      instance.on("scroll", ScrollTrigger.update);
      tick = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };

    const stop = () => {
      if (tick) {
        gsap.ticker.remove(tick);
        tick = null;
      }
      // restore GSAP's default lag smoothing when handing back native scroll
      gsap.ticker.lagSmoothing(500, 33);
      current?.destroy();
      current = null;
    };

    const sync = () => {
      if (mql.matches) stop();
      else start();
    };

    sync();
    mql.addEventListener("change", sync);

    return () => {
      mql.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return <>{children}</>;
}
