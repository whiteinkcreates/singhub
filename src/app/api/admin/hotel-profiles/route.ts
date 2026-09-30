import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getHotelGuide } from "@/lib/hotelGuides";
import { parseHotelMediaProfile } from "@/lib/hotelProfiles";
import { getHotelMediaProfile, saveHotelMediaProfile } from "@/lib/hotelProfiles.server";
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug") || "";
  if (!getHotelGuide(slug)) return NextResponse.json({ error: "Choose a registered hotel." }, { status: 400 });
  try { return NextResponse.json({ profile: await getHotelMediaProfile(slug) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load hotel media." }, { status: 503 }); }
}
export async function PUT(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Cross-site admin writes are not allowed." }, { status: 403 });
  let slug: string;
  let profile;
  try {
    const body = await request.json();
    slug = body.slug;
    if (typeof slug !== "string" || !getHotelGuide(slug)) throw new Error("Choose a registered hotel.");
    profile = parseHotelMediaProfile(body.profile);
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid hotel media." }, { status: 400 }); }
  try {
    await saveHotelMediaProfile(slug, profile);
    revalidatePath(`/hotel/${slug}`);
    return NextResponse.json({ ok: true, profile });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Hotel media was not saved." }, { status: 503 }); }
}
