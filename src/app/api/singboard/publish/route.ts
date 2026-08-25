import { NextResponse } from "next/server";
import { uploadSingBoardImage } from "@/lib/singboard/cloudinary";
import {
  createSingBoardPost,
  getAuthorizedSingBoardPoster,
  type SingBoardNoteColor,
  type SingBoardPostType,
  type SingBoardRegion,
} from "@/lib/singboard/repository";

export const runtime = "nodejs";

const ALLOWED_REGIONS = new Set<SingBoardRegion>(["east-county","central","beach","downtown","south-bay","north-county"]);
const ALLOWED_TYPES = new Set<SingBoardPostType>(["image", "note"]);
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
    const accessCode = requiredText(form, "accessCode");
    const poster = await getAuthorizedSingBoardPoster(accessCode);
    if (!poster) return NextResponse.json({ error: "Invalid or inactive SingBOARD access code." }, { status: 403 });

    const postType = requiredText(form, "postType") as SingBoardPostType;
    if (!ALLOWED_TYPES.has(postType)) return NextResponse.json({ error: "Invalid post type." }, { status: 400 });
    const region = requiredText(form, "region") as SingBoardRegion;
    if (!ALLOWED_REGIONS.has(region)) return NextResponse.json({ error: "Invalid SingBOARD region." }, { status: 400 });
    const eventDate = requiredText(form, "eventDate");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return NextResponse.json({ error: "Invalid event date." }, { status: 400 });

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
    } else {
      noteText = requiredText(form, "noteText").slice(0, 280);
      noteColor = requiredText(form, "noteColor") as SingBoardNoteColor;
      if (!ALLOWED_NOTE_COLORS.has(noteColor)) return NextResponse.json({ error: "Invalid note color." }, { status: 400 });
    }

    const id = await createSingBoardPost({
      posterId: poster.id,
      postType,
      title: requiredText(form, "title"),
      venueName: requiredText(form, "venueName"),
      neighborhood: requiredText(form, "neighborhood"),
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
      x: numberField(form, "x", 0, 100),
      y: numberField(form, "y", 0, 100),
      rotation: numberField(form, "rotation", -5, 5),
    });

    return NextResponse.json({ id, imageUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to publish post." }, { status: 400 });
  }
}
