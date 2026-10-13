import { NextResponse } from "next/server";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { createAdminClient } from "@/lib/supabase/admin";
import { isNominationBadge } from "@/lib/achievements/catalog";
import { isSameOrigin, isUuid } from "@/lib/achievements/auth.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Cross-site changes blocked." }, { status: 403 });
  try {
    await requireAdminAuthorization();
    const raw = await request.text();
    if (raw.length > 1800) return NextResponse.json({ error: "Invalid review request." }, { status: 400 });
    const body = JSON.parse(raw) as {
      recipientUserId?: unknown; badgeKey?: unknown; nightlifeDate?: unknown;
      venueSlug?: unknown; action?: unknown;
    };
    if (!isUuid(body.recipientUserId) || !isNominationBadge(body.badgeKey)
      || typeof body.nightlifeDate !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(body.nightlifeDate)
      || typeof body.venueSlug !== "string" || !/^[a-z0-9-]{2,120}$/.test(body.venueSlug)
      || (body.action !== "approve" && body.action !== "reject")) {
      return NextResponse.json({ error: "Invalid nomination group." }, { status: 400 });
    }
    const db = createAdminClient();
    const filter = {
      recipient_user_id: body.recipientUserId,
      badge_key: body.badgeKey,
      nightlife_date: body.nightlifeDate,
      venue_slug: body.venueSlug,
    };
    const pending = await db.from("achievement_nominations")
      .select("id,nominator_user_id")
      .match(filter).eq("status","pending");
    if (pending.error) throw pending.error;
    const uniqueNominators = new Set((pending.data||[]).map(row => row.nominator_user_id));
    if (!pending.data?.length) return NextResponse.json({ error: "No pending nominations remain." }, { status: 409 });
    if (body.action === "approve" && uniqueNominators.size < 3) {
      return NextResponse.json({ error: "Three distinct nominators are required before approval." }, { status: 409 });
    }
    // One database transaction checks quorum, inserts award/reveal, and updates
    // nomination states. No half-awarded patches if an operation fails.
    const result = await db.rpc("review_singer_achievement_nominations",{
      p_recipient_user_id:body.recipientUserId,
      p_badge_key:body.badgeKey,
      p_nightlife_date:body.nightlifeDate,
      p_venue_slug:body.venueSlug,
      p_action:body.action,
    });
    if (result.error) {
      if (/No pending nominations|independent nominators/i.test(result.error.message)) {
        return NextResponse.json({error:result.error.message},{status:409});
      }
      throw result.error;
    }
    const processed = Number(result.data?.[0]?.processed || 0);
    const newlyAwarded = result.data?.[0]?.newly_awarded === true;
    return NextResponse.json({
      saved:true,action:body.action,processed,newlyAwarded,
      message:body.action === "approve" ? "Community achievement awarded." : "Nomination group rejected.",
    },{headers:{"Cache-Control":"private, no-store"}});
  } catch(error) {
    console.error("Achievement review failed",error);
    return NextResponse.json({error:"Could not review nominations. Check the admin logs."},{status:503});
  }
}
