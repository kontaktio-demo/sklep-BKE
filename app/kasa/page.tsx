import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return {
    title: t("meta.title"),
    robots: { index: false, follow: false },
  };
}

export default async function KasaPage() {
  const t = await getTranslations("checkout");
  return (
    <div className="bg-nf-bg">
      <div className="mx-auto max-w-[1100px] px-4 pt-10">
        <p className="type-kicker text-nf-dim">{t("heading.kicker")}</p>
        <h1 className="type-h1 mt-2 text-nf-white">{t("heading.title")}</h1>
      </div>
      <CheckoutForm />
    </div>
  );
}
