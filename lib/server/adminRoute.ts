import "server-only";
import { NextResponse } from "next/server";
import { adminGuard } from "./adminAuth";
import { NeedsDb } from "./adminData";

/** Wrapper tras panelu: bramka admina + jednolita obsługa błędów (brak DB / serwer). */
export async function withAdmin(req: Request, fn: () => Promise<unknown>): Promise<NextResponse> {
  const denied = adminGuard(req);
  if (denied) return denied;
  try {
    const data = await fn();
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    if (e instanceof NeedsDb) {
      return NextResponse.json(
        { ok: false, error: "NEEDS_DB", message: "Skonfiguruj Supabase, aby zapisywać zmiany." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: e instanceof Error ? e.message : "błąd" },
      { status: 500 }
    );
  }
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  return (await req.json().catch(() => ({}))) as T;
}
