import { ProductRow } from "@/components/collection/ProductRow";
import { QuickViewProvider } from "@/components/collection/QuickViewModal";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/product/Breadcrumbs";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSections } from "@/components/product/ProductSections";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { Badge } from "@/components/ui/Badge";
import { getProCategory, getProProducts, getProducts, getRelatedProducts } from "@/lib/data";
import { BRAND, PRO_ROOT } from "@/lib/nav";
import { productHref } from "@/lib/routes";
import { SIZE_SHORT } from "@/lib/sizes";
import type { Product } from "@/lib/types";

const COLLECTION_HANDLE = "collars";
const COLLECTION_HREF = `/collections/${COLLECTION_HANDLE}`;
export const PRO_BRAND = "Dog Store Pro";

/**
 * Widok karty produktu, wspolny dla obu sklepow. Trasy sa dwie (/products/<slug> oraz
 * /pro/produkt/<slug>), bo z trasy bierze sie motyw i przynaleznosc do katalogu - ale
 * uklad karty, galeria, warianty i sekcje opisowe sa te same. Roznice (okruszki, siatka
 * techniczna, marka w tytule) sterowane sa linia produktu, nie osobna kopia pliku.
 */
export function productJsonLd(product: Product): string {
  // Oferta per WARIANT: wczesniej byla jedna oferta z cena OD i SKU modelu, czyli numerem,
  // ktorego nie da sie zamowic. Wyszukiwarka dostawala cene jednego rozmiaru jako cene calosci.
  const url = productHref(product);
  const offers = product.variants.map((variant) => ({
    "@type": "Offer",
    url,
    sku: variant.sku,
    name: `${product.name}, rozmiar ${SIZE_SHORT[variant.size]} (${variant.neck})`,
    price: variant.price,
    priceCurrency: product.currency,
    availability: variant.inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  }));

  const prices = product.variants.map((v) => v.price);

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.line === "pro" ? PRO_BRAND : BRAND },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.currency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: offers.length,
      offers,
    },
  };

  // "<" uciekamy, zeby nazwa produktu nigdy nie zamknela elementu script przedwczesnie
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function ProductPageView({ product }: { product: Product }) {
  const pro = product.line === "pro";

  // Okruszki w sekcji Pro prowadzily do /collections/collars, gdzie sprzetu z tej linii fizycznie nie ma
  // (seam wpuszcza do sklepu wylacznie line === "shop"). Sciezka musi wracac do katalogu,
  // z ktorego pozycja pochodzi.
  //
  // "Ostatnio ogladane" trzyma na dysku same slugi (lib/recent.ts), wiec katalog do ich
  // rozwiazania musi przyjechac z serwera. Jedzie katalog TEJ linii, nie obu: wczesniej
  // szedl tu sklep sklejony z linia Pro i na cywilnej karcie produktu ladowal kafel sprzetu
  // sluzbowego - z szybkim podgladem i dodawaniem do koszyka. Historia moze zawierac slugi
  // z obu swiatow, ale kazdy swiat rozwiazuje wylacznie swoje.
  const [related, proCategory, catalog] = await Promise.all([
    getRelatedProducts(product.slug, 8),
    pro && product.proCategory ? getProCategory(product.proCategory) : null,
    pro ? getProProducts() : getProducts(COLLECTION_HANDLE),
  ]);

  const backHref = proCategory ? `${PRO_ROOT}/${proCategory.slug}` : COLLECTION_HREF;

  const crumbs: BreadcrumbItem[] = pro
    ? [
        { label: PRO_BRAND, href: PRO_ROOT },
        ...(proCategory ? [{ label: proCategory.title, href: backHref }] : []),
        { label: product.name },
      ]
    : [
        { label: "Strona główna", href: "/" },
        { label: "Obroże", href: COLLECTION_HREF },
        { label: product.name },
      ];

  return (
    <QuickViewProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: productJsonLd(product) }}
      />

      {/* Bez siatki technicznej pod kadrem: PRO_IDENTITY nie zna tego wzoru, a §6 zakazuje
          dekoracji spoza referencji i specyfikacji. Karte Dog Store Pro odroznia MATERIAL (czern,
          czerwony akcent, monospace w danych), a nie tapeta pod trescia. */}
      <div className="relative">
        <div
          className={
            pro
              ? "relative mx-auto max-w-[1440px] px-5 pb-16 pt-8 md:px-8 lg:px-12"
              : "relative mx-auto max-w-[1600px] px-4 pb-16 pt-8 md:px-6"
          }
        >
          <Breadcrumbs items={crumbs} mono={pro} />

          <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] xl:gap-16">
            <ProductGallery
              images={product.gallery}
              alt={product.name}
              badges={
                product.badges.length > 0
                  ? product.badges.map((badge) => <Badge key={badge} badge={badge} />)
                  : undefined
              }
            />

            <div className="lg:sticky lg:top-24">
              <BuyBox product={product} />
            </div>
          </div>

          <ProductSections product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <div className="border-t border-nf-border pb-20 pt-14">
          {/* variant, nie linia produktu w srodku rzedu: rzad ma jedna linie (getRelatedProducts
              nie miesza sklepu z linia Pro), wiec o ubraniu kafla decyduje trasa, na ktorej stoi */}
          <ProductRow
            title={pro ? "Z tej samej linii" : "Podobne produkty"}
            products={related}
            exploreHref={backHref}
            variant={pro ? "pro" : "shop"}
          />
        </div>
      )}

      {/* rzad montuje sie dopiero po odczycie historii z dysku; przy pierwszej wizycie
          nie renderuje niczego, lacznie z wlasna ramka */}
      <RecentlyViewed
        products={catalog}
        currentSlug={product.slug}
        variant={pro ? "pro" : "shop"}
      />
    </QuickViewProvider>
  );
}
