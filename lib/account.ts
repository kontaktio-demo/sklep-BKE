"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";

// Klient API konta — dokłada token dostępu Supabase (Bearer) do wywołań /api/account/*.
async function token(): Promise<string | null> {
  const s = supabaseBrowser();
  if (!s) return null;
  const { data } = await s.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function accountFetch<T = unknown>(path: string, opts: RequestInit = {}): Promise<T> {
  const t = await token();
  const res = await fetch(`/api/account${path}`, {
    ...opts,
    headers: { authorization: t ? `Bearer ${t}` : "", "content-type": "application/json", ...(opts.headers ?? {}) },
  });
  return (await res.json()) as T;
}
