"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll zrobiony TAK, zeby nie wrocila "guma" sprzed usuniecia Lenisa:
 *
 *  1. Jeden zegar. Lenis NIE ma wlasnego rAF (autoRaf: false) - napedza go ticker
 *     GSAP z lagSmoothing(0). Poprzednio dwa niezalezne rAF-y (Lenis + ScrollTrigger)
 *     potrafily sie rozjezdzac przy ciezkich klatkach i scroll robil sie ciagliwy.
 *  2. Krotki lerp (0.12) i syncTouch wylaczone: na dotyku zostaje scroll natywny -
 *     przejmowanie scrolla na mobile to najszybsza droga do zacinania.
 *  3. Zadnych zywych filtrow ani animacji layoutu w tресci - wszystko, co scroll
 *     napotyka, to transform/opacity na kompozytorze.
 *  4. prefers-reduced-motion: Lenis w ogole sie nie montuje, strona zostaje na
 *     scrollu natywnym, a kazdy efekt GSAP owija gsap.matchMedia().
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef | null>(null);
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

    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, [reduced]);

  // reduced === null (pierwszy render, SSR): scroll natywny, zero mrugniecia.
  // reduced === true: scroll natywny na stale.
  if (reduced !== false) return <>{children}</>;

  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.12, syncTouch: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
