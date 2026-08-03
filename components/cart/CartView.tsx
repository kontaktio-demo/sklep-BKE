"use client";

// Pelna strona koszyka. Szuflada (CartDrawer) jest skrotem przy dodawaniu do koszyka,
// ta strona jest miejscem, w ktorym sie zamowienie sprawdza: pelne pozycje, rozmiar, SKU
// wariantu, kolor, wartosc pozycji i podsumowanie, ktore nie ucieka przy przewijaniu.

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { Button } from "@/components/ui/Button";
import { CartIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import type { CartLine } from "@/lib/cart";
import { useCart } from "@/lib/cart";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FROM } from "@/lib/nav";
import { productHref } from "@/lib/routes";
import { SIZE_SHORT } from "@/lib/sizes";
import { formatPrice } from "@/lib/utils";

const STEPPER_BUTTON =
  "flex h-11 w-11 items-center justify-center text-nf-muted transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none";

const SUMMARY_ROW = "flex items-baseline justify-between gap-4 text-sm";

/** Rozmiar w jednej linii: kod z przyciskow wyboru i obwod szyi, po ktorym sie mierzy. */
function sizeLabel(line: CartLine): string {
  return `${SIZE_SHORT[line.variant.size]} (${line.variant.neck})`;
}

function EmptyCart() {
  const t = useTranslations("cart");
  return (
    <div className="border border-nf-border px-6 py-16 text-center">
      <CartIcon width={40} height={40} className="mx-auto text-nf-dim" />
      <h2 className="type-h2 mt-6 text-nf-white">{t("empty.title")}</h2>
      {/* Tekst mowil o smyczach, ktorych sklep nie sprzedaje: katalog to same obroze
          (nylonowe i lancuszkowe). Pusty koszyk nie ma prawa obiecywac asortymentu,
          ktorego nie ma za nastepnym klknieciem */}
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-nf-muted">
        {t("empty.body")}
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {/* bez rounded-[2px]: cn() jedzie na twMerge, wiec klasa z wywolania BIJE promien
            z komponentu i przycisk po cichu wypisywal sie z jednego jezyka CTA */}
        <Button href="/collections/collars">{t("empty.ctaCollars")}</Button>
        <Button href="/pro" variant="ghost">
          {t("empty.ctaPro")}
        </Button>
      </div>
    </div>
  );
}

