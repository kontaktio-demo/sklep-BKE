"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/account/AuthProvider";
import { accountFetch } from "@/lib/account";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

const WRAP = "mx-auto max-w-3xl px-4 py-12";
const CARD = "rounded-[3px] border border-nf-border bg-nf-elevated p-6";

function NotConfigured() {
  return (
    <div className={WRAP}>
      <h1 className="type-h1 text-nf-white">Konto</h1>
      <p className="mt-3 text-nf-muted">
        Logowanie do konta będzie dostępne wkrótce. Zakupy jako gość działają bez konta.
      </p>
      <Button href="/collections/collars" className="mt-6">
        Przejdź do sklepu
      </Button>
    </div>
  );
}

// ---------- LOGOWANIE ----------
export function LoginClient() {
  const { configured, signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) return <NotConfigured />;
  if (user)
    return (
      <div className={WRAP}>
        <h1 className="type-h1 text-nf-white">Jesteś zalogowany</h1>
        <Button href="/konto" className="mt-6">
          Przejdź do konta
        </Button>
      </div>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await signIn(email.trim());
    setBusy(false);
    if (res.ok) setSent(true);
    else setErr("Nie udało się wysłać linku. Sprawdź adres i spróbuj ponownie.");
  };

  return (
    <div className={WRAP}>
      <p className="type-kicker text-nf-dim">Konto</p>
      <h1 className="type-h1 mt-2 text-nf-white">Logowanie</h1>
      {sent ? (
        <div className={`${CARD} mt-6`}>
          <p className="text-nf-text">
            Wysłaliśmy link do logowania na <strong>{email}</strong>. Kliknij go, aby się zalogować.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className={`${CARD} mt-6 space-y-4`}>
          <p className="text-sm text-nf-muted">Podaj e-mail — wyślemy link do logowania bez hasła.</p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twój@email.pl"
            className="h-11 w-full rounded-[2px] border border-nf-control bg-nf-bg px-3 text-sm text-nf-text"
          />
          {err && <p className="text-sm text-nf-red-bright">{err}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Wysyłanie…" : "Wyślij link"}
          </Button>
        </form>
      )}
    </div>
  );
}

// ---------- PRZEGLĄD KONTA ----------
interface OrderRow {
  number: string;
  line: string;
  status: string;
  payment_status: string;
  total_grosze: number;
  created_at: string;
}
export function AccountOverview() {
  const { configured, user, loading, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  useEffect(() => {
    if (user) void accountFetch<{ orders: OrderRow[] }>("/orders").then((r) => setOrders(r.orders ?? []));
  }, [user]);

  if (!configured) return <NotConfigured />;
  if (loading) return <div className={WRAP}>Wczytywanie…</div>;
  if (!user)
    return (
      <div className={WRAP}>
        <h1 className="type-h1 text-nf-white">Konto</h1>
        <p className="mt-3 text-nf-muted">Zaloguj się, aby zobaczyć swoje zamówienia i adresy.</p>
        <Button href="/logowanie" className="mt-6">
          Zaloguj się
        </Button>
      </div>
    );

  return (
    <div className={WRAP}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="type-kicker text-nf-dim">Konto</p>
          <h1 className="type-h1 mt-2 text-nf-white">Twoje konto</h1>
          <p className="mt-1 text-sm text-nf-muted">{user.email}</p>
        </div>
        <button type="button" onClick={() => signOut()} className="type-label text-nf-dim hover:text-nf-white">
          Wyloguj
        </button>
      </div>

      <h2 className="type-h3 mt-10 text-nf-white">Ostatnie zamówienia</h2>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-nf-muted">Brak zamówień.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {orders.slice(0, 5).map((o) => (
            <li key={o.number} className={`${CARD} flex items-center justify-between`}>
              <span className="font-mono text-sm text-nf-white">{o.number}</span>
              <span className="text-sm text-nf-muted">{o.status}</span>
              <span className="text-sm tabular-nums text-nf-text">{formatPrice(o.total_grosze / 100)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex gap-3">
        <Button href="/konto/zamowienia" variant="ghost">
          Wszystkie zamówienia
        </Button>
      </div>
    </div>
  );
}

// ---------- ZAMÓWIENIA ----------
export function OrdersView() {
  const { configured, user, loading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  useEffect(() => {
    if (user) void accountFetch<{ orders: OrderRow[] }>("/orders").then((r) => setOrders(r.orders ?? []));
  }, [user]);

  if (!configured) return <NotConfigured />;
  if (loading) return <div className={WRAP}>Wczytywanie…</div>;
  if (!user)
    return (
      <div className={WRAP}>
        <p className="text-nf-muted">Zaloguj się, aby zobaczyć zamówienia.</p>
        <Button href="/logowanie" className="mt-4">
          Zaloguj się
        </Button>
      </div>
    );

  return (
    <div className={WRAP}>
      <Link href="/konto" className="type-label text-nf-dim hover:text-nf-white">
        ← Konto
      </Link>
      <h1 className="type-h1 mt-3 text-nf-white">Zamówienia</h1>
      {orders.length === 0 ? (
        <p className="mt-4 text-nf-muted">Brak zamówień.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {orders.map((o) => (
            <li key={o.number} className={`${CARD} flex flex-wrap items-center justify-between gap-3`}>
              <span className="font-mono text-sm text-nf-white">{o.number}</span>
              <span className="text-sm text-nf-muted">{o.line === "pro" ? "Dog Store Pro" : "Dog Store"}</span>
              <span className="text-sm text-nf-muted">{o.status}</span>
              <span className="text-sm tabular-nums text-nf-text">{formatPrice(o.total_grosze / 100)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
