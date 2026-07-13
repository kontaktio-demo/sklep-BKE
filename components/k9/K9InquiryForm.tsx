"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";
import type { K9CategoryInfo, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface K9InquiryFormProps {
  categories: K9CategoryInfo[];
  products: Product[];
}

const FIELD =
  "h-12 w-full rounded-[2px] border border-nf-border bg-nf-elevated px-4 text-sm text-nf-text placeholder:text-nf-dim";
const LABEL = "type-meta block text-nf-dim";

// Formularz zapytania ofertowego. Nie wysyla nic na serwer (brak backendu w tej fazie),
// wiec po zatwierdzeniu pokazuje uczciwe podsumowanie z gotowa trescia do skopiowania
// i adresem, pod ktory mozna ja wyslac. Zadnej udawanej wysylki.
export function K9InquiryForm({ categories, products }: K9InquiryFormProps) {
  const [items, setItems] = useState<Record<string, number>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const unitId = useId();
  const personId = useId();
  const emailId = useId();
  const phoneId = useId();
  const deadlineId = useId();
  const notesId = useId();
  const consentId = useId();

  const setQty = (slug: string, qty: number) => {
    setItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[slug];
      else next[slug] = Math.min(qty, 999);
      return next;
    });
  };

  const chosen = products.filter((p) => items[p.slug]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = chosen.map(
      (p) => `- ${p.name} (${p.sku}), sztuk: ${items[p.slug]}`
    );

    setSummary(
      [
        `Jednostka: ${data.get("unit")}`,
        `Osoba kontaktowa: ${data.get("person")}`,
        `E-mail: ${data.get("email")}`,
        `Telefon: ${data.get("phone")}`,
        `Termin: ${data.get("deadline") || "nie podano"}`,
        "",
        "Pozycje:",
        ...(lines.length > 0 ? lines : ["- nie wybrano pozycji z katalogu"]),
        "",
        `Uwagi: ${data.get("notes") || "brak"}`,
      ].join("\n")
    );
  };

  if (summary) {
    return (
      <div className="max-w-3xl">
        <p className="flex items-center gap-2 text-nf-text">
          <CheckIcon className="shrink-0 text-nf-text" />
          Zapytanie przygotowane.
        </p>
        <p className="mt-4 leading-relaxed text-nf-muted">
          Wysyłkę z formularza uruchomimy razem z integracją poczty. Do tego czasu
          skopiuj treść poniżej i wyślij ją na{" "}
          <a
            href="mailto:k9@pakt.pl"
            className="text-white underline underline-offset-4 hover:text-nf-red-bright"
          >
            k9@pakt.pl
          </a>
          . Odpowiadamy w ciągu dwóch dni roboczych.
        </p>
        <pre className="mt-6 overflow-x-auto whitespace-pre-wrap rounded-[2px] border border-nf-border bg-nf-elevated p-5 font-mono text-xs leading-relaxed text-nf-text">
          {summary}
        </pre>
        <button
          type="button"
          onClick={() => setSummary(null)}
          className="type-meta mt-6 inline-flex min-h-11 items-center text-nf-dim transition-colors hover:text-white"
        >
          Wróć do formularza
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <h2 className="type-h2 text-white">Dane</h2>
        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor={unitId} className={LABEL}>
              Jednostka lub firma
            </label>
            <input id={unitId} name="unit" required className={cn(FIELD, "mt-2")} />
          </div>
          <div>
            <label htmlFor={personId} className={LABEL}>
              Osoba kontaktowa
            </label>
            <input id={personId} name="person" required className={cn(FIELD, "mt-2")} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={emailId} className={LABEL}>
                E-mail
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                required
                className={cn(FIELD, "mt-2")}
              />
            </div>
            <div>
              <label htmlFor={phoneId} className={LABEL}>
                Telefon
              </label>
              <input id={phoneId} name="phone" type="tel" className={cn(FIELD, "mt-2")} />
            </div>
          </div>
          <div>
            <label htmlFor={deadlineId} className={LABEL}>
              Oczekiwany termin
            </label>
            <input
              id={deadlineId}
              name="deadline"
              placeholder="np. do końca kwartału"
              className={cn(FIELD, "mt-2")}
            />
          </div>
          <div>
            <label htmlFor={notesId} className={LABEL}>
              Uwagi, znakowanie, wymagania
            </label>
            <textarea
              id={notesId}
              name="notes"
              rows={4}
              className="mt-2 w-full rounded-[2px] border border-nf-border bg-nf-elevated px-4 py-3 text-sm text-nf-text placeholder:text-nf-dim"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <h2 className="type-h2 text-white">Pozycje z katalogu</h2>
        <p className="mt-2 text-sm text-nf-muted">
          Wybierz sztuki przy pozycjach, które mają wejść do wyceny. Możesz zostawić
          puste i opisać potrzeby w uwagach.
        </p>

        <div className="mt-6 space-y-8">
          {categories.map((category) => {
            const list = products.filter((p) => p.k9Category === category.slug);
            if (list.length === 0) return null;
            return (
              <fieldset key={category.slug}>
                <legend className="type-meta w-full border-b border-nf-border pb-2 text-nf-dim">
                  {category.code} / {category.title}
                </legend>
                <ul className="mt-3 divide-y divide-nf-border">
                  {list.map((product) => {
                    const qty = items[product.slug] ?? 0;
                    return (
                      <li
                        key={product.slug}
                        className="flex flex-wrap items-center justify-between gap-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-nf-text">{product.name}</p>
                          <p className="type-meta mt-1 text-nf-dim">{product.sku}</p>
                        </div>
                        <div className="flex items-center rounded-[2px] border border-nf-border">
                          <button
                            type="button"
                            aria-label={`Zmniejsz liczbę sztuk: ${product.name}`}
                            onClick={() => setQty(product.slug, qty - 1)}
                            className="flex h-11 w-11 items-center justify-center text-nf-dim transition-colors hover:text-white"
                          >
                            <MinusIcon width={16} height={16} />
                          </button>
                          <span
                            aria-live="polite"
                            className="min-w-10 text-center text-sm text-nf-text"
                          >
                            {qty}
                          </span>
                          <button
                            type="button"
                            aria-label={`Zwiększ liczbę sztuk: ${product.name}`}
                            onClick={() => setQty(product.slug, qty + 1)}
                            className="flex h-11 w-11 items-center justify-center text-nf-dim transition-colors hover:text-white"
                          >
                            <PlusIcon width={16} height={16} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            );
          })}
        </div>

        <div className="mt-8 border-t border-nf-border pt-6">
          <label htmlFor={consentId} className="flex items-start gap-3 text-sm text-nf-muted">
            <input
              id={consentId}
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 size-[18px] shrink-0 rounded-[2px] border border-nf-border-strong accent-nf-red"
            />
            <span>
              Zgadzam się na kontakt w sprawie tego zapytania i na przetwarzanie danych
              zgodnie z{" "}
              <Link
                href="/polityka-prywatnosci"
                className="text-nf-text underline underline-offset-4 hover:text-white"
              >
                polityką prywatności
              </Link>
              .
            </span>
          </label>

          <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
            Przygotuj zapytanie
          </Button>
          <p className="mt-3 text-xs text-nf-dim">
            {chosen.length > 0
              ? `Wybrane pozycje: ${chosen.length}`
              : "Nie wybrano pozycji z katalogu"}
          </p>
        </div>
      </div>
    </form>
  );
}
