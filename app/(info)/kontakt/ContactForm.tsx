"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { COMPANY } from "@/lib/nav";

// Formularz nie ma dokad wyslac wiadomosci - w serwisie nie ma backendu ani poczty.
// Zamiast udawac wysylke, sklada z pol gotowa tresc: mozna ja skopiowac albo otworzyc
// w swoim programie pocztowym. Ten sam wzorzec co ProInquiryForm.

const FIELD = "w-full rounded-[2px] border bg-nf-elevated text-sm text-nf-text placeholder:text-nf-dim";
const LINE = "h-11 px-3";
const BORDER_OK = "border-nf-border";
const BORDER_BAD = "border-nf-red-bright";
// type-label, nie type-meta: monospace niesie oznaczenia techniczne sekcji Dog Store Pro.
// Etykieta pola w formularzu sklepu cywilnego jedzie zwykla etykieta sklepu.
const LABEL = "type-label block text-nf-dim";
const ERROR = "mt-2 text-sm text-nf-red-bright";

const OTHER_SUBJECT = "Inna sprawa";

const SUBJECTS = [
  "Zamówienie i wysyłka",
  "Zwrot lub reklamacja",
  "Dobór rozmiaru",
  "Sprzęt Dog Store Pro",
  OTHER_SUBJECT,
];

// wystarczajaco scisly, zeby zlapac literowke, dosc luzny, zeby nie odrzucic poprawnego adresu
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface Values {
  name: string;
  email: string;
  subject: string;
  message: string;
  consent: boolean;
}

const EMPTY: Values = {
  name: "",
  email: "",
  subject: SUBJECTS[0],
  message: "",
  consent: false,
};

type FieldName = "name" | "email" | "message" | "consent";
type Errors = Partial<Record<FieldName, string>>;

/** Kolejnosc pol w ukladzie - po nieudanym submicie fokus idzie na pierwszy blad z tej listy. */
const ORDER: FieldName[] = ["name", "email", "message", "consent"];

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (!v.name.trim()) errors.name = "Podaj imię i nazwisko.";
  if (!v.email.trim()) errors.email = "Podaj adres e-mail.";
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = "Adres e-mail ma niepoprawny format.";
  if (!v.message.trim()) errors.message = "Wpisz treść wiadomości.";
  if (!v.consent) errors.consent = "Bez zgody nie mamy podstawy, żeby odpisać.";
  return errors;
}

function compose(v: Values): string {
  return [
    `Temat: ${v.subject}`,
    `Imię i nazwisko: ${v.name.trim()}`,
    `Adres e-mail: ${v.email.trim()}`,
    "",
    v.message.trim(),
  ].join("\n");
}

