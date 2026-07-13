"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const start = () => {
      if (lenis) return;
      gsap.registerPlugin(ScrollTrigger);
      // ignoreMobileResize: na telefonie chowanie i pokazywanie paska adresu zmienia wysokosc
      // viewportu, a kazda taka zmiana przeliczala piny w trakcie scrolla (skoki tresci)
      ScrollTrigger.config({ ignoreMobileResize: true });
      // allowNestedScroll - otherwise Lenis preventDefaults wheel events over the
      // drawers/dialog/sidebar scroll areas, making them wheel-unscrollable
      const instance = new Lenis({ allowNestedScroll: true });
      lenis = instance;
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
      lenis?.destroy();
      lenis = null;
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
