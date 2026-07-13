import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageView, productJsonLd } from "@/components/product/ProductPageView";
import { getProduct, getProducts } from "@/lib/data";
import { BRAND } from "@/lib/nav";

// Karta produktu SKLEPU CYWILNEGO. Sprzet PAKT-K9 ma wlasna przestrzen adresow
// (/k9/produkt/<slug>) i wlasny, ciemny motyw - tu jest niedostepny, tak samo jak
// w katalogu i w wyszukiwarce sklepu.
export { productJsonLd };

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const products = await getProducts("collars");
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  // nieznany slug albo pozycja z linii K9: strona renderuje notFound(), metadane nie moga rzucic
  if (!product || product.line !== "shop") {
    return {
      title: "Produkt niedostępny",
      description: "Ten produkt zmienił adres lub został wycofany ze sprzedaży.",
    };
  }

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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  // linia K9 pod adresem sklepu = 404. Ten sam sprzet ma swoj adres w sekcji K9,
  // wiec dublowanie go tutaj bylo by druga wystawa tego samego katalogu.
  if (!product || product.line !== "shop") notFound();

  return <ProductPageView product={product} />;
}
