import { notFound } from "next/navigation";
import { getCollection, getFilters, getProducts } from "@/lib/data";
import { CollectionHero } from "@/components/collection/CollectionHero";
import { CollectionView } from "@/components/collection/CollectionView";
import { NetflixRow } from "@/components/collection/NetflixRow";
import { TopTenRow } from "@/components/collection/TopTenRow";
import { QuickViewProvider } from "@/components/collection/QuickViewModal";

export function generateStaticParams() {
  return [{ handle: "collars" }];
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
        <CollectionView products={products} groups={groups} />
      </div>

      {/* Netflix rows - secondary discovery under the primary grid (§7-2/3, §8-H) */}
      <div className="space-y-12 pb-20 pt-4">
        <TopTenRow products={products} title="Top 10 bestsellerów" />
        <NetflixRow
          id="row-working"
          title="Obroże robocze"
          products={working}
          exploreHref="/collections/collars"
        />
        <NetflixRow
          id="row-everyday"
          title="Na co dzień"
          products={everyday}
          exploreHref="/collections/collars"
        />
        <NetflixRow
          id="row-e-collar"
          title="Kompatybilne z e-obrożą"
          products={eCollar}
          exploreHref="/collections/collars"
        />
      </div>
    </QuickViewProvider>
  );
}
