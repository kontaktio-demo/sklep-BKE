import { getLocale, getTranslations } from "next-intl/server";
import { RatingStars } from "./RatingStars";
import type { ProductReviewsData } from "@/lib/server/reviews";

/** Sekcja opinii na karcie produktu: średnia + lista opublikowanych recenzji. */
export async function ProductReviews({ data }: { data: ProductReviewsData }) {
  const t = await getTranslations("reviews");
  const locale = await getLocale();
  const df = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <section id="opinie" className="mx-auto mt-16 max-w-3xl scroll-mt-28 border-t border-nf-border pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="type-h2 text-nf-white">{t("heading")}</h2>
        {data.count > 0 && (
          <div className="flex items-center gap-2 text-sm text-nf-muted">
            <RatingStars value={data.average} label={t("ratingAria", { rating: data.average })} />
            <span>
              {data.average.toFixed(1).replace(".", ",")} · {t("count", { count: data.count })}
            </span>
          </div>
        )}
      </div>

      {data.count === 0 ? (
        <p className="mt-4 text-sm text-nf-muted">{t("empty")}</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {data.reviews.map((r, i) => (
            <li key={i} className="border-b border-nf-border pb-6 last:border-b-0">
              <div className="flex items-center gap-3">
                <RatingStars value={r.rating} size={14} label={t("ratingAria", { rating: r.rating })} />
                {r.verified && <span className="type-label text-nf-dim">{t("verified")}</span>}
              </div>
              {r.content && <p className="mt-2 text-sm leading-relaxed text-nf-text">{r.content}</p>}
              <p className="mt-2 text-xs text-nf-dim">
                {r.author_name || t("anonymous")} · {df.format(new Date(r.created_at))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
