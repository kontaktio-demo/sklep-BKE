import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TrackClient } from "@/components/tracking/TrackClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tracking");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function TrackingPage() {
  const t = await getTranslations("tracking");
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="type-h1 text-nf-white">{t("title")}</h1>
      <p className="mt-3 max-w-xl text-nf-muted">{t("lead")}</p>
      <div className="mt-8">
        <TrackClient />
      </div>
    </div>
  );
}
