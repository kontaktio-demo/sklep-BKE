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
 * Dog Store Pro nie ma jak tu trafic. Sekcja sluzbowa ma wlasne wejscie w kaflach wyzej.
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
      {/* trzeci stopien drabiny papieru: sekcja handlowa "zatopiona" ponizej tla strony */}
      <section className="border-t border-nf-border bg-nf-sunken">
        <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="type-kicker text-nf-dim">Bestsellery</p>
              <h2 className="type-h2 mt-4 text-nf-white">Najczęściej wybierane</h2>
            </div>
            <Button href={COLLECTION_HREF} variant="ghost" size="md">
              Zobacz wszystkie obroże
            </Button>
          </div>

          {/* lamana linia bazowa: karty 2 i 4 zsuniete - rytm rozkladowki, nie tabela.
              Offsety tylko od lg, na wezszych ekranach siatka wraca do porzadku. */}
          <div
            data-reveal="group"
            className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6"
          >
            {top.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                sizes={CARD_SIZES}
                className={i % 2 === 1 ? "lg:mt-14" : undefined}
              />
            ))}
          </div>
        </div>
      </section>
    </QuickViewProvider>
  );
}
