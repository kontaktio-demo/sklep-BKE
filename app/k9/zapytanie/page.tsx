import type { Metadata } from "next";
import Link from "next/link";
import { getK9Categories, getK9Products } from "@/lib/data";
import { K9InquiryForm } from "@/components/k9/K9InquiryForm";

export const metadata: Metadata = {
  title: { absolute: "Zapytanie ofertowe | PAKT-K9" },
  description:
    "Zapytanie ofertowe na sprzęt z linii PAKT-K9 dla jednostek, hodowli i szkół tresury. Wycena, terminy, znakowanie.",
};

const CONTAINER = "mx-auto max-w-[1600px] px-4 md:px-6";

const TERMS = [
  {
    code: "01",
    title: "Wycena",
    body: "Odpowiadamy w ciągu dwóch dni roboczych. W wycenie podajemy cenę jednostkową, termin i koszt znakowania.",
  },
  {
    code: "02",
    title: "Znakowanie",
    body: "Naszywki jednostki, numery i panele identyfikacyjne szyjemy u siebie. Wzór ustalamy przed produkcją.",
  },
  {
    code: "03",
    title: "Terminy",
    body: "Pozycje z katalogu wysyłamy z magazynu. Zamówienia ze znakowaniem realizujemy w 10 do 15 dni roboczych.",
  },
  {
    code: "04",
    title: "Rozliczenie",
    body: "Faktura z odroczonym terminem płatności dla jednostek i instytucji. Dla pozostałych przedpłata.",
  },
];

export default async function K9InquiryPage() {
  const [categories, products] = await Promise.all([getK9Categories(), getK9Products()]);

  return (
    <div className="bg-nf-bg">
      <section className="border-b border-nf-border">
        <div className={`${CONTAINER} py-12 md:py-16`}>
          <nav aria-label="Ścieżka nawigacji" className="type-meta text-nf-dim">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/k9" className="transition-colors hover:text-white">
                  PAKT-K9
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-nf-text">
                Zapytanie ofertowe
              </li>
            </ol>
          </nav>

          <h1 className="type-h1 mt-8 text-white">Zapytanie ofertowe</h1>
          <p className="mt-6 max-w-2xl leading-relaxed text-nf-muted">
            Formularz dla jednostek, hodowli i szkół tresury, które zamawiają sprzęt
            w większej liczbie sztuk lub potrzebują znakowania. Pojedyncze pozycje z
            katalogu kupisz normalnie przez koszyk.
          </p>
        </div>
      </section>

      <section className="border-b border-nf-border">
        <div className={`${CONTAINER} py-12 md:py-16`}>
          <ul className="grid gap-px bg-nf-border md:grid-cols-2 lg:grid-cols-4">
            {TERMS.map((term) => (
              <li key={term.code} className="bg-nf-bg p-6">
                <span className="type-meta text-nf-dim">{term.code}</span>
                <h2 className="type-h3 mt-3 text-white">{term.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-nf-muted">{term.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${CONTAINER} py-12 md:py-20`}>
        <K9InquiryForm categories={categories} products={products} />
      </section>
    </div>
  );
}
