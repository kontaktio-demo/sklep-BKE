import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { createPromotion, listPromotions } from "@/lib/server/adminData";

export async function GET(req: Request) {
  return withAdmin(req, () => listPromotions());
}

export async function POST(req: Request) {
  const body = await readJson(req);
  return withAdmin(req, () => createPromotion(body));
}
