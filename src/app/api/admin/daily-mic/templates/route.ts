import { NextResponse } from "next/server";
import { isDailyMicCategory, uploadDailyMicTemplate } from "@/lib/dailyMicCloudinary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const category = String(form.get("category") || "");
    const file = form.get("file");
    if (!isDailyMicCategory(category)) {
      return NextResponse.json({ error: "Unknown Daily Mic category." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Template image is required." }, { status: 400 });
    }

    const uploaded = await uploadDailyMicTemplate(file, category);
    return NextResponse.json({ ok: true, category, ...uploaded });
  } catch (error) {
    console.error("Daily Mic template upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Template upload failed." },
      { status: 500 },
    );
  }
}
