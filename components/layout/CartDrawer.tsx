"use client";

// §8-C [VERDICT: NSDW] - right drawer, cross-sell strip, trust row
//
// Bez paska metod platnosci: w sklepie nie ma kasy, zamowienie skladamy mailem. Ikony
// BLIK-a i kart nad przyciskiem obiecywalyby platnosc, ktorej nie ma.

import Image from "next/image";
import Link from "next/link";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import {
  CartIcon,
  MinusIcon,
  PlusIcon,
  ReturnIcon,
  ShieldIcon,
  TrashIcon,
  TruckIcon,
} from "@/components/ui/icons";
import { PriceTag } from "@/components/ui/PriceTag";
import { useCart } from "@/lib/cart";
import { COMPANY, TRUST_TRIAD } from "@/lib/nav";
import { productHref } from "@/lib/routes";
import { SIZE_SHORT } from "@/lib/sizes";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const TRUST_ICONS = [ShieldIcon, TruckIcon, ReturnIcon];

const STEPPER_BUTTON_CLASSES =
  "flex h-11 w-11 items-center justify-center text-nf-muted transition-colors duration-250 ease-nf hover:text-nf-white";

function EmptyState({ onShop }: { onShop: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <CartIcon width={48} height={48} className="text-nf-dim" />
      {/* bez font-bold: Fjalla One ma jedna wage, wiec przegladarka robila tu sztuczne
          pogrubienie (rozmyty, rozlazly krój) */}
      <p className="font-display text-xl uppercase text-nf-white">Twój koszyk jest pusty</p>
      {/* Button renders a Link when href is set and drops onClick - the wrapper
          catches the bubbled click (mouse and keyboard) to close the drawer */}
      <span onClick={onShop}>
        <Button href="/collections/collars">Zobacz obroże</Button>
      </span>
    </div>
  );
}

function CartFooter({ subtotal, onGoToCart }: { subtotal: number; onGoToCart: () => void }) {
  return (
    <div className="space-y-4 px-5 py-4">
      <ul className="flex items-center justify-between gap-2 text-[10px] text-nf-muted">
        {TRUST_TRIAD.map((label, i) => {
          const Icon = TRUST_ICONS[i] ?? ShieldIcon;
          return (
            <li key={label} className="flex items-center gap-1.5">
              <Icon width={14} height={14} className="shrink-0 text-nf-dim" />
              {label}
            </li>
          );
        })}
      </ul>
      <FreeShippingBar subtotal={subtotal} />
      <div className="flex items-center justify-between text-sm font-semibold text-nf-white">
        <span>Razem</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <p className="text-xs leading-relaxed text-nf-dim">
        Cena zawiera VAT. Koszt dostawy naliczany przy zamówieniu. Zamówienie składasz mailem
        na {COMPANY.shopEmail} - wiadomość z pozycjami i sumą przygotujesz w koszyku.
      </p>
      {/* Przycisk prowadzi tam, gdzie zamowienie da sie zlozyc: na strone koszyka. Button
          z href renderuje Link i przekazuje onClick - szuflada zamyka sie przy przejsciu,
          zeby nie zostac otwarta nad strona koszyka */}
      <Button href="/koszyk" onClick={onGoToCart} className="w-full">
        Przejdź do koszyka
      </Button>
    </div>
  );
}

