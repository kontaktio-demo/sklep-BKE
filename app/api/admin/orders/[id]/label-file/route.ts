import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/adminAuth";
import { getOrderLabelPdf } from "@/lib/server/adminData";

// Pobranie etykiety PDF przesyłki zamówienia.
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = adminGuard(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const pdf = await getOrderLabelPdf(id);
    if (!pdf) return NextResponse.json({ ok: false, error: "NO_LABEL" }, { status: 404 });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="etykieta-${id}.pdf"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "błąd" }, { status: 500 });
  }
}
