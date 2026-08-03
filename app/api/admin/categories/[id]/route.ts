import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { deleteCategory, updateCategory } from "@/lib/server/adminData";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await readJson(req);
  return withAdmin(req, () => updateCategory(id, body).then(() => ({ id })));
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return withAdmin(req, () => deleteCategory(id).then(() => ({ id })));
}
