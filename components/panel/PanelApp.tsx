"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { adminFetch, clearKey, dt, getKey, setKey, zl } from "@/lib/panel/api";
import { ProductEditor } from "@/components/panel/ProductEditor";

/**
 * Panel administracyjny DogStore — jedna aplikacja z resztą sklepu (trasy /panel).
 * Styl DogStore (ciemna skorupa: data-shell="dark" + tokeny nf-*). Rozdział sklepów
 * DogStore / DogStore Pro w widoku produktów. Dostęp: x-admin-key (localStorage).
 */

type Tab = "pulpit" | "zamowienia" | "produkty" | "promocje" | "ustawienia";
const TABS: { id: Tab; label: string }[] = [
  { id: "pulpit", label: "Pulpit" },
  { id: "zamowienia", label: "Zamówienia" },
  { id: "produkty", label: "Produkty" },
  { id: "promocje", label: "Promocje" },
  { id: "ustawienia", label: "Ustawienia" },
];

const CARD = "rounded-[3px] border border-nf-border bg-nf-elevated";
const INPUT =
  "h-10 rounded-[2px] border border-nf-control bg-nf-bg px-3 text-sm text-nf-white outline-none focus:border-nf-white";
const LABEL = "type-label text-nf-dim";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// PWA: rejestracja service workera + subskrypcja push (nowe zamówienie „dzwoni" w panelu).
async function enablePush(): Promise<string> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "Brak wsparcia push.";
  const reg = await navigator.serviceWorker.register("/panel-sw.js");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return "Brak zgody na powiadomienia.";
  const keyRes = await adminFetch("/push");
  if (!keyRes.publicKey) return "Powiadomienia niedostępne (brak VAPID).";
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(keyRes.publicKey) as BufferSource,
  });
  const save = await adminFetch("/push", { method: "POST", body: JSON.stringify({ subscription: sub }) });
  return save.ok ? "Powiadomienia włączone ✓" : "Nie udało się zapisać subskrypcji.";
}

