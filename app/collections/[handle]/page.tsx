import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection, getFilters, getProducts } from "@/lib/data";
import { CollectionHero } from "@/components/collection/CollectionHero";
import { CollectionView } from "@/components/collection/CollectionView";
import { ProductRow } from "@/components/collection/ProductRow";
import { BestsellerRow } from "@/components/collection/BestsellerRow";
import { QuickViewProvider } from "@/components/collection/QuickViewModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { BRAND } from "@/lib/nav";

export function generateStaticParams() {
  return [{ handle: "collars" }];
}

const SKELETON_CARDS = 8;

// CollectionView czyta filtry z URL (useSearchParams), a strona jest prerenderowana -
// bez granicy Suspense build by tego nie przepuscil. Szkielet powtarza uklad siatki
// (kolumna filtrow + pasek + kafle), zeby wejscie na liste nie skakalo.
function CollectionSkeleton() {
  return (
    <div role="status" className="flex items-start gap-8 xl:gap-10">
      <span className="sr-only">Wczytywanie listy produktów</span>

      <div className="hidden w-64 shrink-0 lg:block xl:w-72">
        <Skeleton className="h-11 w-full motion-reduce:animate-none" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-6 w-full motion-reduce:animate-none" />
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4 border-b border-nf-border py-4">
          <Skeleton className="h-5 w-28 motion-reduce:animate-none" />
          <Skeleton className="h-11 w-44 motion-reduce:animate-none" />
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 pt-6 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: SKELETON_CARDS }, (_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[4/5] w-full rounded-[2px] motion-reduce:animate-none" />
              <Skeleton className="mt-4 h-4 w-3/4 motion-reduce:animate-none" />
              <Skeleton className="mt-2 h-4 w-1/3 motion-reduce:animate-none" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  // nieznany handle: strona renderuje notFound(), metadane nie moga rzucic bledem
  const collection = await getCollection(handle).catch(() => null);

  if (!collection) {
    return {
      title: "Kolekcja niedostępna",
      description: "Ta kolekcja zmieniła adres lub została wycofana.",
    };
  }

  return {
    // sufiks "| PAKT" dokłada szablon tytułu z app/layout.tsx
    title: collection.title,
    description: collection.description,
    alternates: { canonical: `/collections/${collection.handle}` },
    openGraph: {
      type: "website",
      title: `${collection.title} | ${BRAND}`,
      description: collection.description,
      images: [{ url: collection.heroImage, alt: collection.title }],
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const [collection, products, groups] = await Promise.all([
    getCollection(handle).catch(() => null),
    getProducts(handle).catch(() => null),
    getFilters(handle).catch(() => null),
  ]);
  if (!collection || !products || !groups) notFound();

  const working = products.filter((p) => p.category === "working");
  const everyday = products.filter((p) => p.category === "non-working");
  const eCollar = products.filter((p) => p.category === "e-collar");

  return (
    <QuickViewProvider>
      <CollectionHero collection={collection} />

      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6 lg:py-14">
        <Suspense fallback={<CollectionSkeleton />}>
          <CollectionView products={products} groups={groups} />
        </Suspense>
      </div>

      {/* Rzedy produktow - wtorna sciezka odkrywania pod glowna siatka (§8-H) */}
      <div className="space-y-12 pb-20 pt-4">
        <BestsellerRow products={products} title="Top 10 bestsellerów" />
        <ProductRow
          id="row-working"
          title="Obroże robocze"
          products={working}
          exploreHref="/collections/collars"
        />
        <ProductRow
          id="row-everyday"
          title="Na co dzień"
          products={everyday}
          exploreHref="/collections/collars"
        />
        <ProductRow
          id="row-e-collar"
          title="Kompatybilne z e-obrożą"
          products={eCollar}
          exploreHref="/collections/collars"
        />
      </div>
    </QuickViewProvider>
  );
}
