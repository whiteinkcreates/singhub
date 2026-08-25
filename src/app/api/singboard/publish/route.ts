import { NextResponse } from "next/server";
import { uploadSingBoardImage } from "@/lib/singboard/cloudinary";
import {
  createSingBoardFlyer,
  getAuthorizedSingBoardPoster,
  type SingBoardRegion,
} from "@/lib/singboard/repository";

export const runtime = "nodejs";

const ALLOWED_REGIONS = new Set<SingBoardRegion>([
  "east-county",
  "central",
  "beach",
  "downtown",
  "south-bay",
  "north-county",
]);

function requiredText(form: FormData, key: string) {
  const value = String(form.get(key) || "").trim();
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

function numberField(form: FormData, key: string, min: number, max: number) {
  const value = Number(form.get(key));
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${key} is invalid.`);
  }
  return value;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const accessCode = requiredText(form, "accessCode");
    const poster = await getAuthorizedSingBoardPoster(accessCode);
    if (!poster) return NextResponse.json({ error: "Invalid or inactive SingBOARD access code." }, { status: 403 });

    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Flyer image is required." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Flyer must be an image." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Flyer image must be under 10 MB." }, { status: 400 });

    const region = requiredText(form, "region") as SingBoardRegion;
    if (!ALLOWED_REGIONS.has(region)) return NextResponse.json({ error: "Invalid SingBOARD region." }, { status: 400 });

    const eventDate = requiredText(form, "eventDate");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return NextResponse.json({ error: "Invalid event date." }, { status: 400 });

    const upload = await uploadSingBoardImage(file);
    const id = await createSingBoardFlyer({
      posterId: poster.id,
      title: requiredText(form, "title"),
      venueName: requiredText(form, "venueName"),
      neighborhood: requiredText(form, "neighborhood"),
      region,
      detail: String(form.get("detail") || "").trim(),
      imageUrl: upload.imageUrl,
      imagePublicId: upload.publicId,
      eventDate,
      x: numberField(form, "x", 0, 100),
      y: numberField(form, "y", 0, 100),
      rotation: numberField(form, "rotation", -5, 5),
    });

    return NextResponse.json({ id, imageUrl: upload.imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to publish flyer.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
