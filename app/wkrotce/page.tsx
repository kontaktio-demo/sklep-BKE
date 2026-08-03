import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("misc");
  return {
    title: t("comingSoon.meta.title"),
    robots: { index: false, follow: false },
  };
}

// Strona zastępcza, gdy sklep jest zamknięty (ustawienie open=false w panelu).
export default function ComingSoonPage() {
  const t = useTranslations("misc");
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <span aria-hidden="true" className="block h-0.5 w-14 bg-nf-red" />
      <p className="type-kicker mt-6 text-nf-dim">Dog Store</p>
      <h1 className="type-h1 mt-2 text-nf-white">{t("comingSoon.title")}</h1>
      <p className="mt-4 max-w-md text-nf-muted">
        {t("comingSoon.body")}
      </p>
      <Button href="/o-nas" variant="ghost" className="mt-8">
        {t("comingSoon.cta")}
      </Button>
    </div>
  );
}
