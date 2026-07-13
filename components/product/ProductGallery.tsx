"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const MAIN_SIZES = "(min-width:1024px) 620px, 100vw";
const THUMB_SIZES = "(min-width:1024px) 80px, 64px";

export function ProductGallery({
  images,
  alt,
  badges,
}: {
  images: string[];
  alt: string;
  badges?: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const count = images.length;
  const hasThumbs = count > 1;

  function select(index: number) {
    const next = (index + count) % count;
    setActive(next);
    thumbRefs.current[next]?.focus();
  }

  function handleThumbKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      select(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      select(active - 1);
    }
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
      {hasThumbs && (
        <div
          role="group"
          aria-label="Miniatury zdjęć produktu"
          onKeyDown={handleThumbKeys}
          className="no-scrollbar order-2 flex gap-3 overflow-x-auto lg:order-1 lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-visible"
        >
          {images.map((src, i) => {
            const isActive = i === active;
            return (
              <button
                key={src}
                type="button"
                ref={(node) => {
                  thumbRefs.current[i] = node;
                }}
                onClick={() => setActive(i)}
                aria-label={`Zdjęcie ${i + 1} z ${count}`}
                aria-pressed={isActive}
                className={cn(
                  // nieaktywna miniatura jest wygaszona w całości (ramka + zdjęcie),
                  // nie samym obrazkiem - dzięki temu kadr nie "miga" kontrastem
                  "relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-[2px] border bg-nf-elevated transition-[opacity,border-color] duration-200 ease-nf hover:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none lg:w-20",
                  isActive
                    ? "border-nf-white opacity-100"
                    : "border-nf-border opacity-60"
                )}
              >
                <Image
                  src={src}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes={THUMB_SIZES}
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="order-1 flex min-w-0 flex-col gap-2 lg:order-2 lg:flex-1">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] border border-nf-border bg-nf-elevated">
          {images.map((src, i) => {
            const isActive = i === active;
            return (
              <Image
                key={src}
                src={src}
                alt={isActive ? alt : ""}
                aria-hidden={isActive ? undefined : "true"}
                fill
                // all frames stay mounted so the swap is a crossfade, not a reload;
                // only the first one is the LCP candidate
                priority={i === 0}
                sizes={MAIN_SIZES}
                className={cn(
                  "object-cover transition-opacity duration-200 ease-nf motion-reduce:transition-none",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              />
            );
          })}

          {badges && (
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
              {badges}
            </div>
          )}
        </div>

        {hasThumbs && (
          // licznik siedzi pod kadrem, nie na zdjęciu - miniatury i tak ogłaszają
          // "Zdjęcie 2 z 4", więc dla czytnika ekranu to tylko wizualne echo
          <p aria-hidden="true" className="text-right text-xs tabular-nums text-nf-dim">
            {active + 1} / {count}
          </p>
        )}
      </div>
    </div>
  );
}
