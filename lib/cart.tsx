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
import type { Product, ProductColor, ProductVariant } from "./types";

// Koszyk przezywa odswiezenie: localStorage trzyma wskazniki (slug + SKU wariantu + kolor
// + ilosc), a produkty odtwarzamy przez seam (getProduct), wiec ceny i nazwy zawsze sa
// aktualne, a pozycja wycofana z katalogu po prostu wypada z koszyka.
//
// POZYCJA = WARIANT. Rozmiar nie jest etykieta przy nazwie, tylko czescia tozsamosci
// pozycji: ma wlasne SKU, wlasna cene i wlasny stan magazynowy. Dwa rozmiary tego samego
// modelu to dwa wiersze koszyka, nie jeden z ilescia 2.
//
// SWIADOMY KOSZT: getProduct po stronie klienta wciaga katalog (lib/data/*.mock) do bundla
// przegladarki. Gdy seam wejdzie na Supabase, ten jeden import znika, a wskazniki rozwiazuje
// endpoint serwerowy - reszta pliku zostaje bez zmian.

export interface CartLine {
  key: string;
  product: Product;
  variant: ProductVariant;
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
  addLine: (product: Product, variant: ProductVariant, color?: ProductColor) => void;
  removeLine: (key: string) => void;
  setQty: (key: string, qty: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "pakt-cart-v2";

/** Klucz sprzed wariantow. Zapis v1 nie mial SKU rozmiaru, wiec nie da sie go odczytac
 *  bez zgadywania, ktory wariant klient mial na mysli. Zamiast zgadywac, kasujemy: stary
 *  koszyk ma zostac odrzucony, a nie zle odtworzony. */
const LEGACY_STORAGE_KEYS = ["pakt-cart-v1"] as const;

/** Gorny limit sztuk na pozycje. Chroni tez przed smieciem wczytanym z localStorage. */
export const MAX_QTY = 99;

/** W pamieci trzymamy caly Product i wariant, ale zapisujemy sam wskaznik:
 *  slug + SKU wariantu + kolor + ilosc. Cena, nazwa i zdjecie zawsze pochodza z danych,
 *  wiec koszyk nie moze sie rozjechac z katalogiem po zmianie cennika. */
interface StoredLine {
  slug: string;
  sku: string;
  color: string | null;
  qty: number;
}

function lineKey(
  product: Product,
  variant: ProductVariant,
  color: ProductColor | null
): string {
  // SKU wariantu jest w kluczu obowiazkowo - inaczej rozmiar M i L tego samego modelu
  // ladowalyby na jednym wierszu. Kolor bywa pusty, wtedy zostaje myslnik jako miejsce.
  return `${product.id}:${variant.sku}:${color ? color.name : "-"}`;
}

/** Zapis w starym formacie nie jest wart odczytu, ale nie ma tez powodu, zeby zalegal
 *  w przegladarce klienta. */
function dropLegacyStorage(): void {
  try {
    for (const key of LEGACY_STORAGE_KEYS) window.localStorage.removeItem(key);
  } catch {
    // wylaczone localStorage: nie ma czego sprzatac
  }
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
      const { slug, sku, color, qty } = entry as Record<string, unknown>;
      if (typeof slug !== "string" || slug.length === 0) return [];
      if (typeof sku !== "string" || sku.length === 0) return [];
      if (color !== null && typeof color !== "string") return [];
      if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1) return [];
      return [{ slug, sku, color, qty: Math.min(qty, MAX_QTY) }];
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
    dropLegacyStorage();

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

          // wariant zniknal (wycofany rozmiar, przebudowane SKU) - pozycji nie da sie
          // odtworzyc uczciwie, wiec wypada. Podstawienie innego rozmiaru byloby zmiana
          // zamowienia za plecami klienta
          const variant = product.variants.find((v) => v.sku === entry.sku);
          if (!variant) return null;

          const color =
            product.colors.find((c) => c.name === entry.color) ?? product.colors[0] ?? null;

          return {
            key: lineKey(product, variant, color),
            product,
            variant,
            color,
            qty: entry.qty,
          };
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
        sku: line.variant.sku,
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

  const addLine = useCallback(
    (product: Product, variant: ProductVariant, color?: ProductColor) => {
      const chosen: ProductColor | null = color ?? product.colors[0] ?? null;
      const key = lineKey(product, variant, chosen);
      setLines((prev) => {
        const existing = prev.find((l) => l.key === key);
        if (existing) {
          return prev.map((l) =>
            l.key === key ? { ...l, qty: Math.min(l.qty + 1, MAX_QTY) } : l
          );
        }
        return [...prev, { key, product, variant, color: chosen, qty: 1 }];
      });
    },
    []
  );

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
    // cena wariantu, nie cena "od" z produktu: rozmiar L kosztuje wiecej niz S
    const subtotal = lines.reduce((n, l) => n + l.variant.price * l.qty, 0);
    return { lines, count, subtotal, isOpen, openCart, closeCart, addLine, removeLine, setQty };
  }, [lines, isOpen, openCart, closeCart, addLine, removeLine, setQty]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
