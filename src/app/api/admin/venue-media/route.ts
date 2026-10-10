import { NextResponse } from "next/server";
import { deleteVenueMedia, listVenueMedia, uploadVenueMedia } from "@/lib/venueMediaCloudinary";
import { getPersistedVenueEnhancement } from "@/lib/venueEnhancements.server";
import { getVenueListingBySlug } from "@/lib/venueData";

export const runtime = "nodejs";

function rejectCrossSiteWrite(request: Request) {
  const origin = request.headers.get("origin");
  return origin && origin !== new URL(request.url).origin
    ? NextResponse.json({ error: "Cross-site admin writes are not allowed." }, { status: 403 })
    : null;
}

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
  const rejected = rejectCrossSiteWrite(request);
  if (rejected) return rejected;
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


export async function DELETE(request: Request) {
  const rejected = rejectCrossSiteWrite(request);
  if (rejected) return rejected;

  try {
    const body = (await request.json()) as { slug?: string; publicId?: string };
    const slug = String(body.slug || "").trim();
    const publicId = String(body.publicId || "").trim();
    if (!slug || !publicId) {
      return NextResponse.json({ error: "Venue slug and media ID are required." }, { status: 400 });
    }

    const assets = await listVenueMedia(slug);
    const asset = assets.find((item) => item.publicId === publicId);
    if (!asset) return NextResponse.json({ error: "That image is not in this venue library." }, { status: 404 });

    const [profile, venue] = await Promise.all([
      getPersistedVenueEnhancement(slug),
      getVenueListingBySlug(slug),
    ]);

    const assignments = [
      profile?.heroImageUrl === asset.url ? "hero" : "",
      profile?.logoImageUrl === asset.url ? "logo / mark" : "",
      profile?.gallery?.some((item) => item.url === asset.url) ? "gallery" : "",
      venue?.bannerImageUrl === asset.url && profile?.heroImageUrl !== asset.url ? "current public venue image" : "",
    ].filter(Boolean);

    if (assignments.length) {
      return NextResponse.json(
        {
          error: `This image is still assigned as ${assignments.join(", ")}. Remove that assignment and save the venue profile before deleting the upload.`,
        },
        { status: 409 },
      );
    }

    await deleteVenueMedia(publicId, slug);
    return NextResponse.json({ ok: true, deleted: publicId });
  } catch (error) {
    console.error("Venue media delete failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Venue media delete failed." },
      { status: 500 },
    );
  }
}
