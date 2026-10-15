import { NextResponse } from "next/server";
import {getVenueListings} from "@/lib/venueData";
import {getActiveHosts} from "@/lib/hostData";
import {SINGBOARD_CATEGORY_KEYS, getSingBoardCategory} from "@/lib/singboard/categories";
import { uploadSingBoardImage } from "@/lib/singboard/cloudinary";
import { findSingBoardSlot, isSingBoardSlotOccupied } from "@/lib/singboard/layout";
import {
  createSingBoardPost,
  getActiveSingBoardFlyers,
  getAuthorizedSingBoardPoster,
  type SingBoardNoteColor,
  type SingBoardPostType,
  type SingBoardRegion,
} from "@/lib/singboard/repository";

export const runtime = "nodejs";

const ALLOWED_REGIONS = new Set<SingBoardRegion>(["east-county","central","beach","downtown","south-bay","north-county"]);
const ALLOWED_TYPES = new Set<SingBoardPostType>(["image", "note", "wanted"]);
const ALLOWED_NOTE_COLORS = new Set<SingBoardNoteColor>(["yellow", "pink", "blue", "green", "white"]);

function requiredText(form: FormData, key: string) {
  const value = String(form.get(key) || "").trim();
  if (!value) throw new Error(`${key} is required.`);
  return value;
}
function safeLink(raw:string):string|undefined {
  const value=raw.trim();
  if(!value)return undefined;
  if(value.startsWith("/") && !value.startsWith("//") && !value.includes("\\\\"))return value;
  try{
    const url=new URL(value);
    if((url.protocol==="https:"||url.protocol==="http:") && url.username==="" && url.password==="")return url.toString();
  }catch{}
  throw new Error("Link must be an https:// address or a safe SingHUB path.");
}
function numberField(form: FormData, key: string, min: number, max: number) {
  const value = Number(form.get(key));
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${key} is invalid.`);
  return value;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const accessCode = requiredText(form, "accessCode");
    const poster = await getAuthorizedSingBoardPoster(accessCode);
    if (!poster) return NextResponse.json({ error: "Invalid or inactive SingBOARD access code." }, { status: 403 });

    // Contributor authorization is verified server-side; form fields never supply an identity.
    const claimedVenueName = requiredText(form,"venueName");
    const posterType = poster.poster_type as "venue"|"kj"|"admin";
    const [listedVenues,activeHosts] = await Promise.all([
      poster.venue_id || posterType==="admin" ? getVenueListings() : Promise.resolve([]),
      poster.host_id ? getActiveHosts() : Promise.resolve([]),
    ]);
    const ownedVenue = poster.venue_id
      ? listedVenues.find(venue=>venue.id===poster.venue_id || venue.slug===poster.venue_id)
      : undefined;
    const ownedHost = poster.host_id
      ? activeHosts.find(host=>host.hostId===poster.host_id || host.slug===poster.host_id)
      : undefined;
    if(poster.venue_id && !ownedVenue)
      return NextResponse.json({error:"Posting identity is not linked to a valid venue. Ask SingHUB to reconnect your access."},{status:403});
    if(poster.host_id && !ownedHost)
      return NextResponse.json({error:"Posting identity is not linked to a valid KJ. Ask SingHUB to reconnect your access."},{status:403});
    if(posterType==="venue" && !ownedVenue)
      return NextResponse.json({error:"Please ask SingHUB to link your verified venue before self-publishing."},{status:403});

    // Administrator-authored legacy posts may link an exact canonical venue.
    // A KJ code that has not yet been bound to a host remains board-only.
    const adminVenue = posterType==="admin"
      ? listedVenues.find(venue=>venue.venueName.toLocaleLowerCase().trim()===claimedVenueName.toLocaleLowerCase().trim())
      : undefined;
    const venueSlug = ownedVenue?.slug || adminVenue?.slug;
    const venueName = ownedVenue?.venueName || claimedVenueName;
    const neighborhood = ownedVenue?.neighborhood || requiredText(form,"neighborhood");
    const hostName = ownedHost?.publicDisplayName || String(form.get("hostName")||"").trim() || undefined;

    const postType = requiredText(form, "postType") as SingBoardPostType;
    if (!ALLOWED_TYPES.has(postType)) return NextResponse.json({ error: "Invalid post type." }, { status: 400 });
    const rawCategory=String(form.get("category")||"");
    if(rawCategory && !SINGBOARD_CATEGORY_KEYS.includes(rawCategory as typeof SINGBOARD_CATEGORY_KEYS[number]))
      return NextResponse.json({error:"Invalid post category."},{status:400});
    const category = postType==="wanted" ? "hiring" : getSingBoardCategory(rawCategory,postType);
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

    const id = await createSingBoardPost({
      posterId: poster.id,
      postType,
      category,
      venueSlug,
      hostId:ownedHost?.hostId,
      title: requiredText(form, "title").slice(0,160),
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
      hostName,
      linkUrl: safeLink(String(form.get("linkUrl") || "")),
      x: placement.x,
      y: placement.y,
      rotation: placement.rotation,
    });

    return NextResponse.json({ id, imageUrl, category, reviewStatus:"pending", venueName, neighborhood, venueSlug, hostId:ownedHost?.hostId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to publish post." }, { status: 400 });
  }
}