export function ContactForm() {
  // Pola trzymamy w stanie, nie w DOM: walidacja po submicie potrzebuje wartosci,
  // a powrot z panelu do formularza nie moze kasowac tego, co ktos wpisal.
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const nameId = useId();
  const emailId = useId();
  const subjectId = useId();
  const messageId = useId();
  const consentId = useId();

  const ids: Record<FieldName, string> = {
    name: nameId,
    email: emailId,
    message: messageId,
    consent: consentId,
  };

  // Po zatwierdzeniu formularz znika z ukladu, a fokus zostawal na <body>: czytnik nie
  // mial czego oglosic, a klawiatura wracala na poczatek strony. Naglowek panelu przejmuje
  // fokus (tabIndex -1), region status oglasza zmiane niezaleznie od fokusu.
  const confirmRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (sent) confirmRef.current?.focus();
  }, [sent]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // blad znika, gdy pole jest poprawiane - komunikat ma opisywac stan, a nie historie
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as FieldName];
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    const first = ORDER.find((field) => found[field]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    setSent(true);
  };

  if (sent) {
    const body = compose(values);
    const href = `mailto:${COMPANY.shopEmail}?subject=${encodeURIComponent(
      `Kontakt: ${values.subject}`
    )}&body=${encodeURIComponent(body)}`;

    return (
      <div className="mt-6 border border-nf-border bg-nf-elevated p-6">
        {/* Region status obejmuje naglowek i akapit, ale NIE blok <pre>: czytnik ma oglosic
            zmiane stanu, a nie recytowac cala przygotowana tresc. */}
        <div role="status" aria-live="polite">
          <h3 ref={confirmRef} tabIndex={-1} className="type-h3 text-nf-white">
            Wiadomość przygotowana
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-nf-muted">
            Ten formularz nie wysyła wiadomości. Skopiuj treść poniżej i wyślij ją na{" "}
            <a
              href={`mailto:${COMPANY.shopEmail}`}
              className="text-nf-text underline underline-offset-4"
            >
              {COMPANY.shopEmail}
            </a>{" "}
            albo otwórz ją w swoim programie pocztowym. Odpisujemy {COMPANY.responseTime}.
            Telefon: {COMPANY.phone}.
          </p>
        </div>

        {/* tresc do skopiowania siedzi w polu wglebionym (nf-elevated-2), nie na czerni:
            karta panelu jest juz jasna, wiec czarny blok gubilby tekst w obu swiatach.

            Monospace zostaje TYLKO tutaj: to podglad gotowego maila, wiec staly krok znaku
            pokazuje dokladnie ten tekst, ktory trafi do skrzynki. Reszta stron informacyjnych
            nie ma prawa uzywac kroju maszynowego - on nalezy do sekcji Dog Store Pro. */}
        <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-[2px] border border-nf-border bg-nf-elevated-2 p-4 font-mono text-xs leading-relaxed text-nf-text">
          {body}
        </pre>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* promien przycisku nalezy do Button (4 px), nie do wywolania */}
          <Button href={href} size="md">
            Otwórz w programie pocztowym
          </Button>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="flex min-h-11 items-center text-sm text-nf-muted underline underline-offset-4 transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
          >
            Wróć do formularza
          </button>
        </div>
      </div>
    );
  }

  return (
    // noValidate: dymki przegladarki znikaja same, nie da sie ich powiazac z polem przez
    // aria-describedby ani utrzymac w jednym jezyku. Warstwa bledow jest w calosci nasza,
    // atrybut required zostaje, bo niesie semantyke pola wymaganego dla czytnika.
    <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
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
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            className={`${FIELD} ${LINE} ${errors.name ? BORDER_BAD : BORDER_OK} mt-2`}
          />
          {errors.name && (
            <p id={`${nameId}-error`} className={ERROR}>
              {errors.name}
            </p>
          )}
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
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            className={`${FIELD} ${LINE} ${errors.email ? BORDER_BAD : BORDER_OK} mt-2`}
          />
          {errors.email && (
            <p id={`${emailId}-error`} className={ERROR}>
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor={subjectId} className={LABEL}>
          Temat
        </label>
        <select
          id={subjectId}
          name="subject"
          value={values.subject}
          onChange={(e) => set("subject", e.target.value)}
          className={`${FIELD} ${LINE} ${BORDER_OK} mt-2`}
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
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${messageId}-error` : undefined}
          placeholder="Numer zamówienia, model obroży, obwód szyi psa - im konkretniej, tym szybciej odpiszemy."
          className={`${FIELD} ${
            errors.message ? BORDER_BAD : BORDER_OK
          } mt-2 px-3 py-3 leading-relaxed`}
        />
        {errors.message && (
          <p id={`${messageId}-error`} className={ERROR}>
            {errors.message}
          </p>
        )}
      </div>

      {/* zgoda RODO: pole wymagane, cel przetwarzania nazwany wprost */}
      <div>
        <div className="flex gap-3">
          <input
            id={consentId}
            name="consent"
            type="checkbox"
            required
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${consentId}-error` : undefined}
            className={`mt-1 h-5 w-5 shrink-0 rounded-[2px] border bg-nf-elevated accent-nf-red ${
              errors.consent ? BORDER_BAD : "border-nf-border-strong"
            }`}
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
        {errors.consent && (
          <p id={`${consentId}-error`} className={ERROR}>
            {errors.consent}
          </p>
        )}
      </div>

      <Button type="submit" size="lg">
        Przygotuj wiadomość
      </Button>
      <p className="text-xs leading-relaxed text-nf-dim">
        Z pól złożymy treść wiadomości do skopiowania. Wysyłasz ją ze swojej skrzynki na{" "}
        {COMPANY.shopEmail}.
      </p>
    </form>
  );
}
