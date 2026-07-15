import Image from "next/image";
import Link from "next/link";
import { photo } from "@/lib/photos";
import type { ProCategoryInfo } from "@/lib/types";
import { cn, plural } from "@/lib/utils";

/**
 * Siatka kategorii (PRO_IDENTITY.md §4 "product / category card").
 *
 * Karta: kadr u gory, wlosowa linia, kod PRO-0x monospace, tytul groteskiem 16 px,
 * liczba pozycji jako odczyt. Promien 2 px (token), obwodka wlosowa, tlo pro-surface.
 * Elewacja to ROZJASNIENIE OBWODKI i przyblizenie kadru - nigdy miekki cien (§4, §6).
 *
 * Kadry czekaja na zdjecia (public/foto/pro-<slug>.jpg). Bez pliku zostaje plaska
 * powierzchnia karty: zaden zastepnik nie udaje fotografii.
 */
export function ProCategoryGrid({ categories }: { categories: ProCategoryInfo[] }) {
  return (
    <section id="kategorie" aria-labelledby="kategorie-naglowek" className="bg-pro-bg">
      {/* sekcja gesta: rytm 56-88 px, nie ten sam padding co wszedzie (§3) */}
      <div className="mx-auto max-w-[1440px] px-5 py-[clamp(56px,6vw,88px)] md:px-8 lg:px-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="type-pro-eyebrow text-pro-muted">
              Katalog
            </p>
            <h2 id="kategorie-naglowek" className="type-pro-h2 mt-4 text-pro-white">
              Kategorie
            </h2>
          </div>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const src = photo(`pro-${cat.slug}.jpg`);
            return (
              <li key={cat.slug} className="flex">
                <Link
                  href={`/pro/${cat.slug}`}
                  className={cn(
                    "group flex w-full flex-col rounded-control border border-pro-border bg-pro-surface",
                    "transition-colors duration-250 ease-nf hover:border-pro-border-hi hover:bg-pro-raised",
                    "focus-visible:border-pro-border-hi motion-reduce:transition-none"
                  )}
                >
                  {/* Kadr pojawia sie DOPIERO ze zdjeciem. Pusta rama 4:3 robila z siatki
                      pole ciemnych prostokatow - a zastepnik, ktory udaje fotografie, jest
                      zakazany. Bez pliku karta jest karta danych i tyle. */}
                  {src && (
                    <div className="relative aspect-[4/3] overflow-hidden bg-pro-raised">
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
                  <div className={cn("p-5", src && "border-t border-pro-border")}>
                    <p className="type-pro-spec text-pro-muted">{cat.code}</p>
                    <h3 className="type-pro-h3 mt-2 text-pro-white">{cat.title}</h3>
                    <p className="type-pro-meta mt-2 line-clamp-2 text-pro-muted">
                      {cat.description}
                    </p>

                    <p className="type-pro-spec mt-4 flex items-center gap-2 text-pro-text">
                      <span aria-hidden="true" className="size-1 bg-pro-red" />
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
