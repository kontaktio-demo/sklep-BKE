"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Ciemny jest WYLACZNIE swiat Dog Store Pro. Sklep cywilny, strona glowna, koszyk,
 * wyszukiwarka i strony informacyjne stoja na jasnym szarym - to dwie osobne kategorie
 * sklepu, nie dwa warianty tego samego.
 */
export function isDarkRoute(pathname: string): boolean {
  // Obejmuje tez wersje angielska z prefiksem: /en/pro, /en/pro/...
  const p = pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
  return p === "/pro" || p.startsWith("/pro/");
}

// Ustawia data-theme na <html>, zeby tlo POZA trescia (overscroll, obszar pod stopka)
// zgadzalo sie ze swiatem. Bez tego przy przewijaniu za krawedz przebija drugi motyw.
export function ThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkRoute(pathname)) {
      root.dataset.theme = "dark";
    } else {
      delete root.dataset.theme;
    }
  }, [pathname]);

  return null;
}
