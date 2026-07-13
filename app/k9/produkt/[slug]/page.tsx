import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { K9_BRAND, ProductPageView } from "@/components/product/ProductPageView";
import { getK9Products, getProduct } from "@/lib/data";

// Karta sprzetu PAKT-K9. Osobna trasa, bo osobny sklep: z trasy bierze sie ciemny motyw
// sekcji, okruszki wracaja do katalogu K9, a pozycja nie pojawia sie pod adresem sklepu
// cywilnego.
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const products = await getK9Products();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || product.line !== "k9") {
    return {
      title: { absolute: `Pozycja niedostępna | ${K9_BRAND}` },
      description: "Ta pozycja zmieniła adres lub została wycofana z katalogu.",
    };
  }

  return {
    // absolute: szablon "%s | PAKT" z app/layout.tsx dokleilby druga marke
    // ("... | PAKT-K9 | PAKT")
    title: { absolute: `${product.name} | ${K9_BRAND}` },
    description: product.description,
    alternates: { canonical: `/k9/produkt/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} | ${K9_BRAND}`,
      description: product.description,
      images: [{ url: product.gallery[0], alt: product.name }],
    },
  };
}

export default async function K9ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.line !== "k9") notFound();

  return <ProductPageView product={product} />;
}
