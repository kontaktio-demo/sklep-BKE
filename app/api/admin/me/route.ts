import { NextResponse } from "next/server";
import { adminAccess } from "@/lib/server/adminAuth";
import { hasDb } from "@/lib/server/adminData";

// Panel sprawdza tryb dostępu (ok/demo) i czy baza jest podpięta.
export async function GET(req: Request) {
  const access = adminAccess(req);
  if (access === "denied") return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  return NextResponse.json({ ok: true, access, hasDb: hasDb() });
}
