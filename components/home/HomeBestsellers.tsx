import { ProductCard } from "@/components/collection/ProductCard";
import { QuickViewProvider } from "@/components/collection/QuickViewModal";
import { Button } from "@/components/ui/Button";
import { getProducts } from "@/lib/data";

/**
 * Pas handlowy strony glownej. Wczesniej strona nie pokazywala ani jednego produktu,
 * ceny i przycisku zakupu - klient musial uwierzyc na slowo, ze to sklep, i dopiero
 * wejsc w katalog, zeby zobaczyc towar.
 *
 * Karty ida z linii SKLEPU: getProducts zwraca wylacznie line === "shop", wiec sprzet
 * PAKT-K9 nie ma jak tu trafic. Sekcja sluzbowa ma wlasne wejscie w kaflach wyzej.
 */
const COLLECTION_HREF = "/collections/collars";
const MAX_TILES = 4;

// szerokosc kafla = kolumna siatki (2 / lg:4) w kontenerze 1600px, padding 24, gap 16
const CARD_SIZES =
  "(min-width:1600px) 380px, (min-width:1024px) calc((100vw - 96px) / 4), calc((100vw - 48px) / 2)";

export async function HomeBestsellers() {
  const products = await getProducts("collars");

  // bestsellerRank to kolejnosc redakcyjna sklepu; pozycje bez rangi nie wchodza na strone glowna
  const top = products
    .filter((product) => product.bestsellerRank != null)
    .sort((a, b) => (a.bestsellerRank ?? 0) - (b.bestsellerRank ?? 0))
    .slice(0, MAX_TILES);

  if (top.length === 0) return null;

  return (
    // QuickViewProvider: karta sklepowa otwiera szybki podglad, wiec potrzebuje kontekstu.
    // W kolekcji dostarcza go CollectionView, na karcie produktu ProductPageView - tutaj
    // sekcja bierze go na siebie, zeby nie zmieniac karty.
    <QuickViewProvider>
      <section className="border-t border-nf-border bg-nf-elevated">
        <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20">
          <h2 className="type-h2 text-nf-white">Najczęściej wybierane</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-nf-muted">
            Cztery modele, które schodzą z magazynu najszybciej. Ceny za rozmiar, wysyłka
            w 24 h.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {top.map((product) => (
              <ProductCard key={product.id} product={product} sizes={CARD_SIZES} />
            ))}
          </div>

          <div className="mt-10">
            <Button href={COLLECTION_HREF} variant="ghost" size="md">
              Zobacz wszystkie obroże
            </Button>
          </div>
        </div>
      </section>
    </QuickViewProvider>
  );
}
