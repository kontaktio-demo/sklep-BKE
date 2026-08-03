import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { PUBLIC } from "@/lib/env";

// Potwierdzenie double opt-in (link z maila). Ustawia confirmed=true i wraca na stronę.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const db = supabaseAdmin();
  if (token && db) {
    await db.from("newsletter_subscribers").update({ confirmed: true, confirm_token: null }).eq("confirm_token", token);
  }
  return NextResponse.redirect(`${PUBLIC.siteUrl}/?newsletter=potwierdzony`);
}
