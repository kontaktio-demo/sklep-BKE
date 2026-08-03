import { withAdmin } from "@/lib/server/adminRoute";
import { deleteProductImage } from "@/lib/server/adminData";

export async function DELETE(req: Request, ctx: { params: Promise<{ imageId: string }> }) {
  const { imageId } = await ctx.params;
  return withAdmin(req, () => deleteProductImage(imageId).then(() => ({ id: imageId })));
}
