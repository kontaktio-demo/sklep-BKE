"use client";

import { useEffect, useState } from "react";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/nav";

/**
 * Próg darmowej dostawy po stronie klienta — z tego samego źródła co kasa
 * (settings.free_shipping_grosze przez /api/settings/public). Dzięki temu pasek w koszyku
 * obiecuje dokładnie to, co naliczy kasa. Cache modułowy: jeden fetch na sesję strony.
 * Fallback: stała z lib/nav (149 zł).
 */
let cached: number | null = null;
let inflight: Promise<number> | null = null;

export function fetchFreeShippingThreshold(): Promise<number> {
  if (cached != null) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch("/api/settings/public")
      .then((r) => r.json())
      .then((d) => {
        const g = (d as { free_shipping_grosze?: number })?.free_shipping_grosze;
        cached = typeof g === "number" && g > 0 ? Math.round(g / 100) : FREE_SHIPPING_THRESHOLD;
        return cached;
      })
      .catch(() => FREE_SHIPPING_THRESHOLD);
  }
  return inflight;
}

export function useFreeShippingThreshold(): number {
  const [value, setValue] = useState<number>(cached ?? FREE_SHIPPING_THRESHOLD);
  useEffect(() => {
    let live = true;
    void fetchFreeShippingThreshold().then((v) => {
      if (live) setValue(v);
    });
    return () => {
      live = false;
    };
  }, []);
  return value;
}
