import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/adminAuth";
import { deleteOrderShipment } from "@/lib/server/adminData";

// Usunięcie przesyłki (błędnej etykiety) z zamówienia.
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string; sid: string }> }) {
  const denied = adminGuard(req);
  if (denied) return denied;
  const { id, sid } = await ctx.params;
  try {
    const res = await deleteOrderShipment(id, sid);
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "błąd" }, { status: 500 });
  }
}
