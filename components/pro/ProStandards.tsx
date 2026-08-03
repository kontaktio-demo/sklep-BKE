import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

/**
 * "Standard" (PRO_IDENTITY.md §7: editorial, NOT icon-circles).
 *
 * Trzy rowne kafle z ikona w kolku sa wprost zakazane (§6), i sluszznie: to uklad, ktory
 * nie niesie zadnej informacji poza swoim ksztaltem. Zamiast tego karta danych: naglowek
 * po lewej (zakotwiczony, nie wysrodkowany), po prawej wiersze rozdzielone wlosowa linia,
 * kazdy z mono-etykieta po lewej i trescia po prawej. Czyta sie jak protokol, a nie jak
 * strona marketingowa.
 *
 * Sekcja oddechowa: rytm 96-160 px, w odroznieniu od gestego pasa kategorii (§3).
 */
const ENTRY_KEYS = ["field", "spec", "service"] as const;

export function ProStandards() {
  const t = useTranslations("pro");
  const entries = ENTRY_KEYS.map((key) => ({
    key,
    label: t(`standards.entries.${key}.label`),
    body: t(`standards.entries.${key}.body`),
  }));
  return (
    <section
      aria-labelledby="standard-naglowek"
      className="border-t border-pro-border bg-pro-bg"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-[clamp(96px,12vw,160px)] md:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p className="type-pro-eyebrow text-pro-muted">
              {t("standards.eyebrow")}
            </p>
            <span aria-hidden="true" className="mt-5 block h-0.5 w-16 bg-pro-red" />
            <h2 id="standard-naglowek" className="type-pro-h2 mt-6 text-pro-white">
              {t.rich("standards.heading", { br: () => <br /> })}
            </h2>
          </div>

          <dl>
            {entries.map((entry) => (
              <div
                key={entry.key}
                className="grid gap-3 border-t border-pro-border py-7 sm:grid-cols-[minmax(0,160px)_minmax(0,1fr)] sm:gap-8 last:border-b"
              >
                <dt className="type-pro-spec pt-1 text-pro-muted">{entry.label}</dt>
                <dd className="type-pro-body text-pro-text">{entry.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button size="lg" variant="danger" href="/pro/patrol">
            {t("standards.ctaPatrol")}
          </Button>
          <Button size="lg" variant="ghost" href="/pro/zapytanie">
            {t("hero.ctaInquiry")}
          </Button>
        </div>
      </div>
    </section>
  );
}
