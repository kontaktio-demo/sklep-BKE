"use client";

// §8-I Szybki podglad produktu

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  VariantPicker,
  availabilityMailHref,
  defaultVariant,
} from "@/components/product/VariantPicker";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { Dialog } from "@/components/ui/Dialog";
import { PriceTag } from "@/components/ui/PriceTag";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/cart";
import { productHref } from "@/lib/routes";
import { SIZE_SHORT, WIDTH_LABEL } from "@/lib/sizes";
import type { Product, ProductColor, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

// Wspolny rytm etykiet i pol - ten sam co w BuyBox (karta produktu), lacznie z zasada,
// ze o kroju etykiety decyduje linia produktu. Szybki podglad otwiera sie takze na karcie
// Dog Store Pro (rzad "Z tej samej linii"), wiec monospace ma tam zostac, a w sklepie ustepuje
// groteskowi.
const LABEL_PRO = "block type-meta text-nf-dim";
const LABEL_SHOP = "block type-label text-nf-dim";
// pigulka szerokosci to ODCZYT, nie kontrolka - zostaje na linii dekoracyjnej
const PILL =
  "mt-2 inline-flex items-center rounded-[2px] border border-nf-border-strong px-3 py-2 text-sm text-nf-text";

interface QuickViewContextValue {
  openQuickView: (product: Product) => void;
}

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function useQuickView(): QuickViewContextValue {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within QuickViewProvider");
  return ctx;
}

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  // product is kept after close so the Dialog exit animation has content
  const [product, setProduct] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const openQuickView = useCallback((p: Product) => {
    setProduct(p);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openQuickView }), [openQuickView]);

  return (
    <QuickViewContext.Provider value={value}>
      {children}
      <Dialog
        open={open && product !== null}
        onClose={close}
        title={product?.name ?? "Szybki podgląd"}
        hideTitle
        maxWidthClassName="max-w-3xl"
      >
        {product && (
          // key resets selection/qty state whenever a different product opens
          <QuickViewContent key={product.id} product={product} onClose={close} />
        )}
      </Dialog>
    </QuickViewContext.Provider>
  );
}

function QuickViewContent({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addLine, openCart } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(product.colors[0]);
  // ten sam kontrakt co na karcie produktu: do koszyka idzie wariant, wiec podglad
  // musi go wybrac, a nie zgadnac
  const [variant, setVariant] = useState<ProductVariant>(() => defaultVariant(product));
  const [qty, setQty] = useState(1);

  const pro = product.line === "pro";
  const label = pro ? LABEL_PRO : LABEL_SHOP;

  const modelSoldOut = !product.inStock;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addLine(product, variant, selectedColor);
    onClose();
    openCart();
  };

  return (
    <div className="grid gap-6 p-5 md:grid-cols-2 md:p-6">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-nf-elevated">
          <Image
            src={product.images[imageIndex]}
            alt={product.name}
            fill
            sizes="(min-width:768px) 384px, 90vw"
            className="object-cover"
          />
        </div>
        <div className="mt-3 flex gap-2">
          {product.images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              aria-label={`Zdjęcie ${i + 1}`}
              aria-pressed={imageIndex === i}
              onClick={() => setImageIndex(i)}
              className={cn(
                // pierscien wybranej miniatury na tokenie maksymalnego kontrastu: na panelu
                // dialogu (nf-elevated = biel w cywilu) literalna biel po prostu znikala
                "relative aspect-[4/5] w-16 overflow-hidden rounded-[2px] bg-nf-elevated transition-opacity duration-250 ease-nf",
                imageIndex === i
                  ? "ring-2 ring-nf-white ring-offset-2 ring-offset-nf-elevated"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {product.badges.length > 0 && (
          // md:pr-12 clears the Dialog's absolute close button
          <div className="flex flex-wrap gap-1.5 md:pr-12">
            {product.badges.map((badge) => (
              <Badge key={badge} badge={badge} />
            ))}
          </div>
        )}

        <div>
          <p className="type-h3 text-nf-white">{product.name}</p>
          <p className={cn("mt-2", label)}>
            {product.productType} / {variant.sku}
          </p>
        </div>

        {/* cena wybranego rozmiaru - "od" zostaje na kafelku w siatce, tu wybor juz zapadl */}
        <PriceTag
          price={variant.price}
          fromPrice={false}
          currency={product.currency}
          className="text-lg"
        />

        {product.colors.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between">
              <span className={label}>Kolor</span>
              {selectedColor && <span className="text-sm text-nf-muted">{selectedColor.name}</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {product.colors.map((color) => (
                <ColorSwatch
                  key={color.name}
                  color={color}
                  size="md"
                  onElevated
                  selected={selectedColor?.name === color.name}
                  onSelect={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        )}

        {/* szerokosc jest cecha modelu, nie wariantu: jedna wartosc renderuje sie jako pigulka */}
        <div>
          <span className={label}>Szerokość</span>
          <span className={PILL}>{WIDTH_LABEL[product.width]}</span>
        </div>

        <VariantPicker
          variants={product.variants}
          selected={variant}
          onSelect={setVariant}
          density="sm"
          mono={pro}
        />

        <div>
          <span className={label}>Ilość</span>
          {/* nf-control: ramka steppera jest jedynym sygnalem kontrolki (WCAG 1.4.11) */}
          <div className="mt-2 inline-flex items-center rounded-[2px] border border-nf-control">
            <button
              type="button"
              aria-label="Zmniejsz ilość"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="flex h-11 w-11 items-center justify-center text-nf-muted transition-colors duration-250 ease-nf hover:text-nf-white disabled:opacity-40"
            >
              <MinusIcon />
            </button>
            <span aria-live="polite" className="w-10 text-center text-sm font-medium tabular-nums text-nf-white">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Zwiększ ilość"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-11 w-11 items-center justify-center text-nf-muted transition-colors duration-250 ease-nf hover:text-nf-white"
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          {variant.inStock ? (
            <Button variant="danger" size="lg" className="w-full" onClick={handleAddToCart}>
              Dodaj do koszyka
            </Button>
          ) : (
            // brak stanu na wybranym rozmiarze zamyka koszyk, ale nie zamyka rozmowy:
            // ta sama sciezka mailowa co na karcie produktu, ze SKU wariantu w temacie
            <>
              <Button variant="danger" size="lg" className="w-full" disabled>
                {modelSoldOut
                  ? "Chwilowo niedostępna"
                  : `Rozmiar ${SIZE_SHORT[variant.size]} niedostępny`}
              </Button>
              <Button
                href={availabilityMailHref(product, variant, selectedColor)}
                variant="ghost"
                size="md"
                className="h-11 w-full"
              >
                Napisz w sprawie dostępności
              </Button>
            </>
          )}
          <Link
            href={productHref(product)}
            onClick={onClose}
            className="self-center text-sm text-nf-muted underline underline-offset-2 transition-colors duration-250 ease-nf hover:text-nf-white"
          >
            Zobacz pełny opis
          </Link>
        </div>
      </div>
    </div>
  );
}
