import {parseImagePlacement} from '@/lib/imagePlacement';
import {revalidatePath} from 'next/cache';
import { NextRequest, NextResponse } from "next/server";
import {
  getPersistedVenueEnhancement,
  saveVenueEnhancement,
} from "@/lib/venueEnhancements.server";
import type { VenueEnhancement } from "@/lib/venueEnhancements";

export const dynamic = "force-dynamic";

const HERO_POSITIONS = new Set(["center", "top", "bottom", "left", "right"]);

function cleanSlug(value: string | null | undefined) {
  return (value || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export async function GET(request: NextRequest) {
  const slug = cleanSlug(request.nextUrl.searchParams.get("slug"));
  if (!slug) return NextResponse.json({ error: "Venue slug is required." }, { status: 400 });

  const profile = await getPersistedVenueEnhancement(slug);
  if (!profile) return NextResponse.json({ error: "Venue enhancement not found." }, { status: 404 });
  return NextResponse.json({ slug, profile });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { slug?: string; profile?: VenueEnhancement };
    const slug = cleanSlug(body.slug);
    const profile = body.profile;

    if (!slug || !profile || typeof profile.enabled !== "boolean") {
      return NextResponse.json({ error: "A valid venue profile is required." }, { status: 400 });
    }

    if (profile.featured !== undefined && typeof profile.featured !== "boolean") {
      return NextResponse.json({ error: "Featured state is invalid." }, { status: 400 });
    }

    if (profile.featured) {
      const priority = profile.featuredPriority;
      if (typeof priority !== "number" || !Number.isFinite(priority) || priority < 1 || priority > 99) {
        return NextResponse.json({ error: "Featured priority must be between 1 and 99." }, { status: 400 });
      }
    }

    if (profile.heroPosition && !HERO_POSITIONS.has(profile.heroPosition)) {
      return NextResponse.json({ error: "Hero focal position is invalid." }, { status: 400 });
    }

    if (!Array.isArray(profile.gallery) || profile.gallery.length > 15) {
      return NextResponse.json({ error: "Gallery must contain 15 photos or fewer." }, { status: 400 });
    }

    if (!Array.isArray(profile.amenities) || !Array.isArray(profile.weeklySpecials) || !Array.isArray(profile.dailyDeals)) {
      return NextResponse.json({ error: "Profile lists are invalid." }, { status: 400 });
    }

    if (profile.venueEvents !== undefined) {
      if (!Array.isArray(profile.venueEvents) || profile.venueEvents.length > 40) {
        return NextResponse.json({ error: "Upcoming events must contain 40 items or fewer." }, { status: 400 });
      }
      const invalidEvent = profile.venueEvents.some((event) =>
        !event || typeof event.title !== "string" || !event.title.trim() || event.title.length > 140 ||
        typeof event.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(event.date) ||
        (event.time !== undefined && (typeof event.time !== "string" || event.time.length > 40)) ||
        (event.detail !== undefined && (typeof event.detail !== "string" || event.detail.length > 240)) ||
        (event.recurring !== undefined && typeof event.recurring !== "boolean")
      );
      if (invalidEvent) return NextResponse.json({ error: "One or more upcoming events are invalid." }, { status: 400 });
    }

    if (profile.singerSignupUrl && !/^https?:\/\//i.test(profile.singerSignupUrl)) {
      return NextResponse.json({ error: "Singer signup URL must start with https:// or http://." }, { status: 400 });
    }

    if (profile.vibeTags !== undefined && (!Array.isArray(profile.vibeTags) || profile.vibeTags.length > 4)) {
      return NextResponse.json({ error: "Choose four vibe tags or fewer." }, { status: 400 });
    }

    const conciseFields = [profile.foodSummary, profile.whyHere, profile.singersSaySource];
    if (conciseFields.some((value) => typeof value === "string" && value.length > 240)) {
      return NextResponse.json({ error: "Venue intelligence summary fields must be 240 characters or fewer." }, { status: 400 });
    }

    if (typeof profile.singersSay === "string" && profile.singersSay.length > 600) {
      return NextResponse.json({ error: "Singers Say must be 600 characters or fewer." }, { status: 400 });
    }

    if (profile.singhubOffer) {
      const offer = profile.singhubOffer;
      if (typeof offer.enabled !== "boolean") {
        return NextResponse.json({ error: "SingHUB Offer state is invalid." }, { status: 400 });
      }
      if (offer.enabled && !offer.title?.trim()) {
        return NextResponse.json({ error: "An enabled SingHUB Offer needs a headline." }, { status: 400 });
      }
      if ((offer.title?.length || 0) > 120 || (offer.detail?.length || 0) > 240 || (offer.terms?.length || 0) > 300) {
        return NextResponse.json({ error: "SingHUB Offer copy is too long." }, { status: 400 });
      }
      if (offer.days !== undefined && (!Array.isArray(offer.days) || offer.days.some((day) => !["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].includes(day)))) {
        return NextResponse.json({ error: "SingHUB Offer days are invalid." }, { status: 400 });
      }
    }

    try {
      profile.heroPlacement=parseImagePlacement(profile.heroPlacement);
      profile.logoPlacement=parseImagePlacement(profile.logoPlacement);
      profile.gallery=profile.gallery.map(item=>({...item,placement:parseImagePlacement(item.placement)}));
    } catch(error) {return NextResponse.json({error:error instanceof Error?error.message:'Invalid image placement.'},{status:400});}
    await saveVenueEnhancement(slug, profile);
    revalidatePath(`/venues/${slug}`);
    revalidatePath('/find-karaoke');
    revalidatePath('/');
    return NextResponse.json({ saved: true, slug, profile });
  } catch (error) {
    console.error("Venue enhancement save failed", error);
    return NextResponse.json({ error: "Venue profile could not be saved." }, { status: 500 });
  }
}
