import { NextResponse } from "next/server";
import { listVenueMedia, uploadVenueMedia } from "@/lib/venueMediaCloudinary";

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
