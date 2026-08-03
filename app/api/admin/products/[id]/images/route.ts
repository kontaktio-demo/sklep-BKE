import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/adminAuth";
import { addProductImage, NeedsDb } from "@/lib/server/adminData";

// Dozwolone TYLKO formaty rastrowe. SVG jest ODRZUCANY (może zawierać <script> → stored XSS
// przy otwarciu publicznego URL-a z bucketa). MIME z przeglądarki nie wystarcza — sprawdzamy
// też sygnaturę pliku (magic bytes), bo Content-Type deklaruje klient.
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sniff(buf: ArrayBuffer): string | null {
  const b = new Uint8Array(buf);
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  const ascii = (i: number, s: string) => s.split("").every((c, k) => b[i + k] === c.charCodeAt(0));
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  if (ascii(4, "ftyp") && (ascii(8, "avif") || ascii(8, "avis"))) return "image/avif";
  return null;
}

// Upload zdjęcia produktu do Supabase Storage (multipart/form-data, pole "file").
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = adminGuard(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NextResponse.json({ ok: false, error: "BAD_ID" }, { status: 400 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "NO_FILE" }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ ok: false, error: "NOT_IMAGE" }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ ok: false, error: "TOO_LARGE" }, { status: 400 });
    const buf = await file.arrayBuffer();
    // sygnatura musi zgadzać się z whitelistą — inaczej odrzucamy (np. SVG/PDF podszyty pod image/*)
    const real = sniff(buf);
    if (!real || !ALLOWED.has(real)) {
      return NextResponse.json({ ok: false, error: "NOT_IMAGE" }, { status: 400 });
    }
    // ext bierzemy z rozpoznanej sygnatury, nie z deklarowanego MIME
    const res = await addProductImage(id, buf, real, file.name);
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    if (e instanceof NeedsDb) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });
    return NextResponse.json({ ok: false, error: "UPLOAD_FAILED", message: e instanceof Error ? e.message : "błąd" }, { status: 500 });
  }
}
