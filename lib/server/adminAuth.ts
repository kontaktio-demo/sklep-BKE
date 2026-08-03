import "server-only";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { SERVER } from "@/lib/env";

/**
 * Dostęp do panelu i /api/admin/*: nagłówek x-admin-key porównywany w czasie stałym.
 *
 * Tryby:
 *  - PRODUKCJA: wymaga ustawionego ADMIN_API_KEY i zgodnego nagłówka.
 *  - DEV/preview bez ustawionego ADMIN_API_KEY: dostęp „demo" (tylko po to, żeby móc
 *    obejrzeć panel przed konfiguracją). Zapisy i tak wymagają bazy.
 * Ustaw ADMIN_API_KEY przed wdrożeniem — inaczej w produkcji panel jest ZABLOKOWANY.
 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export type AdminAccess = "ok" | "demo" | "denied";

export function adminAccess(req: Request): AdminAccess {
  const key = SERVER.adminApiKey;
  const header = req.headers.get("x-admin-key") ?? "";
  if (key) return header && safeEqual(header, key) ? "ok" : "denied";
  // ADMIN_API_KEY nieustawiony:
  if (process.env.NODE_ENV === "production") return "denied"; // nigdy otwarte na produkcji
  return "demo";
}

/** Zwraca null gdy dostęp OK/demo; w przeciwnym razie gotową odpowiedź 401. */
export function adminGuard(req: Request): NextResponse | null {
  return adminAccess(req) === "denied"
    ? NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
    : null;
}
