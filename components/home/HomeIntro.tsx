import { getTranslations } from "next-intl/server";

// Klucze punktow w slowniku - tresc siedzi w messages/*/home.json (home.intro.points).
const POINT_KEYS = ["params", "field", "repair"] as const;

// Zygzak zamiast rownego rzedu: kazdy punkt siedzi w innych kolumnach 12-polowej
// siatki (1-5, 7-11 nizej, 3-7), wiec oko idzie po stronie jak po rozkladowce,
// nie po tabeli. Na mobile punkty wracaja do pionu.
const PLACEMENTS = [
  "lg:col-start-1 lg:col-span-5",
  "lg:col-start-7 lg:col-span-5 lg:mt-24",
  "lg:col-start-3 lg:col-span-5 lg:mt-8",
];

export async function HomeIntro() {
  const t = await getTranslations("home");
  return (
    <section className="border-t border-nf-border bg-nf-bg">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-28">
        <p className="type-kicker text-nf-dim">{t("intro.kicker")}</p>
        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-y-0">
          {POINT_KEYS.map((key, i) => (
            <div key={key} data-reveal className={PLACEMENTS[i]}>
              <div className="border-t border-nf-border pt-6">
                <h3 className="type-h2 text-nf-white">{t(`intro.points.${key}.title`)}</h3>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-nf-text">
                  {t(`intro.points.${key}.body`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
