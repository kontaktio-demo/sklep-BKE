"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PUBLIC, hasSupabasePublic } from "@/lib/env";

/**
 * Przeglądarkowy klient Supabase (klucz anon) — WYŁĄCZNIE do logowania klienta
 * (magic-link) i sesji. Zwraca null, gdy Supabase nieskonfigurowany (konto niedostępne,
 * sklep działa jako gość).
 */
let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient | null {
  if (!hasSupabasePublic()) return null;
  if (!client) client = createBrowserClient(PUBLIC.supabaseUrl, PUBLIC.supabaseAnonKey);
  return client;
}
