import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { deleteReview, moderateReview } from "@/lib/server/adminData";
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await readJson<{ status?: string }>(req);
  return withAdmin(req, () => moderateReview(id, body.status ?? "published").then(() => ({ id })));
}
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return withAdmin(req, () => deleteReview(id).then(() => ({ id })));
}
