"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { PriceTag } from "@/components/ui/PriceTag";
import {
  MinusIcon,
  PlusIcon,
  ReturnIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/ui/icons";
import { useCart } from "@/lib/cart";
import { TRUST_TRIAD } from "@/lib/nav";
import type { CollarSize, CollarWidth, Product, ProductColor } from "@/lib/types";
import { cn } from "@/lib/utils";

const WIDTH_LABEL: Record<CollarWidth, string> = {
  "1": "2,5 cm",
  "1.5": "4 cm",
  "1.75": "4,5 cm",
};

const SIZE_LABEL: Record<CollarSize, string> = {
  small: "Mały (obwód 28-36 cm)",
  medium: "Średni (38-46 cm)",
  large: "Duży (48-60 cm)",
};

const TRUST_ICONS = [ShieldIcon, TruckIcon, ReturnIcon] as const;

const MAX_QTY = 10;

// jeden rytm dla wszystkich etykiet wyboru (Kolor / Rozmiar / Szerokość / Ilość)
const LABEL = "text-[10px] uppercase tracking-[0.2em] text-nf-dim";
const PILL =
  "inline-flex rounded-[2px] border border-nf-border-strong px-3 py-2 text-sm text-nf-text";

export function BuyBox({ product }: { product: Product }) {
  const { addLine, openCart } = useCart();
  const [color, setColor] = useState<ProductColor | undefined>(product.colors[0]);
  const [qty, setQty] = useState(1);
  const [notified, setNotified] = useState(false);

  const colorLabelId = useId();
  const notifyId = useId();

  function handleAdd() {
    // addLine increments by one per call - the cart has no bulk API
    for (let i = 0; i < qty; i += 1) addLine(product, color);
    openCart();
  }

  return (
    <div>
      <header>
        <p className={LABEL}>
          {product.productType} / {product.sku}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tight text-white lg:text-[2.5rem]">
          {product.name}
        </h1>
        <p className="mt-3 text-sm text-nf-muted">{product.tagline}</p>
      </header>

      <div className="mt-6 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {/* PriceTag wnosi kolor (nf-white) - dokładamy tylko skalę i wagę */}
          <PriceTag
            price={product.price}
            fromPrice={product.fromPrice}
            currency={product.currency}
            className="text-2xl font-semibold"
          />
          {product.fromPrice && (
            <span className="text-xs text-nf-dim">cena zależy od rozmiaru</span>
          )}
        </div>

        {/* kropka zamiast ikony - ikony zostają w pasku zaufania pod CTA */}
        <p className="flex items-center gap-2 text-sm text-nf-muted">
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              product.inStock ? "bg-nf-text" : "bg-nf-dim"
            )}
          />
          {product.inStock ? "Dostępna, wysyłka w 24 h" : "Chwilowo niedostępna"}
        </p>
      </div>

      <div className="mt-8 space-y-7">
        {product.colors.length > 0 && (
          <div>
            <div className="flex items-baseline gap-3">
              <span id={colorLabelId} className={LABEL}>
                Kolor
              </span>
              <span className="text-sm text-nf-text">{color?.name}</span>
            </div>
            <div
              role="group"
              aria-labelledby={colorLabelId}
              className="mt-2 flex flex-wrap gap-1"
            >
              {product.colors.map((c) => (
                <ColorSwatch
                  key={c.name}
                  color={c}
                  size="md"
                  selected={c.name === color?.name}
                  onSelect={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        )}

        <dl className="space-y-7">
          <div>
            <dt className={LABEL}>Rozmiar</dt>
            <dd className="mt-2 flex flex-wrap items-center gap-3">
              <span className={PILL}>{SIZE_LABEL[product.size]}</span>
              <a
                href="#rozmiary"
                className="text-xs text-nf-muted underline underline-offset-4 transition-colors duration-250 ease-nf hover:text-white"
              >
                Tabela rozmiarów
              </a>
            </dd>
          </div>
          <div>
            <dt className={LABEL}>Szerokość</dt>
            <dd className="mt-2">
              <span className={PILL}>{WIDTH_LABEL[product.width]}</span>
            </dd>
          </div>
        </dl>

        <div>
          <span className={cn("block", LABEL)}>Ilość</span>
          <div className="mt-2 inline-flex items-center rounded-[2px] border border-nf-border-strong">
            <button
              type="button"
              aria-label="Zmniejsz ilość"
              onClick={() => setQty((n) => Math.max(1, n - 1))}
              disabled={qty <= 1}
              className="flex size-11 items-center justify-center text-nf-text transition-colors duration-250 ease-nf hover:text-white disabled:opacity-40 motion-reduce:transition-none"
            >
              <MinusIcon width={16} height={16} />
            </button>
            <span
              aria-live="polite"
              className="min-w-10 text-center text-sm font-medium tabular-nums text-white"
            >
              {qty}
            </span>
            <button
              type="button"
              aria-label="Zwiększ ilość"
              onClick={() => setQty((n) => Math.min(MAX_QTY, n + 1))}
              disabled={qty >= MAX_QTY}
              className="flex size-11 items-center justify-center text-nf-text transition-colors duration-250 ease-nf hover:text-white disabled:opacity-40 motion-reduce:transition-none"
            >
              <PlusIcon width={16} height={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {product.inStock ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-[2px]"
            onClick={handleAdd}
          >
            Dodaj do koszyka
          </Button>
        ) : (
          <div className="space-y-4">
            <Button variant="primary" size="lg" className="w-full rounded-[2px]" disabled>
              Chwilowo niedostępna
            </Button>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setNotified(true);
              }}
              className="space-y-2"
            >
              <label htmlFor={notifyId} className="block text-xs text-nf-muted">
                Zostaw adres e-mail, a wyślemy wiadomość, gdy obroża wróci do sprzedaży.
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id={notifyId}
                  type="email"
                  required
                  autoComplete="email"
                  className="h-11 flex-1 rounded-[2px] border border-nf-border-strong bg-transparent px-3 text-sm text-white"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="md"
                  className="h-11 shrink-0 rounded-[2px]"
                >
                  Powiadom o dostępności
                </Button>
              </div>
              <p aria-live="polite" className="min-h-5 text-xs text-nf-muted">
                {notified ? "Damy znać, gdy wróci." : ""}
              </p>
            </form>
          </div>
        )}
      </div>

      <ul className="mt-8 flex flex-col gap-3 border-t border-nf-border pt-5 sm:flex-row sm:justify-between sm:gap-4">
        {TRUST_TRIAD.map((item, i) => {
          const Icon = TRUST_ICONS[i] ?? ShieldIcon;
          return (
            <li key={item} className="flex items-center gap-2 text-xs text-nf-muted">
              <Icon width={16} height={16} className="shrink-0 text-nf-dim" />
              {item}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
