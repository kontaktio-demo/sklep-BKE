import { NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerFromRequest } from "@/lib/server/customerAuth";
import { supabaseAdmin } from "@/lib/supabase/server";

async function me(req: Request) {
  const c = await getCustomerFromRequest(req);
  return c;
}
const un = () => NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

export async function GET(req: Request) {
  const c = await me(req);
  if (!c) return un();
  const db = supabaseAdmin();
  const { data } = db ? await db.from("account_profiles").select("*").eq("user_id", c.userId).maybeSingle() : { data: null };
  return NextResponse.json({ ok: true, profile: data ?? null, email: c.email });
}

const ProfileBody = z.object({
  full_name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(20).optional(),
  marketing_consent: z.boolean().optional(),
});

export async function PUT(req: Request) {
  const c = await me(req);
  if (!c) return un();
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });
  const parsed = ProfileBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  const patch: Record<string, unknown> = { user_id: c.userId, ...parsed.data };
  if (parsed.data.marketing_consent) patch.marketing_consent_at = new Date().toISOString();
  await db.from("account_profiles").upsert(patch, { onConflict: "user_id" });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const c = await me(req);
  if (!c) return un();
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });
  await db.rpc("delete_customer_account", { p_user: c.userId, p_email: c.email ?? "" });
  return NextResponse.json({ ok: true });
}
