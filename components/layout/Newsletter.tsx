"use client";

// §8-J [VERDICT: NSDW] - pas z zapisem na newsletter, w motywie strony

import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { isLightRoute } from "@/components/layout/ThemeSync";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function Newsletter() {
  const pathname = usePathname();
  const light = isLightRoute(pathname);
  const [submitted, setSubmitted] = useState(false);
  const emailId = useId();
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "border-y py-16 md:py-20",
        light ? "border-pk-line bg-pk-paper-2" : "border-nf-border bg-nf-black"
      )}
    >
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 md:px-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          <p
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.25em]",
              light ? "text-pk-ink-muted" : "text-nf-dim"
            )}
          >
            Newsletter
          </p>
          <h2
            id={headingId}
            className={cn(
              "mt-4 font-display text-2xl font-bold uppercase leading-tight tracking-tight md:text-3xl",
              light ? "text-pk-ink" : "text-white"
            )}
          >
            Nowe modele trafiają
            <br />
            najpierw do subskrybentów
          </h2>
        </div>

        <div className="lg:col-span-7">
          {submitted ? (
            <p
              role="status"
              className={cn(
                "flex items-center gap-2 border-t pt-6",
                light ? "border-pk-line text-pk-ink-2" : "border-nf-border text-nf-text"
              )}
            >
              <CheckIcon
                className={cn("shrink-0", light ? "text-pk-red" : "text-nf-red-bright")}
              />
              Sprawdź skrzynkę. Kod rabatowy jest już w drodze.
            </p>
          ) : (
            <form
              className={cn(
                "flex flex-col gap-3 border-t pt-6 sm:flex-row",
                light ? "border-pk-line" : "border-nf-border"
              )}
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <label htmlFor={emailId} className="sr-only">
                Adres e-mail
              </label>
              <input
                id={emailId}
                type="email"
                required
                placeholder="Adres e-mail"
                className={cn(
                  "h-12 flex-1 rounded-[2px] border px-4 text-sm",
                  light
                    ? "border-pk-line-strong bg-pk-paper text-pk-ink placeholder:text-pk-ink-muted"
                    : "border-nf-border bg-nf-elevated text-nf-text placeholder:text-nf-dim"
                )}
              />
              <Button
                type="submit"
                className={cn(
                  "h-12 rounded-[2px]",
                  light && "bg-pk-ink text-pk-paper hover:bg-pk-red"
                )}
              >
                Zapisz się
              </Button>
            </form>
          )}
          <p
            className={cn(
              "mt-3 text-xs",
              light ? "text-pk-ink-muted" : "text-nf-dim"
            )}
          >
            Odbierz -10% na pierwsze zamówienie. Wypisujesz się jednym kliknięciem.
          </p>
        </div>
      </div>
    </section>
  );
}
