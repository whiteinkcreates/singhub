import { NextResponse } from "next/server";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACHIEVEMENT_BY_KEY, isNominationBadge } from "@/lib/achievements/catalog";
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
    if (body.action === "approve") {
      const current = await db.from("singer_achievements").select("level")
        .eq("user_id",body.recipientUserId).eq("badge_key",body.badgeKey).maybeSingle();
      if (current.error) throw current.error;
      if (!current.data) {
        const inserted = await db.from("singer_achievements").insert({
          user_id:body.recipientUserId, badge_key:body.badgeKey,
          badge_name:ACHIEVEMENT_BY_KEY[body.badgeKey].name,level:1,
          award_source:"community_review", award_note:"Approved after three independent community nominations.",
        });
        if (inserted.error?.code !== "23505" && inserted.error) throw inserted.error;
      }
      const event = await db.from("singer_achievement_events").insert({
        user_id:body.recipientUserId,badge_key:body.badgeKey,badge_level:1,
        event_kind:"unlocked",
      });
      if (event.error?.code !== "23505" && event.error) throw event.error;
    }
    const updated = await db.from("achievement_nominations")
      .update({status:body.action === "approve" ? "approved" : "rejected",reviewed_at:new Date().toISOString()})
      .match(filter).eq("status","pending").select("id");
    if (updated.error) throw updated.error;
    return NextResponse.json({
      saved:true,action:body.action,processed:updated.data?.length||0,
      message:body.action === "approve" ? "Community achievement awarded." : "Nomination group rejected.",
    },{headers:{"Cache-Control":"private, no-store"}});
  } catch(error) {
    console.error("Achievement review failed",error);
    return NextResponse.json({error:"Could not review nominations. Check the admin logs."},{status:503});
  }
}
