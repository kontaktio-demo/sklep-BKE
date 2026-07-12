import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { NetflixRow } from "@/components/collection/NetflixRow";
import { QuickViewProvider } from "@/components/collection/QuickViewModal";
import { ReturnIcon, ShieldIcon, TruckIcon } from "@/components/ui/icons";

const CATEGORIES = [
  {
    title: "Robocze",
    copy: "Szerokie taśmy, wzmocnione okucia, miejsce na panel ID.",
    image: "/placeholder/ranger-duty-collar-1.svg",
  },
  {
    title: "Na co dzień",
    copy: "Lżejsze konstrukcje na spacery i szkolenie podstawowe.",
    image: "/placeholder/fjord-everyday-collar-1.svg",
  },
  {
    title: "Pod e-obrożę",
    copy: "Taśmy przygotowane pod moduły do 45 mm.",
    image: "/placeholder/bolt-e-fit-collar-1.svg",
  },
];

const PROMISES = [
  {
    Icon: ShieldIcon,
    title: "2 lata gwarancji",
    copy: "Na taśmy, szwy i okucia. Zgłoszenie przez formularz, bez odsyłania do producenta.",
  },
  {
    Icon: TruckIcon,
    title: "Wysyłka w 24 h",
    copy: "Zamówienia złożone w dni robocze do 14:00 pakujemy tego samego dnia.",
  },
  {
    Icon: ReturnIcon,
    title: "60 dni na zwrot",
    copy: "Obroża nie pasuje na psa? Odsyłasz na nasz koszt i dobieramy rozmiar.",
  },
];

export default async function Home() {
  const products = await getProducts("collars");
  const bestsellers = products
    .filter((p) => p.bestsellerRank != null)
    .sort((a, b) => (a.bestsellerRank ?? 99) - (b.bestsellerRank ?? 99))
    .slice(0, 10);

  return (
    <QuickViewProvider>
      <section className="relative -mt-16 h-[78svh] min-h-[520px] max-h-[860px] overflow-hidden lg:-mt-[72px]">
        {/* Header czyta ten znacznik, żeby startować przezroczysty nad hero */}
        <span data-hero-sentinel aria-hidden="true" className="absolute top-0 h-px w-px" />
        <Image
          src="/placeholder/hero-collars.svg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 scrim-bottom" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 scrim-left" />

        <div className="absolute inset-x-0 bottom-12 md:bottom-20">
          <div className="mx-auto max-w-[1600px] px-4 md:px-6">
            <div className="max-w-2xl space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-nf-red-bright">
                Sprzęt dla psów pracujących
              </p>
              <h1
                className="font-display font-black uppercase leading-[0.95] tracking-tight text-white"
                style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
              >
                Obroże, które
                <br />
                wracają z terenu
              </h1>
              <p className="max-w-xl text-base text-nf-text/90 md:text-lg">
                Taśmy 1000D, okucia ze stopu cynku, szycie w Polsce. Ten sam sprzęt
                noszą psy służbowe i psy, które wychodzą na spacer dwa razy dziennie.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button size="lg" href="/collections/collars">
                  Zobacz obroże
                </Button>
                <Button size="lg" variant="ghost" href="/collections/collars#top-ten">
                  Bestsellery
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Kategorie" className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 lg:py-20">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              href="/collections/collars"
              className="group relative block overflow-hidden rounded-md border border-nf-border bg-nf-elevated"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  sizes="(min-width:768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-300 ease-nf motion-safe:group-hover:scale-[1.04]"
                />
                <div aria-hidden="true" className="absolute inset-0 scrim-bottom" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h2 className="font-display text-xl font-bold tracking-tight text-white">
                  {cat.title}
                </h2>
                <p className="mt-1 max-w-xs text-sm text-nf-muted">{cat.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <NetflixRow
        id="bestsellery"
        title="Najczęściej kupowane"
        products={bestsellers}
        exploreHref="/collections/collars"
      />

      <section
        aria-label="Nasze zasady"
        className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 lg:py-24"
      >
        <div className="grid gap-10 border-t border-nf-border pt-12 md:grid-cols-3 md:gap-8">
          {PROMISES.map(({ Icon, title, copy }) => (
            <div key={title} className="space-y-3">
              <Icon width={24} height={24} className="text-nf-red-bright" />
              <h2 className="font-display text-lg font-bold tracking-tight text-white">{title}</h2>
              <p className="max-w-sm text-sm leading-relaxed text-nf-muted">{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </QuickViewProvider>
  );
}
