import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hotelDemoPhotos } from "@/lib/hotelPhotoCandidates.server";
import { getHotelGuide } from "@/lib/hotelGuides";
import { parseHotelMediaProfile, type HotelMediaProfile } from "@/lib/hotelProfiles";
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
  let profile: HotelMediaProfile;
  try {
    const body = await request.json();
    slug = body.slug;
    if (typeof slug !== "string" || !getHotelGuide(slug)) throw new Error("Choose a registered hotel.");
    // Published snapshots are retained from the server record, never client input.
    profile = parseHotelMediaProfile({ ...body.profile, publishedHero: undefined });
    if (profile.packageReview?.heroApproved && Object.values(hotelDemoPhotos).some(photo => photo.imageUrl === profile.packageReview?.heroImageUrl && photo.credit.status === "illustrative")) throw new Error("Illustrative property concepts cannot be approved as hotel photography.");
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid hotel media." }, { status: 400 }); }
  try {
    profile = await saveHotelMediaProfile(slug, profile);
    revalidatePath(`/hotel/${slug}`);
    revalidatePath("/hotelexperience/[slug]", "page");
    return NextResponse.json({ ok: true, profile });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Hotel media was not saved." }, { status: 503 }); }
}
