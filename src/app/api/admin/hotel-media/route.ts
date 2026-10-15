import { NextResponse } from "next/server";
import { deleteVenueMedia, listVenueMedia, uploadVenueMedia } from "@/lib/venueMediaCloudinary";

import { createAdminClient } from "@/lib/supabase/admin";
import { CURATED_SECTION_FALLBACK } from "@/lib/hotelProfiles.server";
import { hotelGuides } from "@/lib/hotelGuides";
import { licensedHotelPhotos, hotelDemoPhotos } from "@/lib/hotelPhotoCandidates.server";
import { hotelAssetAssignments } from "@/lib/hotelMediaUsage";
import { getHotelGuide } from "@/lib/hotelGuides";
import { GUEST_GUIDE_DEFAULTS_SLUG } from "@/lib/hotelProfiles";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const slug = new URL(request.url).searchParams.get("slug") || "";
    if (!getHotelGuide(slug) && slug !== GUEST_GUIDE_DEFAULTS_SLUG) {
      return NextResponse.json({ error: "Choose a registered hotel." }, { status: 400 });
    }

    const assets = await listVenueMedia(slug, "hotels");
    return NextResponse.json({ ok: true, assets });
  } catch (error) {
    console.error("Venue media lookup failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Venue media lookup failed." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Cross-site admin writes are not allowed." }, { status: 403 });
  try {
    const form = await request.formData();
    const slug = String(form.get("slug") || "");
    const file = form.get("file");

    if (!getHotelGuide(slug) && slug !== GUEST_GUIDE_DEFAULTS_SLUG) {
      return NextResponse.json({ error: "Choose a registered hotel." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files can be uploaded." }, { status: 400 });
    }
    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 12 MB." }, { status: 400 });
    }

    const asset = await uploadVenueMedia(file, slug, "hotels");
    return NextResponse.json({ ok: true, asset });
  } catch (error) {
    console.error("Venue media upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Venue media upload failed." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Cross-site admin writes are not allowed." }, { status: 403 });
  try {
    const body = await request.json();
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const publicId = typeof body.publicId === "string" ? body.publicId.trim() : "";
    if ((!getHotelGuide(slug) && slug !== GUEST_GUIDE_DEFAULTS_SLUG) || !publicId) return NextResponse.json({ error: "Choose a registered hotel and upload." }, { status: 400 });
    const assets = await listVenueMedia(slug, "hotels");
    const asset = assets.find(item => item.publicId === publicId);
    if (!asset) return NextResponse.json({ error: "That image is not in this hotel library." }, { status: 404 });
    // Include retained published heroes and shared section images in every hotel.
    const { data, error } = await createAdminClient().from("hotel_profiles").select("slug,media");
    if (error || !data) throw new Error("Image usage could not be checked. Nothing was deleted.");
    const codeReferences = [
      { slug: "shared fallback", media: CURATED_SECTION_FALLBACK },
      ...hotelGuides.map(hotel => ({ slug: hotel.slug, media: { heroImageUrl: hotel.heroImageUrl } })),
      ...Object.entries({ ...hotelDemoPhotos, ...licensedHotelPhotos }).map(([slug, photo]) => ({ slug, media: { heroImageUrl: photo.imageUrl } })),
    ];
    const assignments = hotelAssetAssignments([...data, ...codeReferences], asset);
    if (assignments.length) return NextResponse.json({ error: `This image is still used by ${assignments.join(", ")}. Clear or replace it and save before deleting the upload.` }, { status: 409 });
    await deleteVenueMedia(publicId, slug, "hotels");
    return NextResponse.json({ ok: true, deleted: publicId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Hotel image could not be deleted." }, { status: 500 });
  }
}
