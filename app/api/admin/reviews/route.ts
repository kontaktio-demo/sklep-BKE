import { withAdmin } from "@/lib/server/adminRoute";
import { listReviews } from "@/lib/server/adminData";
export async function GET(req: Request) {
  return withAdmin(req, () => listReviews());
}
