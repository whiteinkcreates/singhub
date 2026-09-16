import { NextResponse } from "next/server";
import { listVenueMedia, uploadVenueMedia } from "@/lib/venueMediaCloudinary";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const slug = new URL(request.url).searchParams.get("slug") || "";
    if (!slug) {
      return NextResponse.json({ error: "Venue slug is required." }, { status: 400 });
    }

    const assets = await listVenueMedia(slug);
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
  try {
    const form = await request.formData();
    const slug = String(form.get("slug") || "");
    const file = form.get("file");

    if (!slug) {
      return NextResponse.json({ error: "Venue slug is required." }, { status: 400 });
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

    const asset = await uploadVenueMedia(file, slug);
    return NextResponse.json({ ok: true, asset });
  } catch (error) {
    console.error("Venue media upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Venue media upload failed." },
      { status: 500 },
    );
  }
}
