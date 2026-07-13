"use client";

import { useEffect, useRef, type ElementType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./useReducedMotion";

interface SplitLinesProps {
  lines: string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** animuj od razu po zamontowaniu (hero), zamiast czekac na scroll */
  immediate?: boolean;
}

// Wiersze naglowka wjezdzaja spod maski (kazdy w swoim oknie z overflow-hidden).
// Tekst jest w DOM od razu, wiec bez JS i przy reduced motion po prostu stoi na miejscu.
export function SplitLines({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  immediate = false,
}: SplitLinesProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const targets = root.querySelectorAll<HTMLElement>("[data-line-inner]");
    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { yPercent: 108 },
        {
          yPercent: 0,
          duration: 1.05,
          ease: "expo.out",
          stagger: 0.09,
          delay,
          clearProps: "transform",
          scrollTrigger: immediate
            ? undefined
            : { trigger: root, start: "top 85%", once: true },
        }
      );
    }, root);

    return () => ctx.revert();
  }, [reduced, delay, immediate]);

  return (
    <Tag ref={rootRef} className={className}>
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className="mask-line">
          <span data-line-inner className={cn("block", lineClassName)}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