export function CartView() {
  const t = useTranslations("cart");
  const tn = useTranslations("nav");
  const { lines, count, subtotal, removeLine, setQty } = useCart();

  if (lines.length === 0) return <EmptyCart />;

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const total = freeShipping ? subtotal : subtotal + SHIPPING_FROM;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <section aria-label={t("itemsRegion")} className="lg:col-span-7 xl:col-span-8">
        {/* pozycja = wariant (wiersz), nie sztuka: wczesniej licznik bral sume ilosci,
            wiec jeden wiersz z dwiema sztukami pokazywal "2 pozycje" */}
        <p className="type-label text-nf-dim">
          {t("positions", { count: lines.length })}
          {count !== lines.length ? `, ${t("pieces", { count })}` : ""}
        </p>

        <ul className="mt-4 border-t border-nf-border">
          {lines.map((line) => {
            // rozmiar jest czescia tozsamosci pozycji, wiec wchodzi tez do etykiet
            // przyciskow: dwa wiersze tego samego modelu roznia sie wylacznie nim
            const name = t("itemName", {
              name: line.product.name,
              size: SIZE_SHORT[line.variant.size],
            });
            return (
              <li
                key={line.key}
                className="flex flex-col gap-4 border-b border-nf-border py-6 sm:flex-row"
              >
                {/* productHref, nie sklejanie /products/<slug>: sprzet Dog Store Pro ma wlasna
                    przestrzen adresow (/pro/produkt/<slug>), wiec pozycja z tej linii w koszyku
                    linkowala w 404 */}
                <Link
                  href={productHref(line.product)}
                  className="relative h-32 w-24 shrink-0 overflow-hidden rounded-[2px] bg-nf-elevated"
                >
                  <Image
                    src={line.product.images[0]}
                    alt={line.product.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-sm font-medium text-nf-text">
                        <Link
                          href={productHref(line.product)}
                          className="transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
                        >
                          {line.product.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-xs text-nf-muted">
                        {t("sizeLabel", { size: sizeLabel(line) })}
                      </p>
                      {line.color && (
                        <p className="mt-1 text-xs text-nf-muted">
                          {t("colorLabel", { color: line.color.name })}
                        </p>
                      )}
                      <p className="type-label mt-1 text-nf-dim">SKU {line.variant.sku}</p>
                      <p className="mt-2 text-xs text-nf-dim">
                        {t("perUnit", {
                          price: formatPrice(line.variant.price, line.product.currency),
                        })}
                      </p>
                      {/* stan magazynowy mogl sie zmienic, odkad pozycja trafila do koszyka:
                          mail z zamowieniem i tak by ja zawieral, wiec musi to byc widoczne */}
                      {!line.variant.inStock && (
                        <p className="mt-2 text-xs text-nf-red-bright">
                          {t("outOfStock")}
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-nf-white">
                      {formatPrice(line.variant.price * line.qty, line.product.currency)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    {/* nf-control: ta sama zasada co przy stepperze na karcie produktu -
                        ramka jest jedynym sygnalem kontrolki (WCAG 1.4.11) */}
                    <div className="flex items-center rounded-[2px] border border-nf-control">
                      <button
                        type="button"
                        aria-label={t("decreaseAria", { name })}
                        onClick={() => setQty(line.key, line.qty - 1)}
                        className={STEPPER_BUTTON}
                      >
                        <MinusIcon width={16} height={16} />
                      </button>
                      <span
                        aria-live="polite"
                        className="min-w-8 text-center text-sm text-nf-text"
                      >
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        aria-label={t("increaseAria", { name })}
                        onClick={() => setQty(line.key, line.qty + 1)}
                        className={STEPPER_BUTTON}
                      >
                        <PlusIcon width={16} height={16} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      className="flex h-11 items-center gap-2 px-2 text-xs text-nf-dim transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
                    >
                      <TrashIcon width={16} height={16} aria-hidden="true" />
                      <span>{t("remove")}</span>
                      <span className="sr-only">{name}</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <Link
            href="/collections/collars"
            className="inline-flex min-h-11 items-center text-sm text-nf-muted underline underline-offset-4 transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </section>

      <aside aria-label={t("summaryRegion")} className="lg:col-span-5 xl:col-span-4">
        <div className="border border-nf-border bg-nf-elevated p-6 lg:sticky lg:top-24">
          {/* karta, nie sekcja strony - stopien nizej niz H1 koszyka */}
          <h2 className="type-h3 text-nf-white">{t("summary.heading")}</h2>

          <dl className="mt-6 space-y-3">
            <div className={SUMMARY_ROW}>
              <dt className="text-nf-muted">{t("summary.subtotal")}</dt>
              <dd className="font-medium text-nf-text">{formatPrice(subtotal)}</dd>
            </div>
            <div className={SUMMARY_ROW}>
              <dt className="text-nf-muted">{t("summary.shipping")}</dt>
              <dd className="font-medium text-nf-text">
                {freeShipping
                  ? t("summary.shippingFree")
                  : t("summary.shippingFrom", { price: formatPrice(SHIPPING_FROM) })}
              </dd>
            </div>
          </dl>

          <FreeShippingBar subtotal={subtotal} className="mt-5" />

          <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-nf-border pt-4">
            <span className="type-label text-nf-white">{t("summary.total")}</span>
            <span className="text-lg font-semibold text-nf-white">{formatPrice(total)}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-nf-dim">
            {t("summary.vatIncluded")}{" "}
            {freeShipping
              ? t("summary.freeShippingNote")
              : t("summary.shippingNote")}
          </p>

          <div className="mt-6 space-y-3">
            <Button
              href="/kasa"
              variant="danger"
              size="lg"
              className="w-full"
            >
              {t("checkout")}
            </Button>
            <p className="text-xs leading-relaxed text-nf-muted">
              {t("checkoutNote")}
            </p>
          </div>

          <ul className="mt-6 space-y-2 border-t border-nf-border pt-4 text-xs text-nf-dim">
            <li>
              <Link
                href="/dostawa-i-platnosci"
                className="inline-flex min-h-11 items-center transition-colors duration-250 ease-nf hover:text-nf-text motion-reduce:transition-none"
              >
                {t("links.shipping")}
              </Link>
            </li>
            <li>
              <Link
                href="/zwroty-i-reklamacje"
                className="inline-flex min-h-11 items-center transition-colors duration-250 ease-nf hover:text-nf-text motion-reduce:transition-none"
              >
                {t("links.returns")}
              </Link>
            </li>
            <li>
              <Link
                href="/tabela-rozmiarow"
                className="inline-flex min-h-11 items-center transition-colors duration-250 ease-nf hover:text-nf-text motion-reduce:transition-none"
              >
                {tn("footer.sizeChart")}
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
