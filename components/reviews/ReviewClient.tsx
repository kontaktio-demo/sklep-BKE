"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Item {
  slug: string;
  name: string;
  image: string | null;
}

const INPUT =
  "mt-1 w-full rounded-[2px] border border-nf-border bg-transparent px-3 py-2 text-sm text-nf-text outline-none focus:border-nf-text";
const LABEL = "type-label text-nf-dim";

/** Klikany input gwiazdek (SVG, nie glify). */
function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={String(i)}
          onClick={() => onChange(i)}
          className={cn("transition-colors", i <= value ? "text-nf-red" : "text-nf-dim hover:text-nf-muted")}
        >
          <svg width={26} height={26} viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.94 2.6.94-5.5-4-3.9 5.53-.8z"
              fill={i <= value ? "currentColor" : "transparent"}
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewItem({ item, token }: { item: Item; token: string }) {
  const t = useTranslations("reviews");
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (rating < 1) {
      setErr(t("form.ratingRequired"));
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        order_token: token,
        product_slug: item.slug,
        rating,
        author_name: name || undefined,
        content: content || undefined,
      }),
    });
    setBusy(false);
    if (res.ok) setDone(true);
    else setErr(t("form.error"));
  };

  return (
    <div className="rounded-[2px] border border-nf-border p-4">
      <p className="font-medium text-nf-white">{item.name}</p>
      {done ? (
        <p className="mt-2 text-sm text-nf-muted">{t("form.sent")}</p>
      ) : (
        <>
          <div className="mt-3">
            <span className={LABEL}>{t("form.ratingLabel")}</span>
            <div className="mt-1">
              <StarInput value={rating} onChange={setRating} label={t("form.ratingLabel")} />
            </div>
          </div>
          <div className="mt-3">
            <label className={LABEL}>{t("form.nameLabel")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("form.namePlaceholder")} maxLength={80} className={INPUT} />
          </div>
          <div className="mt-3">
            <label className={LABEL}>{t("form.contentLabel")}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("form.contentPlaceholder")}
              maxLength={2000}
              rows={3}
              className={`${INPUT} h-auto`}
            />
          </div>
          {err && <p className="mt-2 text-sm text-nf-red-bright">{err}</p>}
          <Button onClick={submit} disabled={busy} className="mt-3">
            {busy ? t("form.submitting") : t("form.submit")}
          </Button>
        </>
      )}
    </div>
  );
}

export function ReviewClient({ token }: { token: string }) {
  const t = useTranslations("reviews");
  const [state, setState] = useState<"loading" | "invalid" | "ready">("loading");
  const [number, setNumber] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    fetch(`/api/reviews/order/${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.items)) {
          setNumber(d.number ?? "");
          setItems(d.items);
          setState("ready");
        } else {
          setState("invalid");
        }
      })
      .catch(() => setState("invalid"));
  }, [token]);

  if (state === "loading") return <p className="text-nf-muted">…</p>;
  if (state === "invalid") return <p className="text-nf-muted">{t("page.invalidToken")}</p>;

  return (
    <div>
      {number && (
        <p className={LABEL}>
          {t("page.orderLabel")} {number}
        </p>
      )}
      <div className="mt-6 space-y-6">
        {items.map((it) => (
          <ReviewItem key={it.slug} item={it} token={token} />
        ))}
      </div>
    </div>
  );
}
