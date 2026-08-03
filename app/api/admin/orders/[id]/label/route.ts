import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/adminAuth";
import { createOrderLabel } from "@/lib/server/adminData";

// Utworzenie przesyłki InPost dla zamówienia (etykieta).
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = adminGuard(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const res = await createOrderLabel(id);
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "błąd";
    const status = msg === "INPOST_NOT_CONFIGURED" ? 501 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
