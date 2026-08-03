import { useTranslations } from "next-intl";
import { SectionNav } from "@/components/product/SectionNav";
import { CheckIcon } from "@/components/ui/icons";
import { getProductFaq } from "@/lib/data/faq";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/nav";
import { SIZE_NAME, SIZE_NECK, SIZE_ORDER, SIZE_SHORT, SIZE_WEIGHT } from "@/lib/sizes";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

const SECTION = "border-t border-nf-border pt-10 mt-12";
const HEADING = "type-h2 text-nf-white";
const CELL = "px-4 py-3.5 text-left";

/** Zgodnosc rozstrzyga sie na szerokosci obudowy modulu, nie na marce nadajnika:
 *  prowadnice pasa maja staly przeswit, wiec tabela jest ta sama dla kazdego pasa. */
const MODULE_FIT: { widthKey: string; fits: boolean }[] = [
  { widthKey: "widthUpTo", fits: true },
  { widthKey: "widthMid", fits: true },
  { widthKey: "widthOver", fits: false },
];

export function ProductSections({ product }: { product: Product }) {
  const t = useTranslations("product");
  // pas pod modul e-obrozy: jedyna karta, na ktorej tabela zgodnosci cokolwiek znaczy.
  // Sekcja Pro trzyma te sama kategorie (lib/data/pro.mock), wiec drugi warunek jest zabezpieczeniem
  // na wypadek rozejscia sie obu slownikow
  const showCompatibility = product.category === "e-collar" || product.proCategory === "e-collar";
  const faq = getProductFaq(product);

  // Sekcje opisowe stoja pod obiema kartami. Monospace jest oznaczeniem technicznym sprzetu
  // sluzbowego, wiec kod rozmiaru i numer kroku pielegnacji biora go tylko w sekcji Pro.
  const pro = product.line === "pro";
  const META = pro ? "type-meta" : "type-label";

  // tabela rozmiarow pokazuje pelna skale, ale mowi wprost, ktore rozmiary ma TEN model.
  // Obwodu szyi i wagi nie ma juz w specyfikacji: obie wartosci naleza do wariantu,
  // wiec stoja w wierszu swojego rozmiaru, a nie jako jedna liczba dla calego modelu
  const variantBySize = new Map(product.variants.map((v) => [v.size, v] as const));

  const care = [
    t("sections.care.step1"),
    t("sections.care.step2"),
    t("sections.care.step3"),
    t("sections.care.step4"),
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
      <SectionNav mono={pro} />
      <div className="min-w-0">
        <section id="opis"
          data-section-label={t("sections.description.label")} className="scroll-mt-28" aria-labelledby="opis-heading">
          <h2 id="opis-heading" className={HEADING}>
            {t("sections.description.heading")}
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-nf-text">{product.description}</p>
          <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-sm text-nf-text">
                {/* znacznik jest neutralny - czerwień zostaje dla CTA i stanu aktywnego */}
                <CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-nf-dim" />
                {highlight}
              </li>
            ))}
          </ul>
        </section>

        <section
          id="specyfikacja"
          data-section-label={t("sections.specs.label")}
          className={cn(SECTION, "scroll-mt-28")}
          aria-labelledby="specyfikacja-heading"
        >
          <h2 id="specyfikacja-heading" className={HEADING}>
            {t("sections.specs.heading")}
          </h2>
          <dl className="mt-4 max-w-3xl">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="grid grid-cols-[minmax(0,180px)_1fr] gap-4 border-b border-nf-border py-3.5"
              >
                <dt className="text-sm text-nf-dim">{spec.label}</dt>
                <dd className="text-sm text-nf-text">{spec.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-nf-muted">
            {t.rich("sections.specs.note", {
              link: (chunks) => (
                <a
                  href="#rozmiary"
                  className="text-nf-text underline underline-offset-4 transition-colors duration-250 ease-nf hover:text-nf-white motion-reduce:transition-none"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>

        <section
          id="rozmiary"
          data-section-label={t("sections.sizes.label")}
          className={cn(SECTION, "scroll-mt-28")}
          aria-labelledby="rozmiary-heading"
        >
          <h2 id="rozmiary-heading" className={HEADING}>
            {t("sections.sizes.heading")}
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-nf-text">
            {t("sections.sizes.intro")}
          </p>
          {/* focusable so the scroll container is reachable from the keyboard (WCAG 2.1.1) */}
          <div
            tabIndex={0}
            role="region"
            aria-label={t("sections.sizes.tableAria")}
            className="mt-6 max-w-3xl overflow-x-auto"
          >
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-nf-border-strong">
                  <th scope="col" className={cn(CELL, "font-medium text-nf-dim")}>
                    {t("sections.sizes.colSize")}
                  </th>
                  <th scope="col" className={cn(CELL, "font-medium text-nf-dim")}>
                    {t("sections.sizes.colNeck")}
                  </th>
                  <th scope="col" className={cn(CELL, "font-medium text-nf-dim")}>
                    {t("sections.sizes.colWeight")}
                  </th>
                  <th scope="col" className={cn(CELL, "font-medium text-nf-dim")}>
                    {t("sections.sizes.colCollarWeight")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ORDER.map((size) => {
                  const variant = variantBySize.get(size);
                  // rozmiar w ofercie tego modelu; osobno jego stan magazynowy
                  const offered = variant !== undefined;
                  return (
                    <tr key={size} className="border-b border-nf-border">
                      <th
                        scope="row"
                        className={cn(
                          CELL,
                          "font-medium",
                          // rozmiar z oferty znaczy czerwoną krawędź i maksymalny kontrast tekstu,
                          // nie tło; sam kolor nie niesie znaczenia - stan dopowiada tekst
                          // i kolumna wagi
                          offered ? "border-l-2 border-nf-red text-nf-white" : "text-nf-muted"
                        )}
                      >
                        {SIZE_NAME[size]}
                        <span className={cn(META, "ml-2 text-nf-dim")}>{SIZE_SHORT[size]}</span>
                        {variant && !variant.inStock && (
                          <span className="mt-1 block text-xs font-normal text-nf-muted">
                            {t("sections.sizes.variantSoldOut")}
                          </span>
                        )}
                        {!offered && <span className="sr-only">{t("sections.sizes.notOfferedSr")}</span>}
                      </th>
                      {/* obwod bierzemy z wariantu - model moze miec wlasne zakresy, a nie
                          zawsze te ze slownika */}
                      <td className={cn(CELL, offered ? "text-nf-white" : "text-nf-muted")}>
                        {variant?.neck ?? SIZE_NECK[size]}
                      </td>
                      <td className={cn(CELL, offered ? "text-nf-white" : "text-nf-muted")}>
                        {SIZE_WEIGHT[size]}
                      </td>
                      <td className={cn(CELL, offered ? "text-nf-white" : "text-nf-dim")}>
                        {variant ? `${variant.weightGrams} g` : t("sections.sizes.notOffered")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-nf-dim">
            {t("sections.sizes.footnote")}
          </p>
        </section>

        <section
          id="dostawa"
          data-section-label={t("sections.shipping.label")}
          className={cn(SECTION, "scroll-mt-28")}
          aria-labelledby="dostawa-heading"
        >
          <h2 id="dostawa-heading" className={HEADING}>
            {t("sections.shipping.heading")}
          </h2>
          <div className="mt-4 grid max-w-4xl gap-6 sm:grid-cols-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-nf-text">{t("sections.shipping.shippingTitle")}</h3>
              <p className="text-sm leading-relaxed text-nf-muted">
                {t("sections.shipping.shippingBody")}
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-nf-text">{t("sections.shipping.costTitle")}</h3>
              <p className="text-sm leading-relaxed text-nf-muted">
                {t("sections.shipping.costBody", { amount: formatPrice(FREE_SHIPPING_THRESHOLD) })}
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-nf-text">{t("sections.shipping.returnsTitle")}</h3>
              <p className="text-sm leading-relaxed text-nf-muted">
                {t("sections.shipping.returnsBody")}
              </p>
            </div>
          </div>
        </section>

        {showCompatibility && (
          <section
            id="zgodnosc"
          data-section-label={t("sections.compatibility.label")}
            className={cn(SECTION, "scroll-mt-28")}
            aria-labelledby="zgodnosc-heading"
          >
            <h2 id="zgodnosc-heading" className={HEADING}>
              {t("sections.compatibility.heading")}
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-nf-text">
              {t("sections.compatibility.intro")}
            </p>
            <div
              tabIndex={0}
              role="region"
              aria-label={t("sections.compatibility.tableAria")}
              className="mt-6 max-w-xl overflow-x-auto"
            >
              <table className="w-full min-w-[340px] text-sm">
                <thead>
                  <tr className="border-b border-nf-border-strong">
                    <th scope="col" className={cn(CELL, "font-medium text-nf-dim")}>
                      {t("sections.compatibility.colWidth")}
                    </th>
                    <th scope="col" className={cn(CELL, "font-medium text-nf-dim")}>
                      {t("sections.compatibility.colFits")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MODULE_FIT.map((row) => (
                    <tr key={row.widthKey} className="border-b border-nf-border">
                      <th scope="row" className={cn(CELL, "font-medium text-nf-muted")}>
                        {t(`sections.compatibility.${row.widthKey}`)}
                      </th>
                      {/* czerwien zostaje dla CTA i alarmu - odpowiedz niesie samo slowo */}
                      <td className={cn(CELL, row.fits ? "text-nf-white" : "text-nf-dim")}>
                        {row.fits ? t("sections.compatibility.yes") : t("sections.compatibility.no")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-nf-muted">
              {t("sections.compatibility.footnote")}
            </p>
          </section>
        )}

        <section
          id="pielegnacja"
          data-section-label={t("sections.care.label")}
          className={cn(SECTION, "scroll-mt-28")}
          aria-labelledby="pielegnacja-heading"
        >
          <h2 id="pielegnacja-heading" className={HEADING}>
            {t("sections.care.heading")}
          </h2>
          <ol className="mt-6 max-w-3xl">
            {care.map((step, i) => (
              <li
                key={step}
                className="flex items-baseline gap-4 border-b border-nf-border py-3.5"
              >
                <span aria-hidden="true" className={cn(META, "shrink-0 tabular-nums text-nf-dim")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-relaxed text-nf-text">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="pytania"
          data-section-label={t("sections.faq.label")}
          className={cn(SECTION, "scroll-mt-28")}
          aria-labelledby="pytania-heading"
        >
          <h2 id="pytania-heading" className={HEADING}>
            {t("sections.faq.heading")}
          </h2>
          {/* natywne details/summary: rozwijanie dziala bez JS, klawiatura i czytnik ekranu
              dostaja obsluge od przegladarki. Wskaznik +/- steruje sam atrybut [open] */}
          <div className="mt-4 max-w-3xl">
            {faq.map((item) => (
              <details
                key={item.id}
                id={`pytanie-${item.id}`}
                className="group border-b border-nf-border"
              >
                {/* py-4 przy type-h3 daje cel dotykowy ~53px, wiec summary spelnia 44px
                    bez sztucznej min-h */}
                <summary className="type-h3 flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-nf-white [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="grid h-6 w-6 shrink-0 place-items-center border border-nf-border text-sm leading-none text-nf-dim transition-colors duration-250 ease-nf group-hover:border-nf-border-strong group-hover:text-nf-white motion-reduce:transition-none"
                  >
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:block">-</span>
                  </span>
                </summary>
                <p className="pb-5 leading-relaxed text-nf-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
