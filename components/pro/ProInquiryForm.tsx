"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";
import type { ProCategoryInfo, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProInquiryFormProps {
  categories: ProCategoryInfo[];
  products: Product[];
}

const FIELD = "w-full rounded-[2px] border bg-nf-elevated text-sm text-nf-text placeholder:text-nf-dim";
const LINE = "h-12 px-4";
const BORDER_OK = "border-nf-border";
const BORDER_BAD = "border-nf-red-bright";
const LABEL = "type-meta block text-nf-dim";
const ERROR = "mt-2 text-sm text-nf-red-bright";

// wystarczajaco scisly, zeby zlapac literowke, dosc luzny, zeby nie odrzucic poprawnego adresu
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MAX_QTY = 999;

interface Values {
  unit: string;
  person: string;
  email: string;
  phone: string;
  deadline: string;
  notes: string;
  consent: boolean;
}

const EMPTY: Values = {
  unit: "",
  person: "",
  email: "",
  phone: "",
  deadline: "",
  notes: "",
  consent: false,
};

type FieldName = "unit" | "person" | "email" | "consent";
type Errors = Partial<Record<FieldName, string>>;

/** Kolejnosc pol w ukladzie - po nieudanym submicie fokus idzie na pierwszy blad z tej listy. */
const ORDER: FieldName[] = ["unit", "person", "email", "consent"];

// Formularz zapytania ofertowego. Nie wysyla nic na serwer - serwis nie ma backendu -
// wiec po zatwierdzeniu pokazuje uczciwe podsumowanie z gotowa trescia do skopiowania
// i adresem, pod ktory mozna ja wyslac. Zadnej udawanej wysylki.
export function ProInquiryForm({ categories, products }: ProInquiryFormProps) {
  const t = useTranslations("pro");

  const validate = (v: Values): Errors => {
    const errors: Errors = {};
    if (!v.unit.trim()) errors.unit = t("form.validation.unit");
    if (!v.person.trim()) errors.person = t("form.validation.person");
    if (!v.email.trim()) errors.email = t("form.validation.emailRequired");
    else if (!EMAIL_RE.test(v.email.trim())) errors.email = t("form.validation.emailInvalid");
    if (!v.consent) errors.consent = t("form.validation.consent");
    return errors;
  };

  // Wartosci pol w stanie, nie w DOM: walidacja po submicie ich potrzebuje, a powrot
  // z podsumowania nie moze kasowac tego, co ktos wpisal.
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [items, setItems] = useState<Record<string, number>>({});
  const [summary, setSummary] = useState<string | null>(null);

  // Jeden komunikat dla calego steppera. Sam licznik przy pozycji oglasza gola liczbe
  // ("3"), bez nazwy pozycji - a wlasnie nazwa niesie tu cala informacje.
  const [announcement, setAnnouncement] = useState("");

  const unitId = useId();
  const personId = useId();
  const emailId = useId();
  const phoneId = useId();
  const deadlineId = useId();
  const notesId = useId();
  const consentId = useId();

  const ids: Record<FieldName, string> = {
    unit: unitId,
    person: personId,
    email: emailId,
    consent: consentId,
  };

  // Po zatwierdzeniu formularz znika z ukladu, a fokus zostawal na <body>: czytnik nie
  // mial czego oglosic, a klawiatura wracala na poczatek strony. Naglowek podsumowania
  // przejmuje fokus (tabIndex -1), region status oglasza zmiane niezaleznie od fokusu.
  const confirmRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (summary) confirmRef.current?.focus();
  }, [summary]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as FieldName];
      return next;
    });
  };

  const setQty = (product: Product, qty: number) => {
    const next = Math.min(Math.max(qty, 0), MAX_QTY);
    setItems((prev) => {
      const copy = { ...prev };
      if (next <= 0) delete copy[product.slug];
      else copy[product.slug] = next;
      return copy;
    });
    setAnnouncement(
      next === 0
        ? t("form.qtyNone", { name: product.name })
        : t("form.qtyAnnounce", { name: product.name, count: next })
    );
  };

  const chosen = products.filter((p) => items[p.slug]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    const first = ORDER.find((field) => found[field]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }

    const lines = chosen.map((p) =>
      t("form.summary.itemLine", { name: p.name, sku: p.sku, qty: items[p.slug] })
    );

    setSummary(
      [
        t("form.summary.unit", { value: values.unit.trim() }),
        t("form.summary.person", { value: values.person.trim() }),
        t("form.summary.email", { value: values.email.trim() }),
        t("form.summary.phone", {
          value: values.phone.trim() || t("form.summary.notEntered"),
        }),
        t("form.summary.deadline", {
          value: values.deadline.trim() || t("form.summary.notEntered"),
        }),
        "",
        t("form.summary.itemsLabel"),
        ...(lines.length > 0 ? lines : [t("form.summary.itemsNone")]),
        "",
        t("form.summary.notes", { value: values.notes.trim() || t("form.summary.notesNone") }),
      ].join("\n")
    );
  };

  if (summary) {
    return (
      <div className="max-w-3xl">
        {/* Region status obejmuje naglowek i akapit, ale NIE blok <pre>: czytnik ma oglosic
            zmiane stanu, a nie recytowac cale zapytanie. */}
        <div role="status" aria-live="polite">
          <h2
            ref={confirmRef}
            tabIndex={-1}
            className="type-h2 flex items-center gap-3 text-white"
          >
            <CheckIcon className="shrink-0 text-nf-text" />
            {t("form.success.heading")}
          </h2>
          <p className="mt-4 leading-relaxed text-nf-muted">
            {t.rich("form.success.body", {
              email: (chunks) => (
                <a
                  href="mailto:pro@dogstore.pl"
                  className="text-white underline underline-offset-4 hover:text-nf-red-bright"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>

        <pre className="mt-6 overflow-x-auto whitespace-pre-wrap rounded-[2px] border border-nf-border bg-nf-elevated p-5 font-mono text-xs leading-relaxed text-nf-text">
          {summary}
        </pre>
        <button
          type="button"
          onClick={() => setSummary(null)}
          className="type-meta mt-6 inline-flex min-h-11 items-center text-nf-dim transition-colors hover:text-white"
        >
          {t("form.success.back")}
        </button>
      </div>
    );
  }

  return (
    // noValidate: dymki przegladarki znikaja same i nie da sie ich powiazac z polem przez
    // aria-describedby. Warstwa bledow jest nasza, required zostaje - niesie semantyke
    // pola wymaganego dla czytnika ekranu.
    <form onSubmit={handleSubmit} noValidate className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <h2 className="type-h2 text-white">{t("form.dataHeading")}</h2>
        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor={unitId} className={LABEL}>
              {t("form.unitLabel")}
            </label>
            <input
              id={unitId}
              name="unit"
              required
              value={values.unit}
              onChange={(e) => set("unit", e.target.value)}
              aria-invalid={errors.unit ? true : undefined}
              aria-describedby={errors.unit ? `${unitId}-error` : undefined}
              className={cn(FIELD, LINE, errors.unit ? BORDER_BAD : BORDER_OK, "mt-2")}
            />
            {errors.unit && (
              <p id={`${unitId}-error`} className={ERROR}>
                {errors.unit}
              </p>
            )}
          </div>
          <div>
            <label htmlFor={personId} className={LABEL}>
              {t("form.personLabel")}
            </label>
            <input
              id={personId}
              name="person"
              required
              autoComplete="name"
              value={values.person}
              onChange={(e) => set("person", e.target.value)}
              aria-invalid={errors.person ? true : undefined}
              aria-describedby={errors.person ? `${personId}-error` : undefined}
              className={cn(FIELD, LINE, errors.person ? BORDER_BAD : BORDER_OK, "mt-2")}
            />
            {errors.person && (
              <p id={`${personId}-error`} className={ERROR}>
                {errors.person}
              </p>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={emailId} className={LABEL}>
                {t("form.emailLabel")}
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
                className={cn(FIELD, LINE, errors.email ? BORDER_BAD : BORDER_OK, "mt-2")}
              />
              {errors.email && (
                <p id={`${emailId}-error`} className={ERROR}>
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={phoneId} className={LABEL}>
                {t("form.phoneLabel")}
              </label>
              <input
                id={phoneId}
                name="phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={cn(FIELD, LINE, BORDER_OK, "mt-2")}
              />
            </div>
          </div>
          <div>
            <label htmlFor={deadlineId} className={LABEL}>
              {t("form.deadlineLabel")}
            </label>
            <input
              id={deadlineId}
              name="deadline"
              placeholder={t("form.deadlinePlaceholder")}
              value={values.deadline}
              onChange={(e) => set("deadline", e.target.value)}
              className={cn(FIELD, LINE, BORDER_OK, "mt-2")}
            />
          </div>
          <div>
            <label htmlFor={notesId} className={LABEL}>
              {t("form.notesLabel")}
            </label>
            <textarea
              id={notesId}
              name="notes"
              rows={4}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={cn(FIELD, BORDER_OK, "mt-2 px-4 py-3")}
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <h2 className="type-h2 text-white">{t("form.catalogHeading")}</h2>
        <p className="mt-2 text-sm text-nf-muted">
          {t("form.catalogIntro")}
        </p>

        <div className="mt-6 space-y-8">
          {categories.map((category) => {
            const list = products.filter((p) => p.proCategory === category.slug);
            if (list.length === 0) return null;
            return (
              <fieldset key={category.slug}>
                <legend className="type-meta w-full border-b border-nf-border pb-2 text-nf-dim">
                  {category.code} / {category.title}
                </legend>
                <ul className="mt-3 divide-y divide-nf-border">
                  {list.map((product) => {
                    const qty = items[product.slug] ?? 0;
                    return (
                      <li
                        key={product.slug}
                        className="flex flex-wrap items-center justify-between gap-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-nf-text">{product.name}</p>
                          <p className="type-meta mt-1 text-nf-dim">{product.sku}</p>
                        </div>
                        {/* grupa z etykieta: bez niej czytnik czyta sam licznik ("3"),
                            bez informacji, czego dotyczy */}
                        <div
                          role="group"
                          aria-label={t("form.qtyGroup", { name: product.name })}
                          className="flex items-center rounded-[2px] border border-nf-border"
                        >
                          <button
                            type="button"
                            aria-label={t("form.qtyMinus", { name: product.name })}
                            disabled={qty === 0}
                            onClick={() => setQty(product, qty - 1)}
                            className="flex h-11 w-11 items-center justify-center text-nf-dim transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-40"
                          >
                            <MinusIcon width={16} height={16} />
                          </button>
                          <span className="min-w-10 text-center text-sm tabular-nums text-nf-text">
                            {qty}
                          </span>
                          <button
                            type="button"
                            aria-label={t("form.qtyPlus", { name: product.name })}
                            disabled={qty === MAX_QTY}
                            onClick={() => setQty(product, qty + 1)}
                            className="flex h-11 w-11 items-center justify-center text-nf-dim transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-40"
                          >
                            <PlusIcon width={16} height={16} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            );
          })}
        </div>

        {/* jeden region na cala liste pozycji - kazda zmiana licznika idzie tedy */}
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>

        <div className="mt-8 border-t border-nf-border pt-6">
          <div className="flex items-start gap-3">
            <input
              id={consentId}
              type="checkbox"
              required
              checked={values.consent}
              onChange={(e) => set("consent", e.target.checked)}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? `${consentId}-error` : undefined}
              className={cn(
                "mt-0.5 size-[18px] shrink-0 rounded-[2px] border accent-nf-red",
                errors.consent ? BORDER_BAD : "border-nf-border-strong"
              )}
            />
            <label htmlFor={consentId} className="text-sm text-nf-muted">
              {t.rich("form.consent", {
                privacy: (chunks) => (
                  <Link
                    href="/polityka-prywatnosci"
                    className="text-nf-text underline underline-offset-4 hover:text-white"
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

          <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
            {t("form.submit")}
          </Button>
          <p className="mt-3 text-xs text-nf-dim">
            {chosen.length > 0
              ? t("form.chosenSome", { count: chosen.length })
              : t("form.chosenNone")}
          </p>
        </div>
      </div>
    </form>
  );
}
