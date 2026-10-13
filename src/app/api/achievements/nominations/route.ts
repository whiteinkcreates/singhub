import { NextResponse } from "next/server";
import { authenticatedSinger, isSameOrigin, isUuid } from "@/lib/achievements/auth.server";
import { isNominationBadge } from "@/lib/achievements/catalog";
import { getVenueListings } from "@/lib/venueData";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { nightlifeDate } from "@/lib/tourStops";

export const dynamic = "force-dynamic";

/** Community nominations. Nominators must be confirmed SingHUB accounts.
 * A nomination NEVER directly awards a patch; admins review qualifying groups.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Cross-site nominations are blocked." }, { status: 403 });
  try {
    const auth = await authenticatedSinger(request);
    if (!auth) return NextResponse.json({ error: "Sign in and verify your email to nominate." }, { status: 401 });
    const raw = await request.text();
    if (raw.length > 1600) return NextResponse.json({ error: "Nomination is too long." }, { status: 400 });
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch {
      return NextResponse.json({ error: "Invalid nomination." }, { status: 400 });
    }
    if (!payload || typeof payload !== "object") return NextResponse.json({ error: "Invalid nomination." }, { status: 400 });
    const body = payload as Record<string,unknown>;
    const token = body.token;
    const badgeKey = body.badgeKey;
    const venueSlug = typeof body.venueSlug === "string" ? body.venueSlug.trim() : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!isUuid(token) || !isNominationBadge(badgeKey) || !/^[a-z0-9-]{2,120}$/.test(venueSlug)
      || reason.length < 10 || reason.length > 280) {
      return NextResponse.json({ error: "Choose an award and karaoke venue, then describe what happened (10–280 characters)." }, { status: 400 });
    }
    const venue = getPublicVenues(await getVenueListings()).find(v => v.slug === venueSlug);
    if (!venue) return NextResponse.json({ error: "Choose a listed karaoke venue." }, { status: 400 });
    const { admin,user } = auth;
    const nominee = await admin.from("singer_profiles")
      .select("user_id,karaoke_alias").eq("nomination_token", token).maybeSingle();
    if (nominee.error) throw nominee.error;
    if (!nominee.data?.user_id || !nominee.data.karaoke_alias?.trim()) {
      return NextResponse.json({ error: "This nomination link is no longer available." }, { status: 404 });
    }
    if (nominee.data.user_id === user.id) {
      return NextResponse.json({ error: "You can't nominate your own account." }, { status: 400 });
    }
    const night = nightlifeDate();
    const existing = await admin.from("achievement_nominations")
      .select("id", { count: "exact", head: true })
      .eq("nominator_user_id", user.id).eq("nightlife_date", night);
    if (existing.error) throw existing.error;
    if ((existing.count || 0) >= 5) {
      return NextResponse.json({ error: "You've reached the five-nomination daily limit." }, { status: 429 });
    }
    const inserted = await admin.from("achievement_nominations").insert({
      recipient_user_id: nominee.data.user_id,
      nominator_user_id: user.id,
      badge_key: badgeKey,
      venue_slug: venueSlug,
      nightlife_date: night,
      reason,
    });
    if (inserted.error?.code === "23505") {
      return NextResponse.json({ error: "You've already nominated this person for that achievement tonight." }, { status: 409 });
    }
    if (inserted.error) throw inserted.error;
    return NextResponse.json({
      saved: true,
      message: "Nomination received! SingHUB reviews qualifying community awards. No patch has been awarded yet.",
    }, {headers:{"Cache-Control":"private, no-store"}});
  } catch (error) {
    console.error("Achievement nomination failed",error);
    return NextResponse.json({ error: "Nomination could not be saved. Please try again." }, { status: 503 });
  }
}
