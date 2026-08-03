import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginClient } from "@/components/account/AccountPages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("meta.login"), robots: { index: false, follow: false } };
}

export default function LoginPage() {
  return (
    <div className="bg-nf-bg">
      <LoginClient />
    </div>
  );
}
