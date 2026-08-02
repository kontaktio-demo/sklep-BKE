import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Weryfikacja konta klienta z nagłówka Authorization: Bearer <supabase access_token>.
 * Konto jest OPCJONALNE (gość jest domyślny), więc brak/nieprawidłowy token => null,
 * a wołający i tak działa (zamówienie gościa). Waliduje token przez Supabase Auth.
 */
export interface CustomerIdentity {
  userId: string;
  email: string | null;
}

function bearer(req: Request): string | null {
  const h = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1] : null;
}

export async function getCustomerFromRequest(req: Request): Promise<CustomerIdentity | null> {
  const token = bearer(req);
  if (!token) return null;
  const db = supabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) return null;
  return { userId: data.user.id, email: data.user.email ?? null };
}

/** Twardy wariant — rzuca 401-owalny błąd, gdy brak ważnego konta. */
export async function requireCustomer(req: Request): Promise<CustomerIdentity> {
  const c = await getCustomerFromRequest(req);
  if (!c) throw new Error("UNAUTHORIZED");
  return c;
}
