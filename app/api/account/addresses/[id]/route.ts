import { NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/server/customerAuth";
import { supabaseAdmin } from "@/lib/supabase/server";

const un = () => NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const c = await getCustomerFromRequest(req);
  if (!c) return un();
  const { id } = await ctx.params;
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  delete body.user_id;
  delete body.id;
  await db.from("account_addresses").update(body).eq("id", id).eq("user_id", c.userId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const c = await getCustomerFromRequest(req);
  if (!c) return un();
  const { id } = await ctx.params;
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });
  await db.from("account_addresses").delete().eq("id", id).eq("user_id", c.userId);
  return NextResponse.json({ ok: true });
}
