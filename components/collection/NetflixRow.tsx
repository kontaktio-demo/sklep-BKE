"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";
import { ProductCard } from "@/components/collection/ProductCard";

const DEFAULT_ITEM_CLASS = "w-[46vw] sm:w-[240px] lg:w-[270px]";
const CARD_SIZES = "(min-width:1024px) 270px, (min-width:640px) 240px, 46vw";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);
  return reduced;
}

// Lazy-mount below the fold (§10). Shared by NetflixRow and TopTenRow.
export function useLazyMount<T extends HTMLElement>(ref: RefObject<T | null>): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (mounted) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setMounted(true);
      },
      { rootMargin: "300px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [mounted, ref]);
  return mounted;
}

// Same li widths + paddings as the live track so row height is reserved (CLS ≈ 0).
export function RowSkeletonTrack({ itemClassName }: { itemClassName?: string }) {
  return (
    <div aria-hidden="true" className="flex gap-3 overflow-hidden px-4 py-4 md:px-6">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={cn("shrink-0", itemClassName ?? DEFAULT_ITEM_CLASS)}>
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="mt-3 h-4 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

interface DragState {
  active: boolean;
  pointerId: number;
  startX: number;
  startScroll: number;
  lastX: number;
  lastT: number;
  velocity: number; // px/ms, sign = pointer direction
  moved: number;
  suppressClick: boolean;
  raf: number;
}

// Shared horizontal track: native touch scroll + snap, mouse drag with inertia,
// hover arrows on lg+. Reused by TopTenRow.
export function RowScroller({
  children,
  itemClassName,
}: {
  children: ReactNode[];
  itemClassName?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const drag = useRef<DragState>({
    active: false,
    pointerId: -1,
    startX: 0,
    startScroll: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    moved: 0,
    suppressClick: false,
    raf: 0,
  });

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < max - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, children.length]);

  useEffect(() => {
    const d = drag.current;
    return () => cancelAnimationFrame(d.raf);
  }, []);

  const stopMomentum = () => cancelAnimationFrame(drag.current.raf);

  const restoreSnap = () => {
    const el = trackRef.current;
    if (el) el.style.scrollSnapType = "";
  };

  const startMomentum = (initialVelocity: number) => {
    const el = trackRef.current;
    if (!el) return;
    let velocity = initialVelocity;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      const before = el.scrollLeft;
      el.scrollLeft = before + velocity * dt;
      velocity *= Math.pow(0.94, dt / (1000 / 60));
      // stop when decayed or clamped at a scroll bound
      if (Math.abs(velocity) < 0.02 || el.scrollLeft === before) {
        restoreSnap();
        return;
      }
      drag.current.raf = requestAnimationFrame(step);
    };
    drag.current.raf = requestAnimationFrame(step);
  };

  // Mouse-only drag; touch keeps native scrolling + snap.
  const onPointerDown = (e: ReactPointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    stopMomentum();
    const d = drag.current;
    d.active = true;
    d.pointerId = e.pointerId;
    d.startX = e.clientX;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    d.startScroll = el.scrollLeft;
    d.velocity = 0;
    d.moved = 0;
    d.suppressClick = false;
    // scroll-snap fights manual scrollLeft writes mid-drag
    el.style.scrollSnapType = "none";
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d.active) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    el.scrollLeft = d.startScroll - dx;
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) {
      d.velocity = (e.clientX - d.lastX) / dt;
      d.lastX = e.clientX;
      d.lastT = e.timeStamp;
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLUListElement>, momentum: boolean) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.pointerId) return;
    d.active = false;
    const el = trackRef.current;
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    if (d.moved > 8) d.suppressClick = true;
    if (momentum && d.moved > 8 && !reducedRef.current && Math.abs(d.velocity) > 0.05) {
      startMomentum(-d.velocity);
    } else {
      restoreSnap();
    }
  };

  // one-shot: swallow the click that follows a real drag
  const onClickCapture = (e: ReactMouseEvent<HTMLUListElement>) => {
    if (!drag.current.suppressClick) return;
    drag.current.suppressClick = false;
    e.preventDefault();
    e.stopPropagation();
  };

  // block native image/link drag hijacking the custom drag
  const onDragStart = (e: ReactDragEvent<HTMLUListElement>) => {
    if (drag.current.active) e.preventDefault();
  };

  const scrollByAmount = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    stopMomentum();
    restoreSnap();
    el.scrollBy({
      left: dir * el.clientWidth * 0.8,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const arrowClass = (enabled: boolean, side: "left" | "right") =>
    cn(
      "absolute inset-y-4 z-10 hidden w-12 items-center justify-center bg-nf-bg/60 text-white backdrop-blur-sm transition-opacity duration-250 ease-nf hover:bg-nf-bg/80 lg:flex",
      side === "left" ? "left-0" : "right-0",
      enabled
        ? "opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
        : "pointer-events-none opacity-0"
    );

  return (
    <div className="group relative">
      {/* py-4 keeps card hover-scale from clipping */}
      <ul
        ref={trackRef}
        className="edge-fade-x no-scrollbar flex select-none snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-4 md:px-6 lg:cursor-grab"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e, true)}
        onPointerCancel={(e) => endDrag(e, false)}
        onClickCapture={onClickCapture}
        onDragStart={onDragStart}
        onWheel={stopMomentum}
      >
        {children.map((child, i) => (
          <li key={i} className={cn("shrink-0 snap-start", itemClassName ?? DEFAULT_ITEM_CLASS)}>
            {child}
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label="Przewiń w lewo"
        disabled={!canLeft}
        onClick={() => scrollByAmount(-1)}
        className={arrowClass(canLeft, "left")}
      >
        <ChevronLeftIcon width={24} height={24} />
      </button>
      <button
        type="button"
        aria-label="Przewiń w prawo"
        disabled={!canRight}
        onClick={() => scrollByAmount(1)}
        className={arrowClass(canRight, "right")}
      >
        <ChevronRightIcon width={24} height={24} />
      </button>
    </div>
  );
}

// §8-H [VERDICT: NEW, sanctioned Netflix layer §7-2] - horizontal category row.
export function NetflixRow({
  title,
  products,
  id,
  exploreHref,
}: {
  title: string;
  products: Product[];
  id?: string;
  exploreHref?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useLazyMount(sectionRef);

  if (products.length === 0) return null;

  return (
    <section ref={sectionRef} id={id} className="scroll-mt-24 space-y-3">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-baseline justify-between gap-4 px-4 md:px-6">
          <h2 className="font-display text-xl font-bold tracking-tight text-white md:text-2xl">
            {title}
          </h2>
          {exploreHref && (
            <Link
              href={exploreHref}
              className="inline-flex items-center gap-1 text-sm text-nf-muted transition-colors duration-250 ease-nf hover:text-white"
            >
              Zobacz wszystkie
              <ArrowRightIcon width={16} height={16} />
            </Link>
          )}
        </div>

        {mounted ? (
          <RowScroller>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} sizes={CARD_SIZES} />
            ))}
          </RowScroller>
        ) : (
          <RowSkeletonTrack />
        )}
      </div>
    </section>
  );
}
