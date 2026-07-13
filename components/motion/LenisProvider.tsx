"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Plynne przewijanie i tyle. Zadnych animacji wjazdu, pinowania sekcji ani maskowanych
// naglowkow - to byla dekoracja, ktora udawala projekt. Razem z nimi wylecial GSAP:
// jedyne, co jeszcze robil, to napedzanie petli klatek, a do tego wystarczy
// requestAnimationFrame.
//
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

    let frame = 0;

    const start = () => {
      if (current) return;
      // allowNestedScroll - inaczej Lenis przechwytuje wheel nad szufladami i dialogami,
      // przez co ich tresci nie da sie przewijac kolkiem
      const instance = new Lenis({ allowNestedScroll: true });
      current = instance;

      const raf = (time: number) => {
        instance.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    };

    const stop = () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
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
