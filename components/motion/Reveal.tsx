"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: number;
  selector?: string;
  as?: "div" | "section" | "ul";
}

// Content stays visible without JS / with reduced motion: initial hidden state
// is only applied inside the effect (gsap.fromTo), never in CSS or SSR markup.
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  stagger = 0,
  selector,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const targets: Element | Element[] = selector
      ? Array.from(el.querySelectorAll(selector))
      : el;
    if (Array.isArray(targets) && targets.length === 0) return;

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        delay,
        stagger,
        // filtered/re-rendered children must not inherit stale inline styles
        clearProps: "opacity,transform",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(targets, { clearProps: "opacity,transform" });
    };
  }, [delay, y, stagger, selector]);

  const setRef = (node: HTMLElement | null) => {
    ref.current = node;
  };

  return (
    <Tag ref={setRef} className={className}>
      {children}
    </Tag>
  );
}
