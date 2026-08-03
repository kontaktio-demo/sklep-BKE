import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendNewsletterConfirm } from "@/lib/server/email";
import { checkRate } from "@/lib/server/rateLimit";
import { PUBLIC } from "@/lib/env";

const Body = z.object({ email: z.string().email(), source: z.string().max(60).optional() });

// Zapis do newslettera z DOUBLE OPT-IN: rekord niepotwierdzony + mail z linkiem potwierdzenia.
export async function POST(req: Request) {
  const limited = checkRate(req, "newsletter", 5, 3600); // maks. 5 zapisów / godz / IP
  if (limited) return limited;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "BAD_EMAIL" }, { status: 400 });
  const email = parsed.data.email.toLowerCase();

  const db = supabaseAdmin();
  if (!db) {
    // bez bazy nie zapiszemy tokenów — informujemy, że zapis wymaga konfiguracji
    return NextResponse.json({ ok: true, pending: true });
  }

  const confirmToken = randomBytes(16).toString("hex");
  const unsubToken = randomBytes(16).toString("hex");
  const { data: existing } = await db
    .from("newsletter_subscribers")
    .select("id,confirmed")
    .ilike("email", email)
    .maybeSingle();

  if (existing?.confirmed) return NextResponse.json({ ok: true, already: true });

  if (existing) {
    await db.from("newsletter_subscribers").update({ confirm_token: confirmToken }).eq("id", existing.id);
  } else {
    await db.from("newsletter_subscribers").insert({
      email,
      source: parsed.data.source ?? "web",
      confirmed: false,
      confirm_token: confirmToken,
      unsub_token: unsubToken,
    });
  }

  await sendNewsletterConfirm(email, `${PUBLIC.siteUrl}/api/newsletter/confirm?token=${confirmToken}`);
  return NextResponse.json({ ok: true });
}
