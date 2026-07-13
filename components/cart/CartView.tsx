"use client";

// Pelna strona koszyka. Szuflada (CartDrawer) jest skrotem przy dodawaniu do koszyka,
// ta strona jest miejscem, w ktorym sie zamowienie sprawdza: pelne pozycje, rozmiar, SKU
// wariantu, kolor, wartosc pozycji i podsumowanie, ktore nie ucieka przy przewijaniu.

import Image from "next/image";
import Link from "next/link";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { Button } from "@/components/ui/Button";
import { CartIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import type { CartLine } from "@/lib/cart";
import { useCart } from "@/lib/cart";
import { COMPANY, FREE_SHIPPING_THRESHOLD, SHIPPING_FROM } from "@/lib/nav";
import { productHref } from "@/lib/routes";
import { SIZE_SHORT } from "@/lib/sizes";
import { formatPrice, plural } from "@/lib/utils";

const STEPPER_BUTTON =
  "flex h-11 w-11 items-center justify-center text-nf-muted transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none";

const SUMMARY_ROW = "flex items-baseline justify-between gap-4 text-sm";

const ORDER_SUBJECT = "Zamówienie ze sklepu PAKT";

/** Rozmiar w jednej linii: kod z przyciskow wyboru i obwod szyi, po ktorym sie mierzy.
 *  Ten sam ciag idzie na ekran i do maila z zamowieniem. */
function sizeLabel(line: CartLine): string {
  return `${SIZE_SHORT[line.variant.size]} (${line.variant.neck})`;
}

/** Zamowienie sklada sie mailem, wiec przycisk musi wyjsc z pelna trescia koszyka:
 *  pozycje, rozmiary, kolory, SKU wariantow, ilosci, wartosci i suma. Bez rozmiaru i SKU
 *  wariantu wiadomosc nie mowi, co spakowac. Klient dopisuje adres i wysyla. */
function orderMailHref(lines: CartLine[], subtotal: number, total: number, freeShipping: boolean): string {
  const body = [
    "Dzień dobry,",
    "składam zamówienie na poniższe pozycje.",
    "",
    ...lines.map((line) => {
      const color = line.color ? `, kolor: ${line.color.name}` : "";
      const value = formatPrice(line.variant.price * line.qty, line.product.currency);
      return `- ${line.product.name} (SKU ${line.variant.sku}), rozmiar: ${sizeLabel(line)}${color}, sztuk: ${line.qty}, wartość: ${value}`;
    }),
    "",
    `Suma częściowa: ${formatPrice(subtotal)}`,
    `Dostawa: ${freeShipping ? "gratis" : `od ${formatPrice(SHIPPING_FROM)}`}`,
    `Razem: ${formatPrice(total)}`,
    "",
    "Dane do wysyłki:",
    "Imię i nazwisko:",
    "Adres:",
    "Telefon:",
    "Sposób dostawy (paczkomat albo kurier):",
  ].join("\n");

  return `mailto:${COMPANY.shopEmail}?subject=${encodeURIComponent(
    ORDER_SUBJECT
  )}&body=${encodeURIComponent(body)}`;
}

function EmptyCart() {
  return (
    <div className="border border-nf-border px-6 py-16 text-center">
      <CartIcon width={40} height={40} className="mx-auto text-nf-dim" />
      <h2 className="type-h2 mt-6 text-nf-white">Koszyk jest pusty</h2>
      {/* Tekst mowil o smyczach, ktorych sklep nie sprzedaje: katalog to same obroze
          (nylonowe i lancuszkowe). Pusty koszyk nie ma prawa obiecywac asortymentu,
          ktorego nie ma za nastepnym klknieciem */}
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-nf-muted">
        Nic tu jeszcze nie trafiło. Obroże nylonowe i łańcuszkowe znajdziesz w sklepie,
        sprzęt służbowy w sekcji PAKT-K9.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {/* bez rounded-[2px]: cn() jedzie na twMerge, wiec klasa z wywolania BIJE promien
            z komponentu i przycisk po cichu wypisywal sie z jednego jezyka CTA */}
        <Button href="/collections/collars">Zobacz obroże</Button>
        <Button href="/k9" variant="ghost">
          Sprzęt PAKT-K9
        </Button>
      </div>
    </div>
  );
}

export function CartView() {
  const { lines, count, subtotal, removeLine, setQty } = useCart();

  if (lines.length === 0) return <EmptyCart />;

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const total = freeShipping ? subtotal : subtotal + SHIPPING_FROM;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <section aria-label="Pozycje w koszyku" className="lg:col-span-7 xl:col-span-8">
        {/* pozycja = wariant (wiersz), nie sztuka: wczesniej licznik bral sume ilosci,
            wiec jeden wiersz z dwiema sztukami pokazywal "2 pozycje" */}
        <p className="type-label text-nf-dim">
          {lines.length} {plural(lines.length, "pozycja", "pozycje", "pozycji")}
          {count !== lines.length
            ? `, ${count} ${plural(count, "sztuka", "sztuki", "sztuk")}`
            : ""}
        </p>

        <ul className="mt-4 border-t border-nf-border">
          {lines.map((line) => {
            // rozmiar jest czescia tozsamosci pozycji, wiec wchodzi tez do etykiet
            // przyciskow: dwa wiersze tego samego modelu roznia sie wylacznie nim
            const name = `${line.product.name}, rozmiar ${SIZE_SHORT[line.variant.size]}`;
            return (
              <li
                key={line.key}
                className="flex flex-col gap-4 border-b border-nf-border py-6 sm:flex-row"
              >
                {/* productHref, nie sklejanie /products/<slug>: sprzet K9 ma wlasna
                    przestrzen adresow (/k9/produkt/<slug>), wiec pozycja K9 w koszyku
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
                      <p className="mt-1 text-xs text-nf-muted">Rozmiar: {sizeLabel(line)}</p>
                      {line.color && (
                        <p className="mt-1 text-xs text-nf-muted">Kolor: {line.color.name}</p>
                      )}
                      <p className="type-label mt-1 text-nf-dim">SKU {line.variant.sku}</p>
                      <p className="mt-2 text-xs text-nf-dim">
                        {formatPrice(line.variant.price, line.product.currency)} za sztukę
                      </p>
                      {/* stan magazynowy mogl sie zmienic, odkad pozycja trafila do koszyka:
                          mail z zamowieniem i tak by ja zawieral, wiec musi to byc widoczne */}
                      {!line.variant.inStock && (
                        <p className="mt-2 text-xs text-nf-red-bright">
                          Ten rozmiar jest chwilowo niedostępny. Potwierdzimy termin w odpowiedzi
                          na zamówienie.
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
                        aria-label={`Zmniejsz ilość: ${name}`}
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
                        aria-label={`Zwiększ ilość: ${name}`}
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
                      <span>Usuń</span>
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
            Kontynuuj zakupy
          </Link>
        </div>
      </section>

      <aside aria-label="Podsumowanie zamówienia" className="lg:col-span-5 xl:col-span-4">
        <div className="border border-nf-border bg-nf-elevated p-6 lg:sticky lg:top-24">
          {/* karta, nie sekcja strony - stopien nizej niz H1 koszyka */}
          <h2 className="type-h3 text-nf-white">Podsumowanie</h2>

          <dl className="mt-6 space-y-3">
            <div className={SUMMARY_ROW}>
              <dt className="text-nf-muted">Suma częściowa</dt>
              <dd className="font-medium text-nf-text">{formatPrice(subtotal)}</dd>
            </div>
            <div className={SUMMARY_ROW}>
              <dt className="text-nf-muted">Dostawa</dt>
              <dd className="font-medium text-nf-text">
                {freeShipping ? "Gratis" : `od ${formatPrice(SHIPPING_FROM)}`}
              </dd>
            </div>
          </dl>

          <FreeShippingBar subtotal={subtotal} className="mt-5" />

          <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-nf-border pt-4">
            <span className="type-label text-nf-white">Razem</span>
            <span className="text-lg font-semibold text-nf-white">{formatPrice(total)}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-nf-dim">
            Cena zawiera VAT.{" "}
            {freeShipping
              ? "Dostawa w tym zamówieniu jest bezpłatna."
              : "Kwota zawiera najtańszą dostawę (paczkomat). Ostateczny koszt zależy od przewoźnika wybranego przy zamówieniu."}
          </p>

          <div className="mt-6 space-y-3">
            <Button
              href={orderMailHref(lines, subtotal, total, freeShipping)}
              variant="danger"
              size="lg"
              className="w-full"
            >
              Złóż zamówienie mailem
            </Button>
            <p className="text-xs leading-relaxed text-nf-muted">
              Zamówienie składasz mailem:{" "}
              <a
                href={`mailto:${COMPANY.shopEmail}`}
                className="text-nf-text underline underline-offset-4 transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
              >
                {COMPANY.shopEmail}
              </a>
              . Przycisk otwiera wiadomość z pozycjami, rozmiarami i sumą. Dopisz adres wysyłki,
              a odpiszemy z potwierdzeniem i danymi do przelewu.
            </p>
          </div>

          <ul className="mt-6 space-y-2 border-t border-nf-border pt-4 text-xs text-nf-dim">
            <li>
              <Link
                href="/dostawa-i-platnosci"
                className="inline-flex min-h-11 items-center transition-colors duration-250 ease-nf hover:text-nf-text motion-reduce:transition-none"
              >
                Koszty i czasy dostawy
              </Link>
            </li>
            <li>
              <Link
                href="/zwroty-i-reklamacje"
                className="inline-flex min-h-11 items-center transition-colors duration-250 ease-nf hover:text-nf-text motion-reduce:transition-none"
              >
                60 dni na zwrot i wymianę rozmiaru
              </Link>
            </li>
            <li>
              <Link
                href="/tabela-rozmiarow"
                className="inline-flex min-h-11 items-center transition-colors duration-250 ease-nf hover:text-nf-text motion-reduce:transition-none"
              >
                Tabela rozmiarów
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
