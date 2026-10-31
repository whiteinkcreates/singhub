import { NextResponse } from "next/server";
import { uploadSingBoardImage } from "@/lib/singboard/cloudinary";
import { findSingBoardSlot, isSingBoardSlotOccupied, SINGBOARD_SLOTS } from "@/lib/singboard/layout";
import { getVenueListings } from "@/lib/venueData";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getActiveHosts } from "@/lib/hostData";
import {
  createSingBoardPost, getActiveSingBoardFlyers, getAuthorizedSingBoardPoster,
  type SingBoardNoteColor, type SingBoardPostType, type SingBoardRegion,
} from "@/lib/singboard/repository";

export const runtime = "nodejs";
const ALLOWED_REGIONS = new Set<SingBoardRegion>(["east-county","central","beach","downtown","south-bay","north-county"]);
const ALLOWED_TYPES = new Set<SingBoardPostType>(["image", "note", "wanted"]);
const ALLOWED_NOTE_COLORS = new Set<SingBoardNoteColor>(["yellow", "pink", "blue", "green", "white"]);
const ALLOWED_CATEGORIES = new Set(["special_event", "theme_karaoke", "hiring", "community", "notice"]);

function field(form: FormData, key: string) { return String(form.get(key) || "").trim(); }
function required(form: FormData, key: string) {
  const value = field(form, key);
  if (!value) throw new Error(`${key} is required.`);
  return value;
}
function dateIsValid(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(value + "T12:00:00Z").getTime()) &&
    new Date(value + "T12:00:00Z").toISOString().slice(0,10) === value;
}
function safeLink(value: string) {
  if (!value) return true;
  if (/^\/(?!\/)[a-z0-9/_-]+$/i.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; }
  catch { return false; }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
    const form = await request.formData();
    const poster = await getAuthorizedSingBoardPoster(required(form, "accessCode"));
    if (!poster) return NextResponse.json({ error: "Invalid or inactive SingBOARD access code." }, { status: 403 });

    const postType = required(form, "postType") as SingBoardPostType;
    const region = required(form, "region") as SingBoardRegion;
    if (!ALLOWED_TYPES.has(postType) || !ALLOWED_REGIONS.has(region)) {
      return NextResponse.json({ error: "Invalid SingBOARD category or region." }, { status: 400 });
    }
    const eventDate = required(form, "eventDate");
    if (!dateIsValid(eventDate)) return NextResponse.json({ error: "Use a valid event date." }, { status: 400 });
    const category = field(form, "category") || (postType === "wanted" ? "hiring" : "special_event");
    if (!ALLOWED_CATEGORIES.has(category)) return NextResponse.json({ error: "Invalid post category." }, { status: 400 });
    const linkUrl = field(form, "linkUrl");
    if (!safeLink(linkUrl)) return NextResponse.json({ error: "Event links must use http(s) or a relative site path." }, { status: 400 });

    // Legacy corkboard placements still work. New discovery cards do not require one of eight slots.
    const activePosts = await getActiveSingBoardFlyers();
    const withPlacement = ["x","y","rotation"].every(key => form.has(key));
    let placement = { x: 0, y: 0, rotation: 0 };
    if (withPlacement) {
      placement = { x: Number(form.get("x")), y: Number(form.get("y")), rotation: Number(form.get("rotation")) };
      const slot = findSingBoardSlot(placement);
      if (!slot || isSingBoardSlotOccupied(slot, activePosts)) {
        return NextResponse.json({ error: "That flyer position is unavailable." }, { status: 409 });
      }
    } else {
      const slot = SINGBOARD_SLOTS.find(candidate => !isSingBoardSlotOccupied(candidate, activePosts));
      if (slot) placement = { x: slot.x, y: slot.y, rotation: slot.rotation };
    }

    let venueName = required(form, "venueName");
    let neighborhood = required(form, "neighborhood");
    let venueSlug: string | undefined;
    let hostId: string | undefined;
    let hostName = field(form, "hostName");

    const requestedVenueSlug = field(form, "venueSlug");
    const requestedHostId = field(form, "hostId");
    if (requestedVenueSlug || poster.poster_type === "venue") {
      const venues = getPublicVenues(await getVenueListings());
      const requested = venues.find(venue => venue.slug === requestedVenueSlug);
      const owned = venues.find(venue => venue.id === poster.venue_id || venue.slug === poster.venue_id);
      if (poster.poster_type === "venue") {
        if (!owned) return NextResponse.json({ error: "Your posting access is not linked to a public venue." }, { status: 403 });
        if (requestedVenueSlug && requested?.slug !== owned.slug) return NextResponse.json({ error: "You cannot post as a different venue." }, { status: 403 });
        venueSlug = owned.slug;
        venueName = owned.venueName;
        neighborhood = owned.neighborhood;
      } else if (requested) {
        // An unverified reference may link to an event page, but must not be treated as a verified venue post.
        venueSlug = requested.slug;
        venueName = requested.venueName;
        neighborhood = requested.neighborhood;
      } else if (requestedVenueSlug) {
        return NextResponse.json({ error: "The selected venue is not in the canonical Venue Index." }, { status: 400 });
      }
    }
    if (requestedHostId || poster.poster_type === "kj") {
      const hosts = await getActiveHosts({ includeMedia: false });
      const requested = hosts.find(host => host.hostId === requestedHostId);
      const owned = hosts.find(host => host.hostId === poster.host_id);
      if (poster.poster_type === "kj") {
        if (!owned) return NextResponse.json({ error: "Your posting access is not linked to a confirmed KJ." }, { status: 403 });
        if (requestedHostId && requested?.hostId !== owned.hostId) return NextResponse.json({ error: "You cannot post as another KJ." }, { status: 403 });
        hostId = owned.hostId;
        hostName = owned.publicDisplayName;
      } else if (poster.poster_type === "admin" && requested) {
        hostId = requested.hostId;
        hostName = requested.publicDisplayName;
      } else if (requestedHostId && !requested) {
        return NextResponse.json({ error: "The selected host is not in the canonical Host Index." }, { status: 400 });
      }
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;
    let noteText: string | undefined;
    let noteColor: SingBoardNoteColor | undefined;
    if (postType === "image") {
      const file = form.get("file");
      if (!(file instanceof File) || !["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024 || file.size < 1) {
        return NextResponse.json({ error: "Upload a JPG, PNG, or WebP under 10 MB." }, { status: 400 });
      }
      const upload = await uploadSingBoardImage(file);
      imageUrl = upload.imageUrl;
      imagePublicId = upload.publicId;
    } else {
      noteText = required(form, "noteText").slice(0, postType === "wanted" ? 220 : 280);
      if (postType === "note") {
        noteColor = (field(form, "noteColor") || "yellow") as SingBoardNoteColor;
        if (!ALLOWED_NOTE_COLORS.has(noteColor)) return NextResponse.json({ error: "Invalid note color." }, { status: 400 });
      }
    }

    const id = await createSingBoardPost({
      posterId: poster.id, postType, title: required(form, "title").slice(0,160),
      venueName, neighborhood, region, detail: field(form, "detail").slice(0,1200),
      eventDate, startTime: field(form, "startTime").slice(0,80) || undefined,
      hostName: hostName || undefined, linkUrl: linkUrl || undefined,
      venueSlug, hostId, category,
      reviewStatus: poster.poster_type === "admin" ? "verified" : "pending",
      imageUrl, imagePublicId, noteText, noteColor,
      ...placement,
    });
    return NextResponse.json({ id, imageUrl, venueSlug, hostId }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to publish post." }, { status: 400 });
  }
}
