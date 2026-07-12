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
                  "relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded border bg-nf-elevated transition-colors duration-200 ease-nf motion-reduce:transition-none lg:w-20",
                  isActive
                    ? "border-nf-white"
                    : "border-nf-border hover:border-nf-border-strong",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes={THUMB_SIZES}
                  className={cn(
                    "object-cover transition-opacity duration-200 ease-nf motion-reduce:transition-none",
                    isActive ? "opacity-100" : "opacity-70",
                  )}
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="relative order-1 aspect-[4/5] w-full min-w-0 overflow-hidden rounded-md border border-nf-border bg-nf-elevated lg:order-2 lg:flex-1">
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
                isActive ? "opacity-100" : "opacity-0",
              )}
            />
          );
        })}

        {badges && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {badges}
          </div>
        )}

        {hasThumbs && (
          // miniatury już ogłaszają "Zdjęcie 2 z 4" - to tylko wizualne echo
          <div
            aria-hidden="true"
            className="absolute bottom-3 right-3 z-10 rounded bg-nf-bg/70 px-2 py-1 text-xs text-nf-muted backdrop-blur"
          >
            {active + 1} / {count}
          </div>
        )}
      </div>
    </div>
  );
}
