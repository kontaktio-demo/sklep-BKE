"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { Collection } from "@/lib/types";
import { Button } from "@/components/ui/Button";

// R3F chunk never loads for reduced-motion users; Billboard3D self-guards too —
// double-gating is intended (§10).
const Billboard3D = dynamic(() => import("@/components/motion/Billboard3D"), {
  ssr: false,
});

function useMotionOk(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setOk(!mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);
  return ok;
}

// §8-D [VERDICT: NSDW hero content model → Netflix billboard per §7-1]
export function CollectionHero({ collection }: { collection: Collection }) {
  const motionOk = useMotionOk();

  return (
    // negative top margin pulls the hero behind the transparent sticky header
    <section className="relative -mt-16 h-[72svh] max-h-[820px] min-h-[480px] w-full overflow-hidden lg:-mt-[72px]">
      {/* Header observes this to stay transparent while over the hero */}
      <span data-hero-sentinel aria-hidden="true" className="absolute top-0 h-px w-px" />

      <Image
        src={collection.heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {motionOk && (
        <Billboard3D className="absolute inset-y-0 right-0 hidden w-1/2 md:block" />
      )}

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 scrim-bottom" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 scrim-left" />

      <div className="absolute inset-x-0 bottom-10 md:bottom-16">
        <div className="mx-auto max-w-[1600px] px-4 md:px-6">
          <div className="max-w-2xl space-y-4 md:space-y-5">
            <p className="text-xs font-semibold tracking-[0.35em] text-nf-red-bright">
              KOLEKCJA
            </p>
            <h1
              className="font-display font-black uppercase leading-[0.95] tracking-tight text-white"
              style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
            >
              {collection.title}
            </h1>
            <p className="max-w-xl text-base text-nf-text/90 md:text-lg">
              {collection.description}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button size="lg" variant="primary" href="#product-grid">
                Zobacz kolekcję
              </Button>
              <Button size="lg" variant="ghost" href="#top-ten">
                Top 10 bestsellerów
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
