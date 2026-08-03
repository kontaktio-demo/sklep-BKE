import { NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/server/customerAuth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { AddressBody } from "@/lib/server/addressSchema";

const un = () => NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const c = await getCustomerFromRequest(req);
  if (!c) return un();
  const { id } = await ctx.params;
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, error: "NEEDS_DB" }, { status: 400 });
  // Walidacja + biała lista kolumn (bez mass assignment) — te same pola co przy tworzeniu.
  const parsed = AddressBody.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  await db.from("account_addresses").update(parsed.data).eq("id", id).eq("user_id", c.userId);
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
