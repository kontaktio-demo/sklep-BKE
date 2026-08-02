import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { PUBLIC } from "@/lib/env";

// Wypisanie z newslettera (stały token z maila).
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const db = supabaseAdmin();
  if (token && db) {
    await db.from("newsletter_subscribers").delete().eq("unsub_token", token);
  }
  return NextResponse.redirect(`${PUBLIC.siteUrl}/?newsletter=wypisany`);
}