export function PanelApp() {
  const [booted, setBooted] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [needKey, setNeedKey] = useState(false);
  const [access, setAccess] = useState<"ok" | "demo" | null>(null);
  const [hasDb, setHasDb] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [tab, setTab] = useState<Tab>("pulpit");

  const boot = useCallback(async () => {
    const me = await adminFetch("/me");
    if (me.ok) {
      setAccess(me.access ?? "ok");
      setHasDb(Boolean(me.hasDb));
      setNeedKey(false);
    } else {
      setNeedKey(true);
    }
    setBooted(true);
  }, []);

  useEffect(() => {
    void boot();
  }, [boot]);

  if (!booted) {
    return (
      <div data-shell="dark" data-panel-root className="grid min-h-screen place-items-center bg-[#16181c] text-nf-dim">
        Wczytywanie panelu…
      </div>
    );
  }

  if (needKey) {
    return (
      <div data-shell="dark" data-panel-root className="grid min-h-screen place-items-center bg-[#16181c] px-4">
        <div className={`${CARD} w-full max-w-sm p-6`}>
          <p className="type-kicker text-nf-red">Dog Store · Panel</p>
          <h1 className="type-h3 mt-3 text-nf-white">Logowanie</h1>
          <p className="mt-2 text-sm text-nf-muted">Podaj klucz administratora (ADMIN_API_KEY).</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setKey(keyInput.trim());
              void boot();
            }}
          >
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Klucz admina"
              autoComplete="current-password"
              className={`${INPUT} mt-4 w-full`}
            />
            <Button type="submit" className="mt-4 w-full">
              Wejdź
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div data-shell="dark" data-panel-root className="min-h-screen bg-[#16181c] text-nf-text">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-nf-border bg-[#16181c] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="type-h3 text-nf-white">Dog Store</span>
          <span className="type-meta text-nf-red">PANEL</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {pushMsg && <span className="hidden text-xs text-nf-dim sm:inline">{pushMsg}</span>}
          <button
            type="button"
            onClick={() => enablePush().then(setPushMsg)}
            className="text-nf-muted transition-colors hover:text-nf-white"
            title="Powiadomienia o nowych zamówieniach"
          >
            Powiadomienia
          </button>
          <Link href="/" className="text-nf-muted transition-colors hover:text-nf-white">
            ← Sklep
          </Link>
          {getKey() && (
            <button
              type="button"
              onClick={() => {
                clearKey();
                window.location.reload();
              }}
              className="text-nf-muted transition-colors hover:text-nf-white"
            >
              Wyloguj
            </button>
          )}
        </div>
      </header>

      {(access === "demo" || !hasDb) && (
        <div className="border-b border-nf-border bg-nf-red/10 px-4 py-2 text-center text-xs text-nf-red-bright">
          {access === "demo"
            ? "Tryb demo (brak ADMIN_API_KEY) — podgląd. "
            : ""}
          {!hasDb ? "Baza nieskonfigurowana: dane demo, zapisy wyłączone." : ""}
        </div>
      )}

      <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-nf-border px-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`type-label whitespace-nowrap px-4 py-3 transition-colors ${
              tab === t.id ? "border-b-2 border-nf-red text-nf-white" : "text-nf-dim hover:text-nf-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-[1100px] px-4 py-6">
        {tab === "pulpit" && <Dashboard />}
        {tab === "zamowienia" && <Orders />}
        {tab === "produkty" && <Products writable={hasDb} />}
        {tab === "promocje" && <Promotions writable={hasDb} />}
        {tab === "ustawienia" && <Settings writable={hasDb} />}
      </main>
    </div>
  );
}

// ---------- PULPIT ----------
interface Stats {
  orders: number;
  revenueGrosze: number;
  paid: number;
  pending: number;
  products: number;
}
function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    void adminFetch<Stats>("/stats").then((r) => r.ok && setS(r.data ?? null));
  }, []);
  const tiles = [
    { label: "Przychód (opłacone)", value: s ? zl(s.revenueGrosze) : "—" },
    { label: "Zamówienia", value: s?.orders ?? "—" },
    { label: "Opłacone", value: s?.paid ?? "—" },
    { label: "Oczekujące", value: s?.pending ?? "—" },
    { label: "Produkty", value: s?.products ?? "—" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {tiles.map((t) => (
        <div key={t.label} className={`${CARD} p-4`}>
          <p className={LABEL}>{t.label}</p>
          <p className="type-h2 mt-2 text-nf-white">{t.value}</p>
        </div>
      ))}
    </div>
  );
}

// ---------- ZAMÓWIENIA ----------
interface OrderRow {
  id: string;
  number: string;
  email: string;
  line: string;
  status: string;
  payment_status: string;
  total_grosze: number;
  created_at: string;
}
const ORDER_STATUSES = ["pending", "paid", "packed", "shipped", "delivered", "cancelled", "refunded"];
function Orders() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const load = useCallback(async () => {
    const r = await adminFetch<OrderRow[]>("/orders");
    setRows(r.ok ? r.data ?? [] : []);
    setLoaded(true);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const setStatus = async (id: string, status: string) => {
    await adminFetch(`/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    void load();
  };
  if (loaded && rows.length === 0) return <Empty text="Brak zamówień." />;
  return (
    <div className={`${CARD} overflow-x-auto`}>
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-nf-border text-left text-nf-dim">
            <Th>Numer</Th>
            <Th>Data</Th>
            <Th>E-mail</Th>
            <Th>Sklep</Th>
            <Th>Kwota</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} className="border-b border-nf-border last:border-0">
              <Td className="font-mono text-nf-white">{o.number}</Td>
              <Td>{dt(o.created_at)}</Td>
              <Td>{o.email}</Td>
              <Td>{o.line === "pro" ? "Pro" : "Sklep"}</Td>
              <Td>{zl(o.total_grosze)}</Td>
              <Td>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className={INPUT}>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- PRODUKTY ----------
interface ProductRow {
  id: string;
  slug: string;
  name: string;
  line: string;
  price_grosze: number;
  active: boolean;
  bestseller?: boolean;
  categories?: { slug: string; name: string } | null;
  category?: string;
  product_variants?: unknown[];
  variants?: number;
}
function Products({ writable }: { writable: boolean }) {
  const [line, setLine] = useState<"shop" | "pro">("shop");
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const load = useCallback(async () => {
    const r = await adminFetch<ProductRow[]>(`/products?sklep=${line}`);
    setRows(r.ok ? r.data ?? [] : []);
  }, [line]);
  useEffect(() => {
    void load();
  }, [load]);
  const patch = async (id: string, body: Record<string, unknown>) => {
    await adminFetch(`/products/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    void load();
  };

  if (editing) {
    return (
      <ProductEditor
        productId={editing === "new" ? null : editing}
        defaultLine={line}
        onClose={() => {
          setEditing(null);
          void load();
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="inline-flex rounded-[2px] border border-nf-border p-1">
          {(["shop", "pro"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLine(l)}
              className={`px-4 py-1.5 text-sm ${line === l ? "bg-nf-red text-white" : "text-nf-dim"}`}
            >
              {l === "shop" ? "Dog Store" : "Dog Store Pro"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="h-9 rounded-[2px] bg-nf-red px-4 text-sm font-semibold text-white hover:opacity-90"
        >
          + Dodaj produkt
        </button>
      </div>
      <div className={`${CARD} overflow-x-auto`}>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-nf-border text-left text-nf-dim">
              <Th>Nazwa</Th>
              <Th>Kategoria</Th>
              <Th>Cena (od)</Th>
              <Th>Warianty</Th>
              <Th>Aktywny</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const cat = p.categories?.name ?? p.category ?? "—";
              const variants = p.product_variants?.length ?? p.variants ?? 0;
              return (
                <tr key={p.id} className="border-b border-nf-border last:border-0">
                  <Td className="text-nf-white">
                    <button type="button" onClick={() => setEditing(p.id)} className="text-left hover:text-nf-red-bright">
                      {p.name}
                    </button>
                  </Td>
                  <Td>{cat}</Td>
                  <Td>
                    {writable ? (
                      <input
                        type="number"
                        defaultValue={(p.price_grosze / 100).toFixed(0)}
                        onBlur={(e) => patch(p.id, { price_grosze: Math.round(Number(e.target.value) * 100) })}
                        className={`${INPUT} w-24`}
                      />
                    ) : (
                      zl(p.price_grosze)
                    )}
                  </Td>
                  <Td>{variants}</Td>
                  <Td>
                    <input
                      type="checkbox"
                      defaultChecked={p.active}
                      disabled={!writable}
                      onChange={(e) => patch(p.id, { active: e.target.checked })}
                      className="size-4 accent-[var(--color-nf-red)]"
                    />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- PROMOCJE ----------
interface PromoRow {
  id: string;
  code: string;
  kind: string;
  value: number;
  min_order_grosze: number;
  active: boolean;
  used_count: number;
}
function Promotions({ writable }: { writable: boolean }) {
  const [rows, setRows] = useState<PromoRow[]>([]);
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("10");
  const load = useCallback(async () => {
    const r = await adminFetch<PromoRow[]>("/promotions");
    setRows(r.ok ? r.data ?? [] : []);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const create = async () => {
    if (!code.trim()) return;
    await adminFetch("/promotions", {
      method: "POST",
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        kind,
        value: kind === "percent" ? Number(value) : Math.round(Number(value) * 100),
        active: true,
      }),
    });
    setCode("");
    void load();
  };
  const del = async (id: string) => {
    await adminFetch(`/promotions/${id}`, { method: "DELETE" });
    void load();
  };
  return (
    <div className="space-y-4">
      {writable && (
        <div className={`${CARD} flex flex-wrap items-end gap-3 p-4`}>
          <div>
            <label className={LABEL}>Kod</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className={`${INPUT} mt-1 block w-40`} />
          </div>
          <div>
            <label className={LABEL}>Rodzaj</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as "percent" | "fixed")} className={`${INPUT} mt-1 block`}>
              <option value="percent">Procent</option>
              <option value="fixed">Kwota (zł)</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Wartość</label>
            <input value={value} onChange={(e) => setValue(e.target.value)} className={`${INPUT} mt-1 block w-28`} />
          </div>
          <Button onClick={create}>Dodaj kod</Button>
        </div>
      )}
      <div className={`${CARD} overflow-x-auto`}>
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-nf-border text-left text-nf-dim">
              <Th>Kod</Th>
              <Th>Rabat</Th>
              <Th>Użycia</Th>
              <Th>Aktywny</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-nf-border last:border-0">
                <Td className="font-mono text-nf-white">{p.code}</Td>
                <Td>{p.kind === "percent" ? `${p.value}%` : zl(p.value)}</Td>
                <Td>{p.used_count}</Td>
                <Td>{p.active ? "tak" : "nie"}</Td>
                <Td>
                  {writable && (
                    <button type="button" onClick={() => del(p.id)} className="text-nf-red hover:underline">
                      Usuń
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- USTAWIENIA ----------
function Settings({ writable }: { writable: boolean }) {
  const [free, setFree] = useState("149");
  const [open, setOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    void adminFetch<{ free_shipping_grosze?: number; open?: boolean }>("/settings").then((r) => {
      if (r.ok && r.data) {
        setFree(String((r.data.free_shipping_grosze ?? 14900) / 100));
        setOpen(r.data.open ?? true);
      }
    });
  }, []);
  const save = async () => {
    await adminFetch("/settings", {
      method: "PUT",
      body: JSON.stringify({ free_shipping_grosze: Math.round(Number(free) * 100), open, currency: "PLN" }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  return (
    <div className={`${CARD} max-w-md space-y-4 p-5`}>
      <div>
        <label className={LABEL}>Próg darmowej dostawy (zł)</label>
        <input value={free} onChange={(e) => setFree(e.target.value)} className={`${INPUT} mt-1 block w-32`} />
      </div>
      <label className="flex items-center gap-2 text-sm text-nf-white">
        <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} className="size-4 accent-[var(--color-nf-red)]" />
        Sklep otwarty
      </label>
      {writable ? (
        <Button onClick={save}>{saved ? "Zapisano ✓" : "Zapisz"}</Button>
      ) : (
        <p className="text-xs text-nf-dim">Zapis wymaga konfiguracji bazy.</p>
      )}
    </div>
  );
}

// ---------- drobne ----------
function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-3 py-2 font-normal">{children}</th>;
}
function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 align-middle ${className}`}>{children}</td>;
}
function Empty({ text }: { text: string }) {
  return <div className={`${CARD} p-8 text-center text-nf-dim`}>{text}</div>;
}
