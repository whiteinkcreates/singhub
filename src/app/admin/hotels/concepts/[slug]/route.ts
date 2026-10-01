import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const concepts = new Set(["andaz-san-diego", "hotel-indigo-gaslamp", "pantai-inn", "inn-by-the-sea-la-jolla"]);
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  await requireAdminAuthorization();
  const { slug } = await params;
  if (!concepts.has(slug)) return new Response("Not found", { status: 404 });
  const bytes = await readFile(path.join(process.cwd(), "src/assets/hotel-concepts", `${slug}.webp`));
  return new Response(new Uint8Array(bytes), { headers: {
    "Content-Type": "image/webp",
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff",
  } });
}
