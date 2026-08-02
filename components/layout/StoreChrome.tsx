"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Chowa sklepowy chrome (pasek, nagłówek, newsletter, stopka, szuflada koszyka)
 * na trasach panelu /panel/*, gdzie obowiązuje własna, pełnoekranowa skorupa admina.
 */
export function StoreChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/panel")) return null;
  return <>{children}</>;
}
