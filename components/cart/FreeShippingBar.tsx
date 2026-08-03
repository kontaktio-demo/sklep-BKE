"use client";

import { useTranslations } from "next-intl";
import { useFreeShippingThreshold } from "@/lib/settings-client";
import { cn, formatPrice } from "@/lib/utils";

/** Pasek postepu do darmowej dostawy. Ten sam w szufladzie i na stronie koszyka -
 *  prog i tekst musza brzmiec identycznie w obu miejscach, wiec zyja w jednym pliku.
 *  Prog czytamy z ustawien sklepu (jak kasa), z fallbackiem na stala. */
export function FreeShippingBar({
  subtotal,
  className,
}: {
  subtotal: number;
  className?: string;
}) {
  const t = useTranslations("cart");
  const threshold = useFreeShippingThreshold();
  const remaining = Math.max(0, threshold - subtotal);
  const reached = remaining === 0;
  const progress = Math.min(100, (subtotal / threshold) * 100);

  return (
    <div className={className}>
      <p className={cn("text-xs", reached ? "text-nf-text" : "text-nf-muted")}>
        {reached ? (
          t("freeShipping.reached")
        ) : (
          t.rich("freeShipping.remaining", {
            amount: formatPrice(remaining),
            b: (c) => <span className="font-medium text-nf-white">{c}</span>,
          })
        )}
      </p>
      <div
        role="progressbar"
        aria-label={t("freeShipping.progressAria")}
        aria-valuemin={0}
        aria-valuemax={threshold}
        aria-valuenow={Math.min(subtotal, threshold)}
        aria-valuetext={
          reached
            ? t("freeShipping.reached")
            : t("freeShipping.remainingAria", { amount: formatPrice(remaining) })
        }
        // Tor na nf-elevated-2 daje na jasnym tle karty 1.11:1, czyli paska po prostu nie
        // widac, dopoki nie ma postepu. Obwodka na nf-control (3:1) rysuje jego pelna dlugosc,
        // wiec widac tez, ile jeszcze zostalo. Ring, nie border: tor ma 4px, border zjadlby
        // polowe wypelnienia. Wypelnienie (bg-nf-red) bez zmian.
        className="mt-2 h-1 w-full overflow-hidden rounded-[2px] bg-nf-elevated-2 ring-1 ring-nf-control"
      >
        <div
          className="h-full bg-nf-red transition-[width] duration-250 ease-nf motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
