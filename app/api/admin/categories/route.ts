import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { createCategory, listCategories } from "@/lib/server/adminData";

export async function GET(req: Request) {
  const sklep = new URL(req.url).searchParams.get("sklep");
  const line = sklep === "pro" || sklep === "shop" ? sklep : undefined;
  return withAdmin(req, () => listCategories(line));
}

export async function POST(req: Request) {
  const body = await readJson(req);
  return withAdmin(req, () => createCategory(body));
}
