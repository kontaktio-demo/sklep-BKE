import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { getOrder, updateOrder } from "@/lib/server/adminData";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return withAdmin(req, () => getOrder(id));
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await readJson(req);
  return withAdmin(req, () => updateOrder(id, body).then(() => ({ id })));
}
