"use client";

import { useId } from "react";
import { COMPANY } from "@/lib/nav";
import { SIZE_NAME, SIZE_SHORT } from "@/lib/sizes";
import type { Product, ProductColor, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

// Wybor rozmiaru to wybor WARIANTU: kazdy ma wlasne SKU, cene i stan magazynowy.
// Karta produktu i szybki podglad musza pokazywac dokladnie to samo, wiec kontrolka
// i tresc zapytania o dostepnosc stoja w jednym module, a nie w dwoch kopiach.
//
// Natywne input[type=radio] w fieldset zamiast role="radiogroup":
// strzalki, przeskakiwanie pozycji wylaczonych, oglaszanie "1 z 3" i stan disabled
// dostajemy od przegladarki. Rola ARIA wymagalaby recznej obslugi klawiatury,
// ktora i tak odtwarzalaby zachowanie natywne, tylko gorzej.

/** Pierwszy dostepny wariant. Gdy caly model jest wyprzedany, zwraca pierwszy z listy:
 *  cena i SKU maja co pokazac, a CTA i tak jest wtedy wylaczony. */
export function defaultVariant(product: Product): ProductVariant {
  return product.variants.find((v) => v.inStock) ?? product.variants[0];
}

/** Skrzynka obslugujaca dana linie: sklep i K9 maja osobne adresy. */
export function availabilityEmail(product: Product): string {
  return product.line === "k9" ? COMPANY.k9Email : COMPANY.shopEmail;
}

/** Zapytanie o dostepnosc dotyczy konkretnego rozmiaru, nie modelu: bez SKU wariantu
 *  odpowiedz "wrocilo do sprzedazy" nie mowi, czy wrocilo to, o co pytal klient. */
export function availabilityMailHref(
  product: Product,
  variant: ProductVariant,
  color?: ProductColor
): string {
  const subject = `Dostępność: ${product.name} (${variant.sku})`;
  const body = [
    "Dzień dobry,",
    `proszę o wiadomość, gdy ${product.name} w rozmiarze ${SIZE_SHORT[variant.size]} (${variant.neck}), SKU ${variant.sku}, wróci do sprzedaży.`,
    color ? `Kolor: ${color.name}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `mailto:${availabilityEmail(product)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export function VariantPicker({
  variants,
  selected,
  onSelect,
  density = "md",
  className,
}: {
  variants: ProductVariant[];
  selected: ProductVariant;
  onSelect: (variant: ProductVariant) => void;
  density?: "sm" | "md";
  className?: string;
}) {
  // grupa radio potrzebuje wlasnej nazwy - dwie kontrolki na jednej stronie
  // (karta produktu i szybki podglad) nie moga sie o nia bic
  const name = useId();

  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="type-meta p-0 text-nf-dim">Rozmiar</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((variant) => {
          const checked = variant.sku === selected.sku;
          return (
            <label
              key={variant.sku}
              title={variant.inStock ? undefined : "Rozmiar niedostępny"}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-[2px] border text-center transition-colors duration-250 ease-nf motion-reduce:transition-none",
                // 44px celu dotykowego bierze sie z min-h-11, nie z paddingu
                density === "sm"
                  ? "min-h-11 min-w-16 px-2.5 py-1.5"
                  : "min-h-11 min-w-[4.75rem] px-3 py-2",
                // obwodka fokusu siada na etykiecie, bo sam input jest przyciety przez sr-only
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-white",
                variant.inStock
                  ? "cursor-pointer border-nf-border-strong text-nf-text hover:border-white"
                  : "cursor-not-allowed border-nf-border text-nf-dim line-through",
                // czerwona krawedz = stan aktywny; przy wybranym niedostepnym zostaje
                // przekreslenie, wiec wybor nie udaje dostepnosci
                checked && "border-nf-red",
                checked && variant.inStock && "text-white"
              )}
            >
              {/* Wyprzedany rozmiar zostaje WYBIERALNY (aria-disabled, nie disabled).
                  Z disabled klient chcacy rozmiar L nie mial jak o niego zapytac: sciezka
                  "napisz w sprawie dostepnosci" dotyczy konkretnego wariantu, a nie dalo sie
                  go zaznaczyc. Blokada siedzi na przycisku dodania do koszyka, nie na wyborze. */}
              <input
                type="radio"
                name={name}
                value={variant.sku}
                checked={checked}
                aria-disabled={!variant.inStock}
                onChange={() => onSelect(variant)}
                className="sr-only"
              />
              <span
                className={cn(
                  "font-semibold leading-none",
                  density === "sm" ? "text-sm" : "text-base"
                )}
              >
                {SIZE_SHORT[variant.size]}
              </span>
              <span
                className={cn(
                  "mt-1 leading-none text-nf-dim",
                  density === "sm" ? "text-[10px]" : "text-xs"
                )}
              >
                {variant.neck}
              </span>
              {/* czytnik ekranu dostaje pelna nazwe rozmiaru i stan - samo "S" i kreska nie wystarcza */}
              <span className="sr-only">
                {SIZE_NAME[variant.size]}
                {variant.inStock ? "" : ", chwilowo niedostępny"}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
