import { NextResponse } from "next/server";
import { authenticatedSinger } from "@/lib/achievements/auth.server";

export const dynamic = "force-dynamic";

/** Private feed for My SingHUB: only the authenticated account's awards/QR. */
export async function GET(request: Request) {
  try {
    const auth = await authenticatedSinger(request);
    if (!auth) return NextResponse.json({ error: "Sign in to My SingHUB." }, { status: 401 });
    const { admin, user } = auth;
    let { data: profile, error: profileError } = await admin
      .from("singer_profiles")
      .select("karaoke_alias,nomination_token")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) {
      const inserted = await admin.from("singer_profiles")
        .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true })
        .select("karaoke_alias,nomination_token")
        .maybeSingle();
      if (inserted.error) throw inserted.error;
      profile = inserted.data;
      if (!profile) {
        const retried = await admin.from("singer_profiles")
          .select("karaoke_alias,nomination_token").eq("user_id",user.id).single();
        if (retried.error) throw retried.error;
        profile = retried.data;
      }
    }
    const [awards, events] = await Promise.all([
      admin.from("singer_achievements")
        .select("badge_key,badge_name,level,award_source,awarded_at,updated_at")
        .eq("user_id",user.id).order("awarded_at",{ ascending:false }),
      admin.from("singer_achievement_events")
        .select("id,badge_key,badge_level,event_kind,awarded_at")
        .eq("user_id",user.id).order("awarded_at",{ ascending:false }).limit(25),
    ]);
    if (awards.error) throw awards.error;
    if (events.error) throw events.error;
    return NextResponse.json({
      awards: awards.data || [],
      events: events.data || [],
      nominationUrl: profile?.karaoke_alias?.trim() && profile.nomination_token
        ? new URL("/nominate/" + profile.nomination_token, request.url).toString()
        : null,
      aliasReady: Boolean(profile?.karaoke_alias?.trim()),
    },{headers:{"Cache-Control":"private, no-store"}});
  } catch(error) {
    console.error("Achievement account load failed", error);
    return NextResponse.json({error:"Achievements are temporarily unavailable."},{status:503});
  }
}
