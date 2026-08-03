"use client";

// Klient panelu: klucz admina w localStorage + fetch z nagłówkiem x-admin-key.
const KEY = "dogstore-admin-key";

export function getKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) ?? "";
}
export function setKey(v: string): void {
  window.localStorage.setItem(KEY, v);
}
export function clearKey(): void {
  window.localStorage.removeItem(KEY);
}

export interface AdminResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
  access?: "ok" | "demo";
  hasDb?: boolean;
  publicKey?: string;
}

export async function adminFetch<T = unknown>(path: string, opts: RequestInit = {}): Promise<AdminResult<T>> {
  try {
    const res = await fetch(`/api/admin${path}`, {
      ...opts,
      headers: { "x-admin-key": getKey(), "content-type": "application/json", ...(opts.headers ?? {}) },
    });
    return (await res.json()) as AdminResult<T>;
  } catch {
    return { ok: false, error: "NETWORK" };
  }
}

export const zl = (grosze: number) => (grosze / 100).toFixed(2).replace(".", ",") + " zł";
export const dt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
};
