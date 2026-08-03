"use client";

// Pas z zapisem na newsletter. Grafitowa wyspa nad stopka: razem z nia tworzy blok
// domykajacy strone, i to samo dzieje sie w obu sklepach.

import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { isProRoute } from "@/lib/nav";

// Sklep mowi o nowych modelach, linia Pro o zmianach w katalogu i wynikach testow.
// Zapis idzie przez /api/newsletter (double opt-in): po wyslaniu adresu przychodzi link
// potwierdzajacy, a po potwierdzeniu kod powitalny -10%.
export function Newsletter() {
  const pathname = usePathname();
  const pro = isProRoute(pathname);
  const t = useTranslations("newsletter");
  const ns = pro ? "pro" : "shop";
  const headingId = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("busy");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email.trim(), source: pro ? "pro" : "web" }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false }));
    setState(res.ok ? "sent" : "error");
  };

  return (
    // data-shell="dark" odwraca tokeny w calym poddrzewie: te same klasy nf-* stoja
    // tu ciemno takze wtedy, gdy strona wokol jest jasna.
    <section
      aria-labelledby={headingId}
      data-shell="dark"
      data-surface="dark"
      className="border-y border-nf-border bg-nf-bg py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 md:px-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          {/* monospace zostaje na oznaczenia techniczne w sekcji Pro; w sklepie zwykla etykieta */}
          <p className={pro ? "type-meta text-nf-dim" : "type-label text-nf-dim"}>
            {t(`${ns}.eyebrow`)}
          </p>
          <h2 id={headingId} className="type-h2 mt-4 text-nf-white">
            {t(`${ns}.headingLine1`)}
            <br />
            {t(`${ns}.headingLine2`)}
          </h2>
          {pro && (
            <p className="mt-5 max-w-md text-sm leading-relaxed text-nf-muted">{t("pro.lead")}</p>
          )}
        </div>

        <div className="lg:col-span-7">
          {state === "sent" ? (
            <div className="border-t border-nf-border pt-6" role="status" aria-live="polite">
              <p className="text-sm text-nf-white">{t("success.body")}</p>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="flex flex-col items-start gap-3 border-t border-nf-border pt-6 sm:flex-row sm:items-center"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("form.emailPlaceholder")}
                aria-label={t("form.emailAria")}
                className="h-12 w-full max-w-xs rounded-[2px] border border-nf-control bg-nf-elevated px-3 text-sm text-nf-text sm:w-auto"
              />
              <Button type="submit" className="h-12" disabled={state === "busy"}>
                {state === "busy" ? t("form.busy") : t("form.cta")}
              </Button>
            </form>
          )}
          {state === "error" && (
            <p className="mt-2 text-xs text-nf-red-bright">{t("form.error")}</p>
          )}
          <p className="mt-3 text-xs text-nf-dim">{t(`${ns}.note`)}</p>
        </div>
      </div>
    </section>
  );
}
