"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
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

// wystarczajaco scisly, zeby zlapac literowke, dosc luzny, zeby nie odrzucic poprawnego adresu
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// klucze tematow - kolejnosc w liscie rozwijanej. Etykiety tlumaczy slownik.
const SUBJECT_KEYS = ["order", "return", "sizing", "pro", "other"] as const;

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
  subject: "",
  message: "",
  consent: false,
};

type FieldName = "name" | "email" | "message" | "consent";
type Errors = Partial<Record<FieldName, string>>;

/** Kolejnosc pol w ukladzie - po nieudanym submicie fokus idzie na pierwszy blad z tej listy. */
const ORDER: FieldName[] = ["name", "email", "message", "consent"];

export function ContactForm() {
  const t = useTranslations("infoPages");
  const tc = useTranslations("common");

  // etykiety tematow z jednego zrodla (SUBJECT_KEYS): sam wybor idzie do backendu jako tekst,
  // a lista rozwijana i wartosc poczatkowa czytaja to samo
  const subjects = SUBJECT_KEYS.map((key) => t(`kontakt.form.subjects.${key}`));

  const validate = (v: Values): Errors => {
    const errors: Errors = {};
    if (!v.name.trim()) errors.name = t("kontakt.form.errors.name");
    if (!v.email.trim()) errors.email = t("kontakt.form.errors.emailRequired");
    else if (!EMAIL_RE.test(v.email.trim())) errors.email = t("kontakt.form.errors.emailInvalid");
    if (!v.message.trim()) errors.message = t("kontakt.form.errors.message");
    if (!v.consent) errors.consent = t("kontakt.form.errors.consent");
    return errors;
  };

  // Pola trzymamy w stanie, nie w DOM: walidacja po submicie potrzebuje wartosci,
  // a powrot z panelu do formularza nie moze kasowac tego, co ktos wpisal.
  const [values, setValues] = useState<Values>(() => ({ ...EMPTY, subject: subjects[0] }));
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    const first = ORDER.find((field) => found[field]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    setBusy(true);
    setSendError(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject,
        message: values.message.trim(),
      }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false }));
    setBusy(false);
    if (res.ok) setSent(true);
    else setSendError(t("kontakt.form.sendError", { email: COMPANY.shopEmail }));
  };

  if (sent) {
    return (
      <div className="mt-6 border border-nf-border bg-nf-elevated p-6">
        <div role="status" aria-live="polite">
          <h3 ref={confirmRef} tabIndex={-1} className="type-h3 text-nf-white">
            {t("kontakt.form.sent.title")}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-nf-muted">
            {t("kontakt.form.sent.body", {
              responseTime: tc("company.responseTime"),
              email: values.email.trim(),
              phone: COMPANY.phone,
            })}
          </p>
        </div>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setValues({ ...EMPTY, subject: subjects[0] });
            }}
            className="flex min-h-11 items-center text-sm text-nf-muted underline underline-offset-4 transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
          >
            {t("kontakt.form.sent.again")}
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
            {t("kontakt.form.nameLabel")}
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
            {t("kontakt.form.emailLabel")}
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
          {t("kontakt.form.subjectLabel")}
        </label>
        <select
          id={subjectId}
          name="subject"
          value={values.subject}
          onChange={(e) => set("subject", e.target.value)}
          className={`${FIELD} ${LINE} ${BORDER_OK} mt-2`}
        >
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={messageId} className={LABEL}>
          {t("kontakt.form.messageLabel")}
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
          placeholder={t("kontakt.form.messagePlaceholder")}
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
            {t.rich("kontakt.form.consent", {
              legalName: COMPANY.legalName,
              link: (chunks) => (
                <Link
                  href="/polityka-prywatnosci"
                  className="text-nf-text underline underline-offset-4"
                >
                  {chunks}
                </Link>
              ),
            })}
          </label>
        </div>
        {errors.consent && (
          <p id={`${consentId}-error`} className={ERROR}>
            {errors.consent}
          </p>
        )}
      </div>

      {sendError && <p className={ERROR}>{sendError}</p>}
      <Button type="submit" size="lg" disabled={busy}>
        {busy ? t("kontakt.form.sending") : t("kontakt.form.submit")}
      </Button>
      <p className="text-xs leading-relaxed text-nf-dim">
        {t("kontakt.form.footer", {
          responseTime: tc("company.responseTime"),
          email: COMPANY.shopEmail,
        })}
      </p>
    </form>
  );
}
