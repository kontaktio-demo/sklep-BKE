"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Product, ProductColor } from "./types";

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

// in-memory only for phase 1 - no localStorage (§12)
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addLine = useCallback((product: Product, color?: ProductColor) => {
    const chosen: ProductColor | undefined = color ?? product.colors[0];
    // colors may legitimately be empty once the backend lands - key on id alone then
    const key = chosen ? `${product.id}:${chosen.name}` : product.id;
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { key, product, color: chosen ?? null, qty: 1 }];
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty } : l))
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
