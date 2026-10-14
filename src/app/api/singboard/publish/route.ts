import { NextResponse } from "next/server";
import { getVenueListings } from "@/lib/venueData";
import { uploadSingBoardImage } from "@/lib/singboard/cloudinary";
import { findSingBoardSlot, isSingBoardSlotOccupied } from "@/lib/singboard/layout";
import {
  createSingBoardPost,
  getActiveSingBoardFlyers,
  getAuthorizedSingBoardPoster,
  getAuthorizedSingBoardPosterForToken,
  type SingBoardNoteColor,
  type SingBoardPostType,
  type SingBoardRegion,
} from "@/lib/singboard/repository";

export const runtime = "nodejs";

const ALLOWED_REGIONS = new Set<SingBoardRegion>(["east-county","central","beach","downtown","south-bay","north-county"]);
const ALLOWED_TYPES = new Set<SingBoardPostType>(["image", "note", "wanted"]);
const ALLOWED_CATEGORIES = new Set(["special","theme_karaoke","hiring","community","live_music"]);
const ALLOWED_NOTE_COLORS = new Set<SingBoardNoteColor>(["yellow", "pink", "blue", "green", "white"]);

function requiredText(form: FormData, key: string) {
  const value = String(form.get(key) || "").trim();
  if (!value) throw new Error(`${key} is required.`);
  return value;
}
function numberField(form: FormData, key: string, min: number, max: number) {
  const value = Number(form.get(key));
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${key} is invalid.`);
  return value;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    // Account access is granted by SingHUB admin to a verified venue/KJ profile.
    // Legacy single-poster access codes remain available during the transition.
    const bearer=request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1]||"";
    const code=String(form.get("accessCode")||"").trim();
    const poster=(bearer ? await getAuthorizedSingBoardPosterForToken(bearer) : null)
      || (code ? await getAuthorizedSingBoardPoster(code) : null);
    if (!poster) return NextResponse.json({ error: "Sign in with your verified venue/KJ account, or use your individual posting access code." }, { status: 403 });

    const postType = requiredText(form, "postType") as SingBoardPostType;
    if (!ALLOWED_TYPES.has(postType)) return NextResponse.json({ error: "Invalid post type." }, { status: 400 });
    const category=requiredText(form,"category");
    if(!ALLOWED_CATEGORIES.has(category))return NextResponse.json({error:"Choose an approved post category."},{status:400});
    if(postType==="wanted"&&category!=="hiring")return NextResponse.json({error:"Wanted/job posts must be categorized as Hiring."},{status:400});
    const region = requiredText(form, "region") as SingBoardRegion;
    if (!ALLOWED_REGIONS.has(region)) return NextResponse.json({ error: "Invalid SingBOARD region." }, { status: 400 });
    const eventDate = requiredText(form, "eventDate");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return NextResponse.json({ error: "Invalid event date." }, { status: 400 });

    const placement = {
      x: numberField(form, "x", 0, 100),
      y: numberField(form, "y", 0, 100),
      rotation: numberField(form, "rotation", -5, 5),
    };
    const slot = findSingBoardSlot(placement);
    if (!slot) return NextResponse.json({ error: "Choose one of the available flyer spaces." }, { status: 400 });

    const activePosts = await getActiveSingBoardFlyers();
    if (isSingBoardSlotOccupied(slot, activePosts)) {
      return NextResponse.json({ error: "That flyer space was just taken. Choose another one." }, { status: 409 });
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;
    let noteText: string | undefined;
    let noteColor: SingBoardNoteColor | undefined;

    if (postType === "image") {
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ error: "Image is required." }, { status: 400 });
      if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Upload must be an image." }, { status: 400 });
      if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 10 MB." }, { status: 400 });
      const upload = await uploadSingBoardImage(file);
      imageUrl = upload.imageUrl;
      imagePublicId = upload.publicId;
    } else if (postType === "note") {
      noteText = requiredText(form, "noteText").slice(0, 280);
      noteColor = requiredText(form, "noteColor") as SingBoardNoteColor;
      if (!ALLOWED_NOTE_COLORS.has(noteColor)) return NextResponse.json({ error: "Invalid note color." }, { status: 400 });
    } else {
      noteText = requiredText(form, "noteText").slice(0, 220);
    }

    // A venue poster cannot impersonate another venue by editing the public form.
    const venues=poster.venue_id?await getVenueListings():[];
    const boundVenue=poster.venue_id?venues.find(v=>v.id===poster.venue_id||v.slug===poster.venue_id):undefined;
    if(poster.poster_type==="venue"&&!boundVenue)return NextResponse.json({error:"This contributor's venue must be linked to a verified Venue Index ID before posting."},{status:403});
    const venueName=boundVenue?.venueName||requiredText(form,"venueName");
    const neighborhood=boundVenue?.neighborhood||requiredText(form,"neighborhood");
    const id = await createSingBoardPost({
      posterId: poster.id,
      postType,
      category:category as "special"|"theme_karaoke"|"hiring"|"community"|"live_music",
      venueId:boundVenue?.id,
      hostId:poster.host_id||undefined,
      title: requiredText(form, "title"),
      venueName,
      neighborhood,
      region,
      detail: String(form.get("detail") || "").trim(),
      imageUrl,
      imagePublicId,
      noteText,
      noteColor,
      eventDate,
      startTime: String(form.get("startTime") || "").trim() || undefined,
      hostName: String(form.get("hostName") || "").trim() || undefined,
      linkUrl: String(form.get("linkUrl") || "").trim() || undefined,
      x: placement.x,
      y: placement.y,
      rotation: placement.rotation,
    });

    return NextResponse.json({ id, imageUrl, venueName, neighborhood, category, status:"pending_verification" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to publish post." }, { status: 400 });
  }
}
