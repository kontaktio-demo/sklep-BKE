"use client";

import { products } from "./products.mock";
import { proProducts } from "./pro.mock";
import type { Product } from "../types";

// Client-safe rozwiązywanie produktów dla KOSZYKA (rehydracja pozycji ze wskaźników
// w localStorage). NIE importuje warstwy serwerowej (Supabase/service_role), więc nie
// wciąga sekretów do bundla przeglądarki.
//
// Źródło: najpierw publiczny endpoint katalogu (realna baza), z fallbackiem na mock
// (offline/dev). Koszyk i tak jest RE-WYCENIANY na serwerze przy kasie — cena z klienta
// nigdy nie jest zaufana (wzorzec z działającego sklepu).
const mockAll = [...products.filter((p) => p.line === "shop"), ...proProducts];

function fromMock(slug: string): Product | null {
  return mockAll.find((p) => p.slug === slug) ?? null;
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/catalog/product/${encodeURIComponent(slug)}`, {
      headers: { accept: "application/json" },
    });
    if (res.ok) {
      const data = (await res.json()) as { product: Product | null };
      return data.product ?? null;
    }
  } catch {
    // brak API / offline → mock
  }
  return fromMock(slug);
}
