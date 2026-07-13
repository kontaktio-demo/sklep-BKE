"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  VariantPicker,
  availabilityEmail,
  availabilityMailHref,
  defaultVariant,
} from "@/components/product/VariantPicker";
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
import { SIZE_SHORT, WIDTH_LABEL } from "@/lib/sizes";
import type { Product, ProductColor, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

const TRUST_ICONS = [ShieldIcon, TruckIcon, ReturnIcon] as const;

const MAX_QTY = 10;

// Jeden rytm dla wszystkich etykiet wyboru (Kolor / Rozmiar / Szerokość / Ilość), ale
// krojem rozstrzyga linia produktu: ten sam BuyBox stoi na karcie sklepu i na karcie K9.
// Monospace jest oznaczeniem technicznym sprzetu sluzbowego - w sklepie cywilnym etykieta
// pola ma byc etykieta pola (grotesk), a nie panelem katalogowym.
const LABEL_K9 = "type-meta text-nf-dim";
const LABEL_SHOP = "type-label text-nf-dim";
// pigulka szerokosci to ODCZYT, nie kontrolka - zostaje na linii dekoracyjnej
const PILL =
  "inline-flex rounded-[2px] border border-nf-border-strong px-3 py-2 text-sm text-nf-text";

/** Zapytania jednostek nie ida przez koszyk - strona zapytania zyje w sekcji K9. */
const K9_INQUIRY_HREF = "/k9/zapytanie";

export function BuyBox({ product }: { product: Product }) {
  const { addLine, openCart } = useCart();
  const [color, setColor] = useState<ProductColor | undefined>(product.colors[0]);
  // Cena, SKU i stan magazynowy naleza do WARIANTU, nie do produktu: naglowek karty
  // pokazuje to, co faktycznie trafi do koszyka, a nie cene "od".
  const [variant, setVariant] = useState<ProductVariant>(() => defaultVariant(product));
  const [qty, setQty] = useState(1);

  const colorLabelId = useId();

  const k9 = product.line === "k9";
  const label = k9 ? LABEL_K9 : LABEL_SHOP;

  // Zapytanie o dostepnosc idzie na skrzynke, ktora obsluguje dana linie, i dotyczy
  // wybranego rozmiaru - inaczej odpowiedz nie mowilaby o tym, o co pytal klient
  const notifyEmail = availabilityEmail(product);
  const notifyHref = availabilityMailHref(product, variant, color);

  // caly model wyprzedany to inna sytuacja niz jeden rozmiar bez stanu - komunikat rozroznia
  const modelSoldOut = !product.inStock;

  function handleAdd() {
    // addLine increments by one per call - the cart has no bulk API
    for (let i = 0; i < qty; i += 1) addLine(product, variant, color);
    openCart();
  }

  return (
    <div>
      <header>
        {/* K9: pasek techniczny zamiast etykiety sklepowej. SKU i oznaczenie klasy to
            pierwsze, czego szuka przewodnik - "Obroża służbowa / K9-PAT-175-L" nie niesie
            nic, czego nie ma w nazwie i tabeli */}
        {k9 ? (
          <p className={label}>
            {variant.sku}
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
          <p className={label}>
            {product.productType} / {variant.sku}
          </p>
        )}
        {/* text-balance: nazwa lamie sie w kolumnie 440 px, wiec wiersze maja byc rowne */}
        <h1 className="type-h1 mt-3 text-balance text-nf-white">{product.name}</h1>
        <p className="mt-3 text-sm text-nf-muted">{product.tagline}</p>
      </header>

      <div className="mt-6 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {/* cena wybranego rozmiaru, nie cena "od": PriceTag wnosi kolor (nf-white),
              dokładamy tylko skalę i wagę */}
          <PriceTag
            price={variant.price}
            fromPrice={false}
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
              variant.inStock ? "bg-nf-text" : "bg-nf-dim"
            )}
          />
          {variant.inStock
            ? "Dostępna, wysyłka w 24 h"
            : modelSoldOut
              ? "Chwilowo niedostępna"
              : `Rozmiar ${SIZE_SHORT[variant.size]} chwilowo niedostępny`}
        </p>

        {/* dane wybranego rozmiaru: po zmianie wariantu zmienia sie cena i SKU, wiec obwod
            i waga tez musza byc widoczne w tym samym miejscu, a nie dopiero w tabeli nizej.
            To ODCZYT, nie etykieta, wiec w sklepie idzie zwyklym tekstem: type-label
            wykrzyczalby "OBWÓD 30-38 CM" wersalikami bez powodu */}
        <p
          aria-live="polite"
          className={cn("text-nf-dim", k9 ? "type-meta" : "text-xs")}
        >
          Obwód {variant.neck} / waga {variant.weightGrams} g
        </p>
      </div>

      <div className="mt-8 space-y-7">
        {product.colors.length > 0 && (
          <div>
            <div className="flex items-baseline gap-3">
              <span id={colorLabelId} className={label}>
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

        <div>
          <VariantPicker
            variants={product.variants}
            selected={variant}
            onSelect={setVariant}
            mono={k9}
          />
          <a
            href="#rozmiary"
            className="mt-3 inline-flex min-h-11 items-center text-xs text-nf-muted underline underline-offset-4 transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
          >
            Tabela rozmiarów
          </a>
        </div>

        <div>
          <span className={cn("block", label)}>Szerokość</span>
          <span className={cn("mt-2", PILL)}>{WIDTH_LABEL[product.width]}</span>
        </div>

        <div>
          <span className={cn("block", label)}>Ilość</span>
          {/* nf-control, nie nf-border-strong: ta ramka jest JEDYNYM sygnalem, ze stepper
              jest kontrolka, wiec musi miec 3:1 (WCAG 1.4.11). Linie dekoracyjne zostaja ciche */}
          <div className="mt-2 inline-flex items-center rounded-[2px] border border-nf-control">
            <button
              type="button"
              aria-label="Zmniejsz ilość"
              onClick={() => setQty((n) => Math.max(1, n - 1))}
              disabled={qty <= 1}
              className="flex size-11 items-center justify-center text-nf-text transition-colors duration-250 ease-nf hover:text-nf-white disabled:opacity-40 motion-reduce:transition-none"
            >
              <MinusIcon width={16} height={16} />
            </button>
            <span
              aria-live="polite"
              className="min-w-10 text-center text-sm font-medium tabular-nums text-nf-white"
            >
              {qty}
            </span>
            <button
              type="button"
              aria-label="Zwiększ ilość"
              onClick={() => setQty((n) => Math.min(MAX_QTY, n + 1))}
              disabled={qty >= MAX_QTY}
              className="flex size-11 items-center justify-center text-nf-text transition-colors duration-250 ease-nf hover:text-nf-white disabled:opacity-40 motion-reduce:transition-none"
            >
              <PlusIcon width={16} height={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {variant.inStock ? (
          // danger, nie primary: czerwien jest akcentem marki i zostaje na jednym
          // przycisku pieniedzy w calym widoku
          <Button variant="danger" size="lg" className="w-full" onClick={handleAdd}>
            Dodaj do koszyka
          </Button>
        ) : (
          // Listy oczekujacych nie ma gdzie trzymac - serwis nie ma backendu ani wysylki.
          // Pole e-mail bylo atrapa: adres nigdzie nie szedl, a komunikat obiecywal
          // wiadomosc. Zostaje sciezka, ktora dziala: mail ze SKU wariantu w temacie.
          <div className="space-y-4">
            <Button variant="danger" size="lg" className="w-full" disabled>
              {modelSoldOut
                ? "Chwilowo niedostępna"
                : `Rozmiar ${SIZE_SHORT[variant.size]} niedostępny`}
            </Button>
            <div className="space-y-2">
              <p className="text-xs leading-relaxed text-nf-muted">
                {modelSoldOut
                  ? `Listę oczekujących prowadzimy mailem. Napisz na ${notifyEmail}, a odpiszemy, gdy model wróci do sprzedaży.`
                  : `Pozostałe rozmiary tego modelu są dostępne. Listę oczekujących na rozmiar ${SIZE_SHORT[variant.size]} prowadzimy mailem: napisz na ${notifyEmail}, a odpiszemy, gdy wróci do sprzedaży.`}
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
            className="type-meta mt-3 flex min-h-11 items-center justify-center rounded-[2px] text-nf-muted underline decoration-nf-border-strong underline-offset-4 transition-colors duration-250 ease-nf hover:text-nf-white hover:decoration-nf-text motion-reduce:transition-none"
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
