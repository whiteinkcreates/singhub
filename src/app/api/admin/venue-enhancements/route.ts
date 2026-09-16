import { NextRequest, NextResponse } from "next/server";
import {
  getAdminVenueEnhancement,
  saveVenueEnhancement,
} from "@/lib/venueEnhancements.server";
import type { VenueEnhancement } from "@/lib/venueEnhancements";

export const dynamic = "force-dynamic";

function cleanSlug(value: string | null | undefined) {
  return (value || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export async function GET(request: NextRequest) {
  const slug = cleanSlug(request.nextUrl.searchParams.get("slug"));
  if (!slug) return NextResponse.json({ error: "Venue slug is required." }, { status: 400 });

  const profile = await getAdminVenueEnhancement(slug);
  return NextResponse.json({ slug, profile: profile || null });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { slug?: string; profile?: VenueEnhancement };
    const slug = cleanSlug(body.slug);
    const profile = body.profile;

    if (!slug || !profile || typeof profile.enabled !== "boolean") {
      return NextResponse.json({ error: "A valid venue profile is required." }, { status: 400 });
    }

    if (!Array.isArray(profile.gallery) || profile.gallery.length > 15) {
      return NextResponse.json({ error: "Gallery must contain 15 photos or fewer." }, { status: 400 });
    }

    if (!Array.isArray(profile.amenities) || !Array.isArray(profile.weeklySpecials) || !Array.isArray(profile.dailyDeals)) {
      return NextResponse.json({ error: "Profile lists are invalid." }, { status: 400 });
    }

    await saveVenueEnhancement(slug, profile);
    return NextResponse.json({ saved: true, slug, profile });
  } catch (error) {
    console.error("Venue enhancement save failed", error);
    return NextResponse.json({ error: "Venue profile could not be saved." }, { status: 500 });
  }
}
