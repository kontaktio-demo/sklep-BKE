"use client";

// §8-J [VERDICT: NSDW] — dark band, uppercase heading, email capture stub

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  const emailId = useId();
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="border-y border-nf-border bg-nf-black py-16 md:py-20"
    >
      <div className="mx-auto max-w-xl px-4 text-center">
        <h2
          id={headingId}
          className="font-display text-2xl font-black uppercase tracking-tight text-nf-white md:text-3xl"
        >
          Zapisz się do newslettera
        </h2>
        <p className="mt-2 text-nf-muted">Odbierz -10% na pierwsze zamówienie.</p>
        {submitted ? (
          <p
            role="status"
            className="mt-6 flex items-center justify-center gap-2 text-nf-text"
          >
            <CheckIcon className="shrink-0 text-nf-red" />
            Sprawdź skrzynkę — witamy w stadzie.
          </p>
        ) : (
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
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
              className="h-12 flex-1 rounded-[4px] border border-nf-border bg-nf-elevated px-4 text-sm text-nf-text placeholder:text-nf-dim"
            />
            <Button type="submit" className="h-12">
              Zapisz się
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
