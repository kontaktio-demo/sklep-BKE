import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SIZE_NECK, SIZE_ORDER, SIZE_WEIGHT } from "@/lib/sizes";
import type { CollarSize } from "@/lib/types";
import { Bullets, InfoHeader, InfoLink, Note, P, Section, Steps } from "../_ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("infoPages");
  return {
    title: t("rozmiary.meta.title"),
    description: t("rozmiary.meta.description"),
    alternates: { canonical: "/tabela-rozmiarow" },
  };
}

// type-label, nie monospace: kroj maszynowy nalezy do sekcji Dog Store Pro, a to jest strona sklepu.
// Liczby w komorkach trzyma tabular-nums, wiec kolumna stoi rowno bez krojow technicznych.
const TH = "type-label px-4 py-3 text-left text-nf-dim";
const TD = "px-4 py-3 text-sm text-nf-text";

export default async function SizingPage() {
  const t = await getTranslations("infoPages");
  const tc = await getTranslations("common");

  // Zakresy ida z lib/sizes (tego samego slownika, co karta produktu i filtry). Wczesniej
  // ta strona trzymala wlasna kopie i podawala inna wage psa: pies 18 kg byl tu "Maly",
  // a na karcie produktu "Sredni". Rasy sa lokalne, bo nie ma ich w slowniku.
  const dogs: Record<CollarSize, string> = {
    small: t("rozmiary.dogs.small"),
    medium: t("rozmiary.dogs.medium"),
    large: t("rozmiary.dogs.large"),
  };

  const sizes = SIZE_ORDER.map((size) => ({
    name: tc(`size.${size}`),
    neck: SIZE_NECK[size],
    weight: size === "large" ? tc("size.weightLarge") : SIZE_WEIGHT[size],
    dogs: dogs[size],
  }));

  const widths: { width: string; use: string }[] = [
    { width: "2,5 cm", use: t("rozmiary.width.u1") },
    { width: "4 cm", use: t("rozmiary.width.u2") },
    { width: "4,5 cm", use: t("rozmiary.width.u3") },
  ];

  return (
    <>
      <InfoHeader title={t("rozmiary.header.title")} lead={t("rozmiary.header.lead")} />

      <Section title={t("rozmiary.measure.title")}>
        <Steps
          items={[
            t("rozmiary.measure.s1"),
            t("rozmiary.measure.s2"),
            t("rozmiary.measure.s3"),
            t("rozmiary.measure.s4"),
            t("rozmiary.measure.s5"),
          ]}
        />
      </Section>

      <Section title={t("rozmiary.sizes.title")}>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse border border-nf-border">
            <caption className="sr-only">{t("rozmiary.sizes.caption")}</caption>
            <thead className="bg-nf-elevated">
              <tr className="border-b border-nf-border">
                <th scope="col" className={TH}>
                  {t("rozmiary.sizes.size")}
                </th>
                <th scope="col" className={TH}>
                  {t("rozmiary.sizes.neck")}
                </th>
                <th scope="col" className={TH}>
                  {t("rozmiary.sizes.weight")}
                </th>
                <th scope="col" className={TH}>
                  {t("rozmiary.sizes.breeds")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size.name} className="border-b border-nf-border last:border-b-0">
                  <th scope="row" className={`${TD} font-medium`}>
                    {size.name}
                  </th>
                  <td className={`${TD} tabular-nums`}>{size.neck}</td>
                  <td className={`${TD} text-nf-muted`}>{size.weight}</td>
                  <td className={`${TD} text-nf-muted`}>{size.dogs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>{t("rozmiary.sizes.p")}</P>
      </Section>

      <Section title={t("rozmiary.width.title")}>
        <P>{t("rozmiary.width.p")}</P>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse border border-nf-border">
            <caption className="sr-only">{t("rozmiary.width.caption")}</caption>
            <thead className="bg-nf-elevated">
              <tr className="border-b border-nf-border">
                <th scope="col" className={TH}>
                  {t("rozmiary.width.widthCol")}
                </th>
                <th scope="col" className={TH}>
                  {t("rozmiary.width.useCol")}
                </th>
              </tr>
            </thead>
            <tbody>
              {widths.map((item) => (
                <tr key={item.width} className="border-b border-nf-border last:border-b-0">
                  <th
                    scope="row"
                    className={`${TD} whitespace-nowrap font-medium tabular-nums`}
                  >
                    {item.width}
                  </th>
                  <td className={`${TD} text-nf-muted`}>{item.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t("rozmiary.ecollar.title")}>
        <P>{t("rozmiary.ecollar.p")}</P>
        <Bullets
          items={[
            t("rozmiary.ecollar.i1"),
            t("rozmiary.ecollar.i2"),
            t("rozmiary.ecollar.i3"),
            t("rozmiary.ecollar.i4"),
            t("rozmiary.ecollar.i5"),
          ]}
        />
      </Section>

      <Section title={t("rozmiary.sizeFail.title")}>
        <Note>
          {t.rich("rozmiary.sizeFail.note", {
            link: (chunks) => (
              <InfoLink href="/zwroty-i-reklamacje">{chunks}</InfoLink>
            ),
          })}
        </Note>
      </Section>
    </>
  );
}
