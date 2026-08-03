import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_OPTIONS } from "@/lib/nav";
import { formatPrice } from "@/lib/utils";
import { Bullets, InfoHeader, InfoLink, P, Section } from "../_ui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("infoPages");
  // opis skladamy z realnych stalych cennika (SHIPPING_OPTIONS), zeby nie rozjechal sie z tabela
  const locker = SHIPPING_OPTIONS.find((option) => option.carrier.includes("Paczkomat"));
  const courier = SHIPPING_OPTIONS.find((option) => option.carrier.includes("Kurier"));
  return {
    title: t("dostawa.meta.title"),
    description: t("dostawa.meta.description", {
      paczkomat: locker ? formatPrice(locker.price) : "",
      kurier: courier ? formatPrice(courier.price) : "",
      threshold: FREE_SHIPPING_THRESHOLD,
    }),
    alternates: { canonical: "/dostawa-i-platnosci" },
  };
}

// type-label, nie monospace: kroj maszynowy nalezy do sekcji Dog Store Pro, a to jest strona sklepu
const TH = "type-label px-4 py-3 text-left text-nf-dim";
const TD = "px-4 py-3 text-sm text-nf-text";

export default async function ShippingPage() {
  const t = await getTranslations("infoPages");

  return (
    <>
      <InfoHeader title={t("dostawa.header.title")} lead={t("dostawa.header.lead")} />

      <Section title={t("dostawa.ship.title")}>
        <Bullets
          items={[
            t("dostawa.ship.i1"),
            t("dostawa.ship.i2"),
            t("dostawa.ship.i3"),
          ]}
        />
      </Section>

      <Section title={t("dostawa.carriers.title")}>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse border border-nf-border">
            <caption className="sr-only">{t("dostawa.table.caption")}</caption>
            <thead className="bg-nf-elevated">
              <tr className="border-b border-nf-border">
                <th scope="col" className={TH}>
                  {t("dostawa.table.carrier")}
                </th>
                <th scope="col" className={TH}>
                  {t("dostawa.table.cost")}
                </th>
                <th scope="col" className={TH}>
                  {t("dostawa.table.time")}
                </th>
                <th scope="col" className={TH}>
                  {t("dostawa.table.fromThreshold", { threshold: FREE_SHIPPING_THRESHOLD })}
                </th>
              </tr>
            </thead>
            <tbody>
              {SHIPPING_OPTIONS.map((option) => (
                <tr key={option.carrier} className="border-b border-nf-border last:border-b-0">
                  <th scope="row" className={`${TD} font-medium`}>
                    {option.carrier}
                  </th>
                  <td className={TD}>{formatPrice(option.price)}</td>
                  <td className={TD}>{option.time}</td>
                  <td className={TD}>
                    {option.freeAboveThreshold ? (
                      <span className="text-nf-white">{t("dostawa.table.free")}</span>
                    ) : (
                      <span className="text-nf-dim">{t("dostawa.table.unchanged")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>{t("dostawa.carriers.p")}</P>
      </Section>

      <Section title={t("dostawa.free.title")}>
        <P>{t("dostawa.free.p1", { threshold: FREE_SHIPPING_THRESHOLD })}</P>
        <P>{t("dostawa.free.p2")}</P>
      </Section>

      <Section title={t("dostawa.pay.title")}>
        <P>{t("dostawa.pay.p1")}</P>
        <P>{t("dostawa.pay.p2")}</P>
      </Section>

      <Section title={t("dostawa.pickup.title")}>
        <Bullets
          items={[
            t("dostawa.pickup.i1"),
            t("dostawa.pickup.i2"),
            t("dostawa.pickup.i3"),
          ]}
        />
        <P>
          {t.rich("dostawa.pickup.p", {
            link: (chunks) => (
              <InfoLink href="/zwroty-i-reklamacje">{chunks}</InfoLink>
            ),
          })}
        </P>
      </Section>
    </>
  );
}
