import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ProductRow } from "@/components/collection/ProductRow";
import { QuickViewProvider } from "@/components/collection/QuickViewModal";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/product/Breadcrumbs";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSections } from "@/components/product/ProductSections";
import { Badge } from "@/components/ui/Badge";
import { getK9Category, getProduct, getProductSlugs, getRelatedProducts } from "@/lib/data";
import { BRAND, K9_ROOT } from "@/lib/nav";
import type { Product } from "@/lib/types";

const COLLECTION_HREF = "/collections/collars";
const K9_BRAND = "PAKT-K9";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  // unknown slug: the page itself renders notFound(), metadata must not throw
  if (!product) {
    return {
      title: "Produkt niedostępny",
      description: "Ten produkt zmienił adres lub został wycofany ze sprzedaży.",
    };
  }

  const k9 = product.line === "k9";

  return {
    // sklep: sufiks "| PAKT" dokłada szablon tytułu z app/layout.tsx.
    // K9: absolute, bo ten sam szablon dokleiłby drugą markę ("... | PAKT-K9 | PAKT")
    title: k9 ? { absolute: `${product.name} | ${K9_BRAND}` } : product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} | ${k9 ? K9_BRAND : BRAND}`,
      description: product.description,
      images: [{ url: product.gallery[0], alt: product.name }],
    },
  };
}

function productJsonLd(product: Product): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: BRAND },
    offers: {
      "@type": "Offer",
      url: `/products/${product.slug}`,
      price: product.price,
      priceCurrency: product.currency,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  // escape "<" so a product name could never close the script element early
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const k9 = product.line === "k9";

  // Okruszki K9 prowadzily do /collections/collars, gdzie sprzetu K9 fizycznie nie ma
  // (seam wpuszcza do sklepu wylacznie line === "shop"). Sciezka musi wracac do katalogu,
  // z ktorego pozycja pochodzi.
  const [related, k9Category] = await Promise.all([
    getRelatedProducts(slug, 8),
    k9 && product.k9Category ? getK9Category(product.k9Category) : null,
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
                maskImage:
                  "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
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
          <ProductRow
            title={k9 ? "Z tej samej linii" : "Podobne produkty"}
            products={related}
            exploreHref={backHref}
          />
        </div>
      )}
    </QuickViewProvider>
  );
}
