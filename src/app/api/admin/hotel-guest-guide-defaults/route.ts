import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { parseGuestGuideLifestyleMedia } from "@/lib/hotelProfiles";
import { getGuestGuideDefaults, saveGuestGuideDefaults } from "@/lib/hotelProfiles.server";

export async function GET() {
  try {
    return NextResponse.json({ defaults: await getGuestGuideDefaults() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load Guest Guide defaults." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Cross-site admin writes are not allowed." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const defaults = parseGuestGuideLifestyleMedia(body.defaults);
    const saved = await saveGuestGuideDefaults(defaults);
    revalidatePath("/hotelexperience/[slug]", "page");
    return NextResponse.json({ ok: true, defaults: saved });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Guest Guide defaults were not saved." }, { status: 400 });
  }
}
