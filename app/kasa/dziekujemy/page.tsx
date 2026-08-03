import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ThankYou } from "./ThankYou";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return { title: t("meta.thankYouTitle"), robots: { index: false, follow: false } };
}

export default function ThankYouPage() {
  return (
    <div className="bg-nf-bg">
      <ThankYou />
    </div>
  );
}
