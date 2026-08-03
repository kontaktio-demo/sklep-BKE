"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

interface OrderStatus {
  number: string;
  status: string;
  payment_status: string;
  tracking_number: string | null;
  shipping_method: string | null;
  total_grosze: number;
  created_at: string;
}

const INPUT =
  "mt-1 w-full rounded-[2px] border border-nf-border bg-transparent px-3 py-2 text-sm text-nf-text outline-none focus:border-nf-text";
const LABEL = "type-label text-nf-dim";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <dt className="text-nf-dim">{label}</dt>
      <dd className="text-nf-text">{value}</dd>
    </div>
  );
}

export function TrackClient() {
  const t = useTranslations("tracking");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderStatus | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setOrder(null);
    try {
      const res = await fetch(
        `/api/order-status?number=${encodeURIComponent(number.trim())}&email=${encodeURIComponent(email.trim())}`,
      );
      const d = await res.json();
      if (d.ok) setOrder(d.order as OrderStatus);
      else setErr(res.status === 404 ? t("notFound") : t("error"));
    } catch {
      setErr(t("error"));
    }
    setBusy(false);
  };

  const zl = (g: number) => (g / 100).toFixed(2).replace(".", ",") + " zł";

  return (
    <div>
      <form onSubmit={submit} className="max-w-md space-y-3">
        <div>
          <label className={LABEL}>{t("numberLabel")}</label>
          <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder={t("numberPlaceholder")} required className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>{t("emailLabel")}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={INPUT} />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? t("submitting") : t("submit")}
        </Button>
      </form>

      {err && <p className="mt-4 text-sm text-nf-red-bright">{err}</p>}

      {order && (
        <div className="mt-6 max-w-md rounded-[2px] border border-nf-border p-4 text-sm">
          <p className="font-mono text-nf-white">{order.number}</p>
          <dl className="mt-3">
            <Row label={t("statusLabel")} value={t(`status.${order.status}`)} />
            <Row label={t("paymentLabel")} value={t(`payment.${order.payment_status}`)} />
            {order.tracking_number && <Row label={t("trackingLabel")} value={order.tracking_number} />}
            <Row label={t("totalLabel")} value={zl(order.total_grosze)} />
          </dl>
        </div>
      )}
    </div>
  );
}
