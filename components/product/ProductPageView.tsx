import type { CSSProperties } from "react";
import { ProductRow } from "@/components/collection/ProductRow";
import { QuickViewProvider } from "@/components/collection/QuickViewModal";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/product/Breadcrumbs";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSections } from "@/components/product/ProductSections";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { Badge } from "@/components/ui/Badge";
import { getK9Category, getK9Products, getProducts, getRelatedProducts } from "@/lib/data";
import { BRAND, K9_ROOT } from "@/lib/nav";
import { productHref } from "@/lib/routes";
import { SIZE_SHORT } from "@/lib/sizes";
import type { Product } from "@/lib/types";

const COLLECTION_HANDLE = "collars";
const COLLECTION_HREF = `/collections/${COLLECTION_HANDLE}`;
export const K9_BRAND = "PAKT-K9";

/**
 * Widok karty produktu, wspolny dla obu sklepow. Trasy sa dwie (/products/<slug> oraz
 * /k9/produkt/<slug>), bo z trasy bierze sie motyw i przynaleznosc do katalogu - ale
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
    brand: { "@type": "Brand", name: product.line === "k9" ? K9_BRAND : BRAND },
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
  const k9 = product.line === "k9";

  // Okruszki K9 prowadzily do /collections/collars, gdzie sprzetu K9 fizycznie nie ma
  // (seam wpuszcza do sklepu wylacznie line === "shop"). Sciezka musi wracac do katalogu,
  // z ktorego pozycja pochodzi.
  //
  // "Ostatnio ogladane" trzyma na dysku same slugi (lib/recent.ts), wiec katalog do ich
  // rozwiazania musi przyjechac z serwera. Jedzie katalog TEJ linii, nie obu: wczesniej
  // szedl tu sklep sklejony z K9 i na cywilnej karcie produktu ladowal kafel sprzetu
  // sluzbowego - z szybkim podgladem i dodawaniem do koszyka. Historia moze zawierac slugi
  // z obu swiatow, ale kazdy swiat rozwiazuje wylacznie swoje.
  const [related, k9Category, catalog] = await Promise.all([
    getRelatedProducts(product.slug, 8),
    k9 && product.k9Category ? getK9Category(product.k9Category) : null,
    k9 ? getK9Products() : getProducts(COLLECTION_HANDLE),
  ]);

  const backHref = k9Category ? `${K9_ROOT}/${k9Category.slug}` : COLLECTION_HREF;

  const crumbs: BreadcrumbItem[] = k9
    ? [
        { label: K9_BRAND, href: K9_ROOT },
        ...(k9Category ? [{ label: k9Category.title, href: backHref }] : []),
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

      {/* Karta K9 czyta sie jak pozycja katalogu, nie jak wystawa sklepu: pod naglowkiem
          i kadrem lezy ta sama siatka techniczna co na /k9 i /k9/[category]. Maska gasi ja
          nad sekcjami opisowymi, zeby nie tapetowala calej strony */}
      {/* bez overflow-hidden: ancestor z overflow-hidden robi z siebie scrollport i zabija
          lg:sticky w BuyBox. Warstwa siatki jest absolutna i ograniczona wysokoscia,
          wiec i tak nie wychodzi poza kadr */}
      <div className="relative">
        {k9 && (
          <div
            aria-hidden="true"
            className="grid-tech pointer-events-none absolute inset-x-0 top-0 h-[760px] opacity-[0.35]"
            style={
              {
                "--grid-size": "72px",
                WebkitMaskImage:
                  "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
              } as CSSProperties
            }
          />
        )}

        <div className="relative mx-auto max-w-[1600px] px-4 pb-16 pt-8 md:px-6">
          <Breadcrumbs items={crumbs} mono={k9} />

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
              nie miesza sklepu z K9), wiec o ubraniu kafla decyduje trasa, na ktorej stoi */}
          <ProductRow
            title={k9 ? "Z tej samej linii" : "Podobne produkty"}
            products={related}
            exploreHref={backHref}
            variant={k9 ? "k9" : "shop"}
          />
        </div>
      )}

      {/* rzad montuje sie dopiero po odczycie historii z dysku; przy pierwszej wizycie
          nie renderuje niczego, lacznie z wlasna ramka */}
      <RecentlyViewed
        products={catalog}
        currentSlug={product.slug}
        variant={k9 ? "k9" : "shop"}
      />
    </QuickViewProvider>
  );
}
