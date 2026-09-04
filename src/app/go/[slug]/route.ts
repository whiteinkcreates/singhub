import { NextResponse } from "next/server";
import { getGoLinkBySlug, recordGoLinkClick } from "@/lib/goLinks/repository";

export const dynamic = "force-dynamic";

const BOT_PATTERN = /bot|crawler|spider|preview|facebookexternalhit|facebot|twitterbot|slackbot|discordbot|linkedinbot|redditbot|telegrambot|whatsapp|googlebot|bingbot/i;

function redirectResponse(destination: URL) {
  const response = NextResponse.redirect(destination, 307);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const link = await getGoLinkBySlug(slug);

  if (!link) return new NextResponse("SingHUB link not found.", { status: 404 });

  if (link.status === "paused") {
    return redirectResponse(new URL("/", request.url));
  }

  const userAgent = request.headers.get("user-agent") || "";
  const referrer = request.headers.get("referer") || "";
  const isBot = BOT_PATTERN.test(userAgent);

  try {
    await recordGoLinkClick(link.id, { referrer, userAgent, isBot });
  } catch (error) {
    console.error("Unable to record SingHUB go-link click", error);
  }

  const destination = link.destination.startsWith("/")
    ? new URL(link.destination, request.url)
    : new URL(link.destination);

  return redirectResponse(destination);
}