export function CartDrawer({ crossSell }: { crossSell: Product[] }) {
  const { lines, subtotal, isOpen, closeCart, removeLine, setQty } = useCart();

  const inCart = new Set(lines.map((line) => line.product.id));
  const suggestions = crossSell.filter((p) => !inCart.has(p.id)).slice(0, 4);
  const isEmpty = lines.length === 0;

  return (
    <Drawer
      open={isOpen}
      onClose={closeCart}
      side="right"
      title="Twój koszyk"
      footer={
        isEmpty ? undefined : <CartFooter subtotal={subtotal} onGoToCart={closeCart} />
      }
    >
      {isEmpty ? (
        <EmptyState onShop={closeCart} />
      ) : (
        <div className="px-5 pb-6">
          <ul className="divide-y divide-nf-border">
            {lines.map((line) => {
              const name = `${line.product.name}, rozmiar ${SIZE_SHORT[line.variant.size]}`;
              return (
                <li key={line.key} className="flex gap-4 py-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[2px] bg-nf-elevated">
                    <Image
                      src={line.product.images[0]}
                      alt={line.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-nf-text">
                          {line.product.name}
                        </p>
                        {/* rozmiar przed kolorem: to on decyduje o cenie, SKU i stanie */}
                        <p className="text-xs text-nf-muted">
                          {SIZE_SHORT[line.variant.size]} ({line.variant.neck})
                          {line.color ? `, ${line.color.name}` : ""}
                        </p>
                        <p className="type-label mt-1 truncate text-nf-dim">
                          {line.variant.sku}
                        </p>
                        {!line.variant.inStock && (
                          <p className="mt-1 text-xs text-nf-red-bright">
                            Rozmiar chwilowo niedostępny
                          </p>
                        )}
                      </div>
                      {/* cena wariantu - koszyk nie zna ceny "od" */}
                      <PriceTag
                        price={line.variant.price}
                        fromPrice={false}
                        currency={line.product.currency}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      {/* nf-control: ramka steppera jest jedynym sygnalem kontrolki (WCAG 1.4.11) */}
                      <div className="flex items-center rounded-[2px] border border-nf-control">
                        <button
                          type="button"
                          aria-label={`Zmniejsz ilość: ${name}`}
                          onClick={() => setQty(line.key, line.qty - 1)}
                          className={STEPPER_BUTTON_CLASSES}
                        >
                          <MinusIcon width={16} height={16} />
                        </button>
                        <span className="min-w-6 text-center text-sm text-nf-text">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Zwiększ ilość: ${name}`}
                          onClick={() => setQty(line.key, line.qty + 1)}
                          className={STEPPER_BUTTON_CLASSES}
                        >
                          <PlusIcon width={16} height={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Usuń ${name}`}
                        onClick={() => removeLine(line.key)}
                        className="flex h-11 w-11 items-center justify-center text-nf-dim transition-colors duration-250 ease-nf hover:text-nf-white"
                      >
                        <TrashIcon width={18} height={18} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {suggestions.length > 0 && (
            <section aria-label="Do kompletu" className="mt-2 border-t border-nf-border pt-5">
              <h3 className="type-label text-nf-dim">Do kompletu</h3>
              <ul className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
                {suggestions.map((product) => (
                  <li key={product.id} className="w-32 shrink-0">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-nf-elevated">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-2 truncate text-xs text-nf-text">{product.name}</p>
                    <PriceTag
                      price={product.price}
                      fromPrice={product.fromPrice}
                      currency={product.currency}
                    />
                    {/* Wczesniej byl tu przycisk "Dodaj", ktory wrzucal produkt bez rozmiaru.
                        Kazda pozycja koszyka to konkretny wariant, wiec podpowiedz prowadzi
                        na karte produktu, gdzie rozmiar wybiera klient, a nie sklep za niego.
                        productHref, nie sklejanie /products/<slug>: pozycja z linii Pro zyje
                        pod /pro/produkt/<slug>, wiec reczny adres prowadzil w 404.
                        nf-control: to przycisk konturowy, jego ramka jest jedynym sygnalem
                        kontrolki (WCAG 1.4.11) */}
                    <Link
                      href={productHref(product)}
                      onClick={closeCart}
                      className="mt-2 flex h-11 w-full items-center justify-center rounded-[2px] border border-nf-control text-xs font-semibold text-nf-white transition-colors duration-250 ease-nf hover:border-nf-control-hover hover:bg-nf-elevated-2 motion-reduce:transition-none"
                    >
                      Wybierz rozmiar
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
}
