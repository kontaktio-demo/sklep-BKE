import Image from "next/image";
import Link from "next/link";
import { photo } from "@/lib/photos";
import type { K9CategoryInfo } from "@/lib/types";
import { cn, plural } from "@/lib/utils";

/**
 * Siatka kategorii (K9_IDENTITY.md §4 "product / category card").
 *
 * Karta: kadr u gory, wlosowa linia, kod K9-0x monospace, tytul groteskiem 16 px,
 * liczba pozycji jako odczyt. Promien 2 px (token), obwodka wlosowa, tlo k9-surface.
 * Elewacja to ROZJASNIENIE OBWODKI i przyblizenie kadru - nigdy miekki cien (§4, §6).
 *
 * Kadry czekaja na zdjecia (public/foto/k9-<slug>.jpg). Bez pliku zostaje plaska
 * powierzchnia karty: zaden zastepnik nie udaje fotografii.
 */
export function K9CategoryGrid({ categories }: { categories: K9CategoryInfo[] }) {
  return (
    <section id="kategorie" aria-labelledby="kategorie-naglowek" className="bg-k9-bg">
      {/* sekcja gesta: rytm 56-88 px, nie ten sam padding co wszedzie (§3) */}
      <div className="mx-auto max-w-[1440px] px-5 py-[clamp(56px,6vw,88px)] md:px-8 lg:px-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="type-k9-eyebrow text-k9-muted">
              Katalog
              <span aria-hidden="true" className="px-2 text-k9-red">
                {"//"}
              </span>
              5 kategorii
            </p>
            <h2 id="kategorie-naglowek" className="type-k9-h2 mt-4 text-k9-white">
              Kategorie
            </h2>
          </div>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const src = photo(`k9-${cat.slug}.jpg`);
            return (
              <li key={cat.slug} className="flex">
                <Link
                  href={`/k9/${cat.slug}`}
                  className={cn(
                    "group flex w-full flex-col rounded-control border border-k9-border bg-k9-surface",
                    "transition-colors duration-250 ease-nf hover:border-k9-border-hi hover:bg-k9-raised",
                    "focus-visible:border-k9-border-hi motion-reduce:transition-none"
                  )}
                >
                  {/* Kadr pojawia sie DOPIERO ze zdjeciem. Pusta rama 4:3 robila z siatki
                      pole ciemnych prostokatow - a zastepnik, ktory udaje fotografie, jest
                      zakazany. Bez pliku karta jest karta danych i tyle. */}
                  {src && (
                    <div className="relative aspect-[4/3] overflow-hidden bg-k9-raised">
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-250 ease-nf motion-safe:group-hover:scale-[1.05] motion-reduce:transition-none"
                      />
                    </div>
                  )}

                  {/* wlosowa linia miedzy kadrem a danymi - tak samo jak w karcie produktu */}
                  <div className={cn("p-5", src && "border-t border-k9-border")}>
                    <p className="type-k9-spec text-k9-muted">{cat.code}</p>
                    <h3 className="type-k9-h3 mt-2 text-k9-white">{cat.title}</h3>
                    <p className="type-k9-meta mt-2 line-clamp-2 text-k9-muted">
                      {cat.description}
                    </p>

                    <p className="type-k9-spec mt-4 flex items-center gap-2 text-k9-text">
                      <span aria-hidden="true" className="size-1 bg-k9-red" />
                      {cat.productCount}{" "}
                      {plural(cat.productCount, "pozycja", "pozycje", "pozycji")}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
