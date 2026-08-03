import { withAdmin } from "@/lib/server/adminRoute";
import { listSubscribers } from "@/lib/server/adminData";
export async function GET(req: Request) {
  return withAdmin(req, () => listSubscribers());
}
