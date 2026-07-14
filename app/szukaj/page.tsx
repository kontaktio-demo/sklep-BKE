import type { Metadata } from "next";
import { SearchResults } from "@/components/search/SearchResults";
import { getProProducts, getProducts } from "@/lib/data";
import { searchProducts } from "@/lib/search";

// Wyniki liczone na serwerze przez seam - przegladarka nie dostaje calego katalogu do
// przemielenia, a fraza zyje w URL, wiec wynik da sie wyslac linkiem.

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Adres moze przyjsc z ?q=a&q=b - liczy sie pierwsza wartosc. */
function readQuery(raw: string | string[] | undefined): string {
  if (Array.isArray(raw)) return (raw[0] ?? "").trim();
  return (raw ?? "").trim();
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = readQuery((await searchParams).q);

  return {
    // sufiks "| Dog Store" dokłada szablon tytułu z app/layout.tsx
    title: query ? `Szukaj: ${query}` : "Szukaj",
    description: query
      ? `Wyniki wyszukiwania dla frazy ${query} w sklepie Dog Store i w katalogu Dog Store Pro.`
      : "Przeszukaj obroże ze sklepu Dog Store i sprzęt służbowy z linii Dog Store Pro.",
    // lista wynikow nie idzie do indeksu: kazda fraza tworzylaby osobny adres z ta sama trescia
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = readQuery((await searchParams).q);

  // obie linie naraz: sklep i sekcja Pro sa rozdzielone w wynikach, ale szuka sie raz
  const [shopProducts, proProducts] = await Promise.all([
    getProducts("collars"),
    getProProducts(),
  ]);

  return (
    <SearchResults
      query={query}
      shopHits={searchProducts(shopProducts, query)}
      proHits={searchProducts(proProducts, query)}
    />
  );
}
