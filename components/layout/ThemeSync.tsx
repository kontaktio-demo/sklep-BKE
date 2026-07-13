"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Trasy w motywie jasnym. Reszta sklepu (kolekcja, produkty, K9) zostaje ciemna. */
export function isLightRoute(pathname: string): boolean {
  return pathname === "/";
}

// Ustawia data-theme na <html>, zeby tlo za trescia (overscroll, obszar pod stopka)
// zgadzalo sie z motywem strony. Bez tego przy przewijaniu za krawedz przebija grafit.
export function ThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (isLightRoute(pathname)) {
      root.dataset.theme = "light";
    } else {
      delete root.dataset.theme;
    }
  }, [pathname]);

  return null;
}
