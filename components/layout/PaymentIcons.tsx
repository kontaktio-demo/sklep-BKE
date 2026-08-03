// neutral text badges - no trademark artwork (§12)

import { getTranslations } from "next-intl/server";
import { PAYMENT_METHODS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { Theme } from "./theme";

// Plakietki stoja na tokenach semantycznych, wiec obie strony sa tym samym zestawem klas:
// biala pigulka z tuszem na papierze, grafitowa z biela w sekcji Pro. Slownik zostaje, bo motyw
// nadal moze byc narzucony z zewnatrz (ciemna wyspa na jasnej trasie).
const BADGE: Record<Theme, string> = {
  dark: "border-nf-border bg-nf-elevated text-nf-muted",
  light: "border-nf-border bg-nf-elevated text-nf-muted",
};

export async function PaymentIcons({
  className,
  theme = "dark",
}: {
  className?: string;
  theme?: Theme;
}) {
  const t = await getTranslations("common");
  return (
    <ul
      aria-label={t("payment.aria")}
      className={cn("flex flex-row flex-wrap gap-1.5", className)}
    >
      {PAYMENT_METHODS.map((method) => (
        <li
          key={method}
          className={cn(
            "flex h-6 items-center rounded-[2px] border px-2 text-[9px] font-bold uppercase tracking-wide",
            BADGE[theme]
          )}
        >
          {t(`payment.${method}`)}
        </li>
      ))}
    </ul>
  );
}
