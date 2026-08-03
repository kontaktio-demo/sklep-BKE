import { withAdmin } from "@/lib/server/adminRoute";
import { listMessages } from "@/lib/server/adminData";
export async function GET(req: Request) {
  return withAdmin(req, () => listMessages());
}
