import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SERVER, hasSupabase } from "@/lib/env";

/**
 * Serwerowy klient Supabase na kluczu SERVICE_ROLE — omija RLS, robi wszystkie zapisy
 * (katalog, zamówienia, admin). WYŁĄCZNIE po stronie serwera (route handlery, RSC, akcje).
 * Zwraca null, gdy baza nieskonfigurowana — wywołania mają wtedy fallback (mock/blokada).
 */
let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  if (cached) return cached;
  cached = createClient(SERVER.supabaseUrl, SERVER.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** Twardy wariant — rzuca, gdy baza nieskonfigurowana (dla ścieżek, które MUSZĄ mieć DB). */
export function requireSupabaseAdmin(): SupabaseClient {
  const client = supabaseAdmin();
  if (!client) throw new Error("SUPABASE_NOT_CONFIGURED");
  return client;
}
