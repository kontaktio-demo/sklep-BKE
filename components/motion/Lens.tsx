"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./useReducedMotion";

interface LensProps {
  /** warstwa bazowa (zawsze widoczna) */
  children: ReactNode;
  /** warstwa odslaniana przez soczewke pod kursorem */
  reveal: ReactNode;
  className?: string;
  size?: number;
}

// Soczewka: pod kursorem odslania sie druga warstwa (np. ten sam naglowek w czerwieni
// na szrafurze). Bez rozmycia i bez poswiaty - twarde kolo, jak celownik.
// Dziala tylko przy myszy: na dotyku i przy reduced motion warstwa jest ukryta.
export function Lens({ children, reveal, className, size = 260 }: LensProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current;
    if (!root || !layer || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    // proxy + recznie dopisane px: GSAP animujac zmienne CSS gubi jednostki
    const state = { x: 0, y: 0, r: 0 };
    const apply = () => {
      layer.style.setProperty("--lens-x", `${state.x}px`);
      layer.style.setProperty("--lens-y", `${state.y}px`);
      layer.style.setProperty("--lens-r", `${state.r}px`);
    };
    apply();

    const onMove = (e: PointerEvent) => {
      const box = root.getBoundingClientRect();
      gsap.to(state, {
        x: e.clientX - box.left,
        y: e.clientY - box.top,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
        onUpdate: apply,
      });
    };
    const onEnter = () =>
      gsap.to(state, { r: size / 2, duration: 0.45, ease: "power3.out", onUpdate: apply });
    const onLeave = () =>
      gsap.to(state, { r: 0, duration: 0.35, ease: "power2.in", onUpdate: apply });

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, size]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {children}
      <div
        ref={layerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={
          {
            "--lens-x": "50%",
            "--lens-y": "50%",
            "--lens-r": "0px",
            WebkitMaskImage:
              "radial-gradient(circle var(--lens-r) at var(--lens-x) var(--lens-y), #000 99%, transparent 100%)",
            maskImage:
              "radial-gradient(circle var(--lens-r) at var(--lens-x) var(--lens-y), #000 99%, transparent 100%)",
          } as React.CSSProperties
        }
      >
        {reveal}
      </div>
    </div>
  );
}
