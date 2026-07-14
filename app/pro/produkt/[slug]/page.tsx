import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRO_BRAND, ProductPageView } from "@/components/product/ProductPageView";
import { getProProducts, getProduct } from "@/lib/data";

// Karta sprzetu Dog Store Pro. Osobna trasa, bo osobny sklep: z trasy bierze sie ciemny motyw
// sekcji, okruszki wracaja do katalogu Pro, a pozycja nie pojawia sie pod adresem sklepu
// cywilnego.
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const products = await getProProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || product.line !== "pro") {
    return {
      title: { absolute: `Pozycja niedostępna | ${PRO_BRAND}` },
      description: "Ta pozycja zmieniła adres lub została wycofana z katalogu.",
    };
  }

  return {
    // absolute: szablon "%s | Dog Store" z app/layout.tsx dokleilby druga marke
    // ("... | Dog Store Pro | Dog Store")
    title: { absolute: `${product.name} | ${PRO_BRAND}` },
    description: product.description,
    alternates: { canonical: `/pro/produkt/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} | ${PRO_BRAND}`,
      description: product.description,
      images: [{ url: product.gallery[0], alt: product.name }],
    },
  };
}

export default async function ProProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.line !== "pro") notFound();

  return <ProductPageView product={product} />;
}
