import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NetflixRow } from "@/components/collection/NetflixRow";
import { QuickViewProvider } from "@/components/collection/QuickViewModal";
import { Breadcrumbs } from "@/components/product/Breadcrumbs";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSections } from "@/components/product/ProductSections";
import { Badge } from "@/components/ui/Badge";
import { getProduct, getProductSlugs, getRelatedProducts } from "@/lib/data";
import { BRAND } from "@/lib/nav";
import type { Product } from "@/lib/types";

const COLLECTION_HREF = "/collections/collars";

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

  // sufiks "| PAKT" dokłada szablon tytułu z app/layout.tsx
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} | ${BRAND}`,
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

  const related = await getRelatedProducts(slug, 8);

  return (
    <QuickViewProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: productJsonLd(product) }}
      />

      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-8 md:px-6">
        <Breadcrumbs
          items={[
            { label: "Strona główna", href: "/" },
            { label: "Obroże", href: COLLECTION_HREF },
            { label: product.name },
          ]}
        />

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

      {related.length > 0 && (
        <div className="border-t border-nf-border pb-20 pt-14">
          <NetflixRow
            title="Podobne produkty"
            products={related}
            exploreHref={COLLECTION_HREF}
          />
        </div>
      )}
    </QuickViewProvider>
  );
}
