"use client";

import Link from "next/link";
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
import { COMPANY, TRUST_TRIAD } from "@/lib/nav";
import { SIZE_LABEL, WIDTH_LABEL } from "@/lib/sizes";
import type { Product, ProductColor } from "@/lib/types";
import { cn } from "@/lib/utils";

const TRUST_ICONS = [ShieldIcon, TruckIcon, ReturnIcon] as const;

const MAX_QTY = 10;

// jeden rytm dla wszystkich etykiet wyboru (Kolor / Rozmiar / Szerokość / Ilość)
const LABEL = "type-meta text-nf-dim";
const PILL =
  "inline-flex rounded-[2px] border border-nf-border-strong px-3 py-2 text-sm text-nf-text";

/** Zapytania jednostek nie ida przez koszyk - strona zapytania zyje w sekcji K9. */
const K9_INQUIRY_HREF = "/k9/zapytanie";

export function BuyBox({ product }: { product: Product }) {
  const { addLine, openCart } = useCart();
  const [color, setColor] = useState<ProductColor | undefined>(product.colors[0]);
  const [qty, setQty] = useState(1);

  const colorLabelId = useId();

  const k9 = product.line === "k9";

  // Zapytanie o dostepnosc idzie na skrzynke, ktora obsluguje dana linie
  const notifyEmail = k9 ? COMPANY.k9Email : COMPANY.shopEmail;
  const notifyHref = `mailto:${notifyEmail}?subject=${encodeURIComponent(
    `Dostępność: ${product.name} (${product.sku})`
  )}&body=${encodeURIComponent(
    [
      "Dzień dobry,",
      `proszę o wiadomość, gdy ${product.name} (SKU ${product.sku}) wróci do sprzedaży.`,
      color ? `Kolor: ${color.name}` : "",
    ]
      .filter(Boolean)
      .join("\n")
  )}`;

  function handleAdd() {
    // addLine increments by one per call - the cart has no bulk API
    for (let i = 0; i < qty; i += 1) addLine(product, color);
    openCart();
  }

  return (
    <div>
      <header>
        {/* K9: pasek techniczny zamiast etykiety sklepowej. SKU i oznaczenie klasy to
            pierwsze, czego szuka przewodnik - "Obroża służbowa / K9-PAT-175-L" nie niesie
            nic, czego nie ma w nazwie i tabeli */}
        {k9 ? (
          <p className={LABEL}>
            {product.sku}
            {product.k9Standard && (
              <>
                <span aria-hidden="true" className="px-2 text-nf-border-strong">
                  /
                </span>
                {product.k9Standard}
              </>
            )}
          </p>
        ) : (
          <p className={LABEL}>
            {product.productType} / {product.sku}
          </p>
        )}
        {/* text-balance: nazwa lamie sie w kolumnie 440 px, wiec wiersze maja byc rowne */}
        <h1 className="type-h1 mt-3 text-balance text-white">{product.name}</h1>
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
          <Button variant="primary" size="lg" className="w-full" onClick={handleAdd}>
            Dodaj do koszyka
          </Button>
        ) : (
          // Listy oczekujacych nie ma gdzie trzymac - serwis nie ma backendu ani wysylki.
          // Pole e-mail bylo atrapa: adres nigdzie nie szedl, a komunikat obiecywal
          // wiadomosc. Zostaje sciezka, ktora dziala: mail do sklepu z SKU w temacie.
          <div className="space-y-4">
            <Button variant="primary" size="lg" className="w-full" disabled>
              Chwilowo niedostępna
            </Button>
            <div className="space-y-2">
              <p className="text-xs leading-relaxed text-nf-muted">
                Listę oczekujących prowadzimy mailem. Napisz na {notifyEmail}, a odpiszemy,
                gdy model wróci do sprzedaży.
              </p>
              <Button
                href={notifyHref}
                variant="ghost"
                size="md"
                className="h-11 w-full sm:w-auto"
              >
                Napisz w sprawie dostępności
              </Button>
            </div>
          </div>
        )}

        {/* Jednostka nie kupuje sprzetu przez koszyk - kupuje na zapytanie. Link stoi pod
            CTA (nie obok), zeby nie rozbijac hierarchii, i dziala takze przy braku
            dostepnosci: wtedy zapytanie jest jedyna sensowna sciezka */}
        {k9 && (
          <Link
            href={K9_INQUIRY_HREF}
            className="type-meta mt-3 flex min-h-11 items-center justify-center rounded-[2px] text-nf-muted underline decoration-nf-border-strong underline-offset-4 transition-colors duration-250 ease-nf hover:text-white hover:decoration-nf-text motion-reduce:transition-none"
          >
            Zapytanie dla jednostki
          </Link>
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
