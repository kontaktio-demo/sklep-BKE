"use client";

// §8-C [VERDICT: NSDW] - right drawer, cross-sell strip, trust + payment rows

import Image from "next/image";
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
import { TRUST_TRIAD } from "@/lib/nav";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { PaymentIcons } from "./PaymentIcons";

const TRUST_ICONS = [ShieldIcon, TruckIcon, ReturnIcon];

const STEPPER_BUTTON_CLASSES =
  "flex h-11 w-11 items-center justify-center text-nf-muted transition-colors duration-250 ease-nf hover:text-white";

function EmptyState({ onShop }: { onShop: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <CartIcon width={48} height={48} className="text-nf-dim" />
      <p className="font-display text-xl font-bold uppercase text-nf-white">
        Twój koszyk jest pusty
      </p>
      {/* Button renders a Link when href is set and drops onClick - the wrapper
          catches the bubbled click (mouse and keyboard) to close the drawer */}
      <span onClick={onShop}>
        <Button href="/collections/collars">Zobacz obroże</Button>
      </span>
    </div>
  );
}

function CartFooter({ subtotal }: { subtotal: number }) {
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
      <PaymentIcons />
      <div className="flex items-center justify-between text-sm font-semibold text-nf-white">
        <span>Razem</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <p className="text-xs text-nf-dim">
        Cena zawiera VAT. Koszt dostawy naliczany przy kasie.
      </p>
      <Button type="button" className="w-full">
        Do kasy
      </Button>
    </div>
  );
}

export function CartDrawer({ crossSell }: { crossSell: Product[] }) {
  const { lines, subtotal, isOpen, closeCart, addLine, removeLine, setQty } = useCart();

  const inCart = new Set(lines.map((line) => line.product.id));
  const suggestions = crossSell.filter((p) => !inCart.has(p.id)).slice(0, 4);
  const isEmpty = lines.length === 0;

  return (
    <Drawer
      open={isOpen}
      onClose={closeCart}
      side="right"
      title="Twój koszyk"
      footer={isEmpty ? undefined : <CartFooter subtotal={subtotal} />}
    >
      {isEmpty ? (
        <EmptyState onShop={closeCart} />
      ) : (
        <div className="px-5 pb-6">
          <ul className="divide-y divide-nf-border">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-4 py-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[4px] bg-nf-elevated">
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
                      {line.color && (
                        <p className="text-xs text-nf-muted">{line.color.name}</p>
                      )}
                    </div>
                    <PriceTag
                      price={line.product.price}
                      fromPrice={false}
                      currency={line.product.currency}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-[4px] border border-nf-border">
                      <button
                        type="button"
                        aria-label="Zmniejsz ilość"
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
                        aria-label="Zwiększ ilość"
                        onClick={() => setQty(line.key, line.qty + 1)}
                        className={STEPPER_BUTTON_CLASSES}
                      >
                        <PlusIcon width={16} height={16} />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`Usuń ${line.product.name}`}
                      onClick={() => removeLine(line.key)}
                      className="flex h-11 w-11 items-center justify-center text-nf-dim transition-colors duration-250 ease-nf hover:text-white"
                    >
                      <TrashIcon width={18} height={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {suggestions.length > 0 && (
            <section aria-label="Do kompletu" className="mt-2 border-t border-nf-border pt-5">
              <h3 className="text-xs uppercase tracking-widest text-nf-dim">
                Do kompletu
              </h3>
              <ul className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
                {suggestions.map((product) => (
                  <li key={product.id} className="w-32 shrink-0">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-nf-elevated">
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
                    <button
                      type="button"
                      onClick={() => addLine(product)}
                      className="mt-2 flex h-11 w-full items-center justify-center rounded-[4px] bg-nf-red text-xs font-semibold text-white transition-colors duration-250 ease-nf hover:bg-nf-red-hover"
                    >
                      Dodaj
                    </button>
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
