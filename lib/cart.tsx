"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProduct } from "./data";
import type { Product, ProductColor } from "./types";

// Koszyk przezywa odswiezenie: localStorage trzyma wskazniki (slug + kolor + ilosc),
// a produkty odtwarzamy przez seam (getProduct), wiec ceny i nazwy zawsze sa aktualne,
// a pozycja wycofana z katalogu po prostu wypada z koszyka.
//
// SWIADOMY KOSZT: getProduct po stronie klienta wciaga katalog (lib/data/*.mock) do bundla
// przegladarki. Gdy seam wejdzie na Supabase, ten jeden import znika, a wskazniki rozwiazuje
// endpoint serwerowy - reszta pliku zostaje bez zmian.

export interface CartLine {
  key: string;
  product: Product;
  color: ProductColor | null;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (product: Product, color?: ProductColor) => void;
  removeLine: (key: string) => void;
  setQty: (key: string, qty: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "pakt-cart-v1";

/** Gorny limit sztuk na pozycje. Chroni tez przed smieciem wczytanym z localStorage. */
export const MAX_QTY = 99;

/** W pamieci trzymamy caly Product, ale zapisujemy sam wskaznik: slug + kolor + ilosc.
 *  Cena, nazwa i zdjecie zawsze pochodza z danych, wiec koszyk nie moze sie rozjechac
 *  z katalogiem po zmianie cennika. */
interface StoredLine {
  slug: string;
  color: string | null;
  qty: number;
}

function lineKey(product: Product, color: ProductColor | null): string {
  // kolory moga byc puste, gdy backend wejdzie do gry - wtedy kluczem jest samo id
  return color ? `${product.id}:${color.name}` : product.id;
}

/** Nieznany ksztalt z localStorage. Kazda pozycja przechodzi walidacje pola po polu,
 *  bo zawartosc moze pochodzic ze starszej wersji sklepu albo z recznej edycji. */
function readStored(): StoredLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry: unknown): StoredLine[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const { slug, color, qty } = entry as Record<string, unknown>;
      if (typeof slug !== "string" || slug.length === 0) return [];
      if (color !== null && typeof color !== "string") return [];
      if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1) return [];
      return [{ slug, color, qty: Math.min(qty, MAX_QTY) }];
    });
  } catch {
    // wylaczone localStorage albo uszkodzony JSON: koszyk startuje pusty, nic nie wybucha
    return [];
  }
}

/** Zlanie koszyka z dysku z tym, co zdazylo trafic do pamieci przed hydracja.
 *  Bierzemy wieksza ilosc, nie sume: efekt montujacy odpala sie w trybie deweloperskim
 *  dwa razy, a sumowanie podbijaloby ilosci przy kazdym przeladowaniu strony. */
function mergeLines(stored: CartLine[], pending: CartLine[]): CartLine[] {
  // Deduplikujemy ZAWSZE, takze przy pustym `pending`. Wczesniej byl tu wczesny return,
  // wiec zwykle odswiezenie strony omijalo Mape: dwie zapisane pozycje tego samego produktu
  // (np. z kolorem, ktory zniknal z katalogu i podstawil sie pierwszy dostepny) ladowaly
  // na tym samym kluczu i koszyk pokazywal dwa identyczne wiersze.
  const byKey = new Map<string, CartLine>();
  for (const line of stored) {
    const existing = byKey.get(line.key);
    byKey.set(
      line.key,
      existing
        ? { ...existing, qty: Math.min(existing.qty + line.qty, MAX_QTY) }
        : line
    );
  }
  for (const line of pending) {
    const existing = byKey.get(line.key);
    byKey.set(
      line.key,
      existing ? { ...existing, qty: Math.max(existing.qty, line.qty) } : line
    );
  }
  return [...byKey.values()];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // dopoki nie odczytamy dysku, nie wolno na niego pisac - inaczej pierwszy przebieg
  // efektu (lines === []) skasowalby zapisany koszyk
  const [hydrated, setHydrated] = useState(false);

  // Odczyt PO montazu, nie w initial state: serwer nie ma localStorage, wiec inicjalizacja
  // z dysku rozjechalaby pierwszy render z HTML-em z serwera (hydration mismatch).
  useEffect(() => {
    const stored = readStored();
    if (stored.length === 0) {
      setHydrated(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      const resolved = await Promise.all(
        stored.map(async (entry): Promise<CartLine | null> => {
          const product = await getProduct(entry.slug);
          // produkt zniknal z katalogu (wycofany, zmieniony slug) - pomijamy pozycje
          if (!product) return null;

          const color =
            product.colors.find((c) => c.name === entry.color) ?? product.colors[0] ?? null;

          return { key: lineKey(product, color), product, color, qty: entry.qty };
        })
      );

      if (cancelled) return;

      const valid = resolved.filter((line): line is CartLine => line !== null);
      // pozycje odrzucone przy walidacji znikaja tez z dysku: efekt zapisujacy nadpisze
      // klucz zaraz po tym, jak hydrated przejdzie na true
      setLines((pending) => mergeLines(valid, pending));
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      // pusty koszyk nie zostawia po sobie klucza - nie ma czego trzymac w przegladarce
      if (lines.length === 0) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const payload: StoredLine[] = lines.map((line) => ({
        slug: line.product.slug,
        color: line.color?.name ?? null,
        qty: line.qty,
      }));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // brak miejsca albo tryb prywatny: koszyk dziala dalej, tylko nie przezyje odswiezenia
    }
  }, [lines, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addLine = useCallback((product: Product, color?: ProductColor) => {
    const chosen: ProductColor | null = color ?? product.colors[0] ?? null;
    const key = lineKey(product, chosen);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, qty: Math.min(l.qty + 1, MAX_QTY) } : l
        );
      }
      return [...prev, { key, product, color: chosen, qty: 1 }];
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, MAX_QTY) } : l))
    );
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.product.price * l.qty, 0);
    return { lines, count, subtotal, isOpen, openCart, closeCart, addLine, removeLine, setQty };
  }, [lines, isOpen, openCart, closeCart, addLine, removeLine, setQty]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
