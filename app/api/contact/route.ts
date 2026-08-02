import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendContactNotify } from "@/lib/server/email";

const Body = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().email().optional(),
  subject: z.string().trim().max(160).optional(),
  message: z.string().trim().min(3).max(4000),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  const b = parsed.data;

  const db = supabaseAdmin();
  if (db) {
    await db.from("contact_messages").insert({
      name: b.name ?? null,
      email: b.email ?? null,
      subject: b.subject ?? null,
      message: b.message,
      user_agent: req.headers.get("user-agent") ?? null,
    });
  }
  await sendContactNotify({ name: b.name ?? null, email: b.email ?? null, subject: b.subject ?? null, message: b.message });
  return NextResponse.json({ ok: true });
}
