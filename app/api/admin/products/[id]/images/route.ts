import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/adminAuth";
import { addProductImage, NeedsDb } from "@/lib/server/adminData";

// Upload zdjęcia produktu do Supabase Storage (multipart/form-data, pole "file").
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = adminGuard(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "NO_FILE" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ ok: false, error: "NOT_IMAGE" }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ ok: false, error: "TOO_LARGE" }, { status: 400 });
    const buf = await file.arrayBuffer();
    const res = await addProductImage(id, buf, file.type, file.name);
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    if (e instanceof NeedsDb) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });
    return NextResponse.json({ ok: false, error: "UPLOAD_FAILED", message: e instanceof Error ? e.message : "błąd" }, { status: 500 });
  }
}
