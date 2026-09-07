import { NextResponse } from "next/server";
import { dailyMicDeliveryUrl, isDailyMicCategory } from "@/lib/dailyMicCloudinary";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ category: string }> },
) {
  const { category } = await context.params;
  if (!isDailyMicCategory(category)) {
    return NextResponse.json({ error: "Unknown template." }, { status: 404 });
  }

  try {
    const response = await fetch(dailyMicDeliveryUrl(category), {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Template master has not been uploaded yet." },
        { status: response.status === 404 ? 404 : 502 },
      );
    }
    const bytes = await response.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "content-type": response.headers.get("content-type") || "image/webp",
        "cache-control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Daily Mic template proxy failed", error);
    return NextResponse.json({ error: "Template could not be loaded." }, { status: 502 });
  }
}
