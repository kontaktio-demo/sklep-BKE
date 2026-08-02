import { withAdmin, readJson } from "@/lib/server/adminRoute";
import { getSettingsStore, putSettingsStore } from "@/lib/server/adminData";

export async function GET(req: Request) {
  return withAdmin(req, () => getSettingsStore());
}

export async function PUT(req: Request) {
  const body = await readJson<Record<string, unknown>>(req);
  return withAdmin(req, () => putSettingsStore(body).then(() => body));
}
