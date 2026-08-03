"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Przełącznik języka PL/EN. Nie zmienia treści przez cookie w locie — prowadzi na ten sam
 * adres z prefiksem /en (lub bez), a middleware ustawia język i utrwala wybór w cookie.
 * Dzięki temu adres pozostaje spójny z językiem (dobre dla SEO i udostępniania linków).
 */
export function LanguageSwitcher({
  className,
  tone = "auto",
}: {
  className?: string;
  tone?: "light" | "dark" | "auto";
}) {
  const pathname = usePathname() || "/";
  const active = useLocale();
  const t = useTranslations("lang");

  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const bare = isEn ? pathname.slice(3) || "/" : pathname;
  const toPl = bare;
  const toEn = bare === "/" ? "/en" : `/en${bare}`;

  const base =
    "type-label inline-flex h-8 items-center px-2 text-[11px] uppercase tracking-wide transition-colors duration-250 ease-nf";
  // tone="auto" dziedziczy kolor tekstu z powłoki (nf-*), więc działa i na jasnym, i na ciemnym
  const activeCls = tone === "auto" ? "text-current opacity-100" : "";
  const idleCls = "opacity-55 hover:opacity-100";

  const item = (href: string, code: "pl" | "en", label: string) => {
    const isActive = active === code;
    return (
      <Link
        href={href}
        hrefLang={code}
        aria-current={isActive ? "true" : undefined}
        aria-label={t("switchAria", { name: label })}
        className={cn(base, isActive ? cn("font-semibold", activeCls) : idleCls)}
      >
        {code.toUpperCase()}
      </Link>
    );
  };

  return (
    <div
      className={cn("flex items-center", className)}
      role="group"
      aria-label={t("label")}
    >
      {item(toPl, "pl", t("pl"))}
      <span aria-hidden="true" className="opacity-30">
        /
      </span>
      {item(toEn, "en", t("en"))}
    </div>
  );
}
