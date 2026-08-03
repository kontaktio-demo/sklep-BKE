import "server-only";
import { SERVER } from "@/lib/env";

/**
 * InPost ShipX — tworzenie przesyłek i etykiet (paczkomat + kurier C2C), na wzór
 * działającego sklepu. Konto prepaid: kurier tylko przez C2C. Bez INPOST_TOKEN/ORG_ID
 * funkcje są nieaktywne (panel pokazuje komunikat o konfiguracji).
 */
const BASE = (SERVER.inpostBaseUrl || "https://api-shipx-pl.easypack24.net/v1").replace(/\/+$/, "");
const TOKEN = SERVER.inpostToken;
const ORG = SERVER.inpostOrgId;
const TEMPLATE = process.env.INPOST_PARCEL_TEMPLATE ?? "small";
const SERVICE_LOCKER = process.env.INPOST_SERVICE_LOCKER ?? "inpost_locker_standard";
const SERVICE_COURIER = process.env.INPOST_SERVICE_COURIER ?? "inpost_courier_c2c";

export function inpostConfigured(): boolean {
  return Boolean(TOKEN && ORG);
}

function headers() {
  return { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };
}

/** Numer PL do 9 cyfr (InPost wymaga 9 cyfr bez prefiksu). */
function normalizePlPhone(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  const last9 = digits.length >= 9 ? digits.slice(-9) : "";
  return /^\d{9}$/.test(last9) ? last9 : null;
}

export interface Receiver {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address?: { street?: string; building_number?: string; city?: string; post_code?: string };
}
export interface ShipmentResult {
  id: string;
  tracking_number: string | null;
  status: string;
}

const PARCEL_TEMPLATES = new Set(["small", "medium", "large"]);

export async function createShipment(opts: {
  method: "locker" | "courier";
  receiver: Receiver;
  lockerCode?: string | null;
  reference: string;
  templates?: string[] | null;
}): Promise<ShipmentResult> {
  const r = opts.receiver;
  const wanted = (opts.templates ?? []).filter((t) => PARCEL_TEMPLATES.has(t));
  const list = wanted.length ? wanted.slice(0, 5) : [TEMPLATE];
  // Paczkomat: jedna paczka na przesyłkę; kurier: wielopaczkowa.
  const parcels = (opts.method === "locker" ? [list[0]] : list).map((t) => ({ template: t }));

  const phone = normalizePlPhone(r.phone);
  if (!phone) throw new Error(`Niepoprawny numer telefonu odbiorcy — wymagane 9 cyfr (np. 500600700).`);

  if (opts.method === "locker") {
    const locker = (opts.lockerCode ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9]{3,20}$/.test(locker)) throw new Error("Niepoprawny kod paczkomatu");
    opts.lockerCode = locker;
  } else {
    const a = r.address ?? {};
    const street = (a.street ?? "").trim();
    const building = (a.building_number ?? "").trim();
    const city = (a.city ?? "").trim();
    const post = (a.post_code ?? "").trim();
    if (!street || !building || !city) throw new Error("Niepełny adres dostawy (ulica, nr budynku, miasto)");
    if (!/^\d{2}-?\d{3}$/.test(post)) throw new Error("Niepoprawny kod pocztowy (format NN-NNN)");
    r.address = {
      street,
      building_number: building,
      city,
      post_code: post.includes("-") ? post : `${post.slice(0, 2)}-${post.slice(2)}`,
    };
  }

  const receiver: Record<string, unknown> = {
    first_name: r.first_name || "Klient",
    last_name: r.last_name || "Sklepu",
    email: r.email,
    phone,
  };
  const body: Record<string, unknown> = { receiver, parcels, reference: opts.reference };

  if (opts.method === "locker") {
    body.service = SERVICE_LOCKER;
    body.custom_attributes = { target_point: opts.lockerCode, sending_method: "parcel_locker" };
  } else {
    body.service = SERVICE_COURIER;
    receiver.address = {
      street: r.address?.street ?? "",
      building_number: r.address?.building_number ?? "",
      city: r.address?.city ?? "",
      post_code: r.address?.post_code ?? "",
      country_code: "PL",
    };
    body.custom_attributes = { sending_method: "dispatch_order" };
  }

  const res = await fetch(`${BASE}/organizations/${ORG}/shipments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`InPost ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = (await res.json()) as { id: number | string; tracking_number?: string | null; status?: string };
  return { id: String(data.id), tracking_number: data.tracking_number ?? null, status: data.status ?? "created" };
}

export async function fetchLabel(id: string): Promise<Buffer | null> {
  const res = await fetch(`${BASE}/shipments/${id}/label?format=pdf&type=normal`, { headers: headers() });
  if (res.status === 404 || res.status === 422 || res.status === 425) return null;
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`InPost ${res.status}: ${txt.slice(0, 200)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.length ? buf : null;
}
