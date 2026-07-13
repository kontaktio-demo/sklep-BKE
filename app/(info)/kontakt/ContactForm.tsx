"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { COMPANY } from "@/lib/nav";

const FIELD =
  "h-11 w-full rounded-[2px] border border-nf-border bg-nf-elevated px-3 text-sm text-nf-text placeholder:text-nf-dim";

const LABEL = "block text-[11px] uppercase tracking-[0.15em] text-nf-dim";

const SUBJECTS = [
  "Zamówienie i wysyłka",
  "Zwrot lub reklamacja",
  "Dobór rozmiaru",
  "Sprzęt PAKT-K9",
  "Inna sprawa",
];

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const subjectId = useId();
  const messageId = useId();
  const consentId = useId();

  if (sent) {
    return (
      <div role="status" className="mt-6 border border-nf-border bg-nf-elevated p-6">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-nf-white">
          Formularz wypełniony poprawnie
        </p>
        <p className="mt-3 text-sm leading-relaxed text-nf-muted">
          Wiadomość wyjdzie z tego formularza, gdy uruchomimy integrację poczty. Jeśli sprawa
          jest pilna, napisz na{" "}
          <a
            href={`mailto:${COMPANY.shopEmail}`}
            className="text-nf-text underline underline-offset-4"
          >
            {COMPANY.shopEmail}
          </a>{" "}
          albo zadzwoń: {COMPANY.phone}.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 flex min-h-11 items-center text-sm text-nf-muted underline underline-offset-4 transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
        >
          Wypełnij ponownie
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
      className="mt-6 space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={nameId} className={LABEL}>
            Imię i nazwisko
          </label>
          <input
            id={nameId}
            name="name"
            type="text"
            required
            autoComplete="name"
            className={`${FIELD} mt-2`}
          />
        </div>
        <div>
          <label htmlFor={emailId} className={LABEL}>
            Adres e-mail
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`${FIELD} mt-2`}
          />
        </div>
      </div>

      <div>
        <label htmlFor={subjectId} className={LABEL}>
          Temat
        </label>
        <select
          id={subjectId}
          name="subject"
          defaultValue={SUBJECTS[0]}
          className={`${FIELD} mt-2`}
        >
          {SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={messageId} className={LABEL}>
          Wiadomość
        </label>
        <textarea
          id={messageId}
          name="message"
          required
          rows={6}
          placeholder="Numer zamówienia, model obroży, obwód szyi psa - im konkretniej, tym szybciej odpiszemy."
          className="mt-2 w-full rounded-[2px] border border-nf-border bg-nf-elevated px-3 py-3 text-sm leading-relaxed text-nf-text placeholder:text-nf-dim"
        />
      </div>

      {/* zgoda RODO: pole wymagane, cel przetwarzania nazwany wprost */}
      <div className="flex gap-3">
        <input
          id={consentId}
          name="consent"
          type="checkbox"
          required
          className="mt-1 h-5 w-5 shrink-0 rounded-[2px] border border-nf-border-strong bg-nf-elevated accent-nf-red"
        />
        <label htmlFor={consentId} className="text-xs leading-relaxed text-nf-muted">
          Zgadzam się na przetwarzanie moich danych w celu odpowiedzi na wiadomość.
          Administratorem danych jest {COMPANY.legalName}. Szczegóły w{" "}
          <Link
            href="/polityka-prywatnosci"
            className="text-nf-text underline underline-offset-4"
          >
            polityce prywatności
          </Link>
          .
        </label>
      </div>

      <Button type="submit" size="lg" className="rounded-[2px]">
        Wyślij wiadomość
      </Button>
    </form>
  );
}
