import Link from "next/link";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { createAdminClient } from "@/lib/supabase/admin";
import { FOUNDING_ACHIEVEMENTS, ACHIEVEMENT_BY_KEY, isNominationBadge } from "@/lib/achievements/catalog";
import { AchievementModeration, type NominationGroup } from "@/components/admin/AchievementModeration";

export const dynamic = "force-dynamic";
export const metadata = { title: "Achievements | SingHUB Admin", robots: { index: false, follow: false } };

type Nomination = {
  recipient_user_id: string; nominator_user_id: string; badge_key: string;
  nightlife_date: string; venue_slug: string; reason: string;
};
type Profile = { user_id: string; karaoke_alias: string | null };
export default async function AchievementAdminPage() {
  await requireAdminAuthorization();
  const db = createAdminClient();
  const [nomResult,profileResult,awardResult] = await Promise.all([
    db.from("achievement_nominations")
      .select("recipient_user_id,nominator_user_id,badge_key,nightlife_date,venue_slug,reason", { count:"exact" })
      .eq("status","pending").order("created_at",{ascending:false}).limit(500),
    db.from("singer_profiles").select("user_id,karaoke_alias").limit(2000),
    db.from("singer_achievements").select("badge_key").limit(2000),
  ]);
  const failures = [nomResult.error?.message,profileResult.error?.message,awardResult.error?.message].filter(Boolean);
  if (failures.length) return <main className="mx-auto max-w-5xl px-4 py-10 text-white">
    <Link href="/admin" className="text-cyan-200">← Admin Tools</Link>
    <h1 className="mt-6 text-4xl font-black">Achievements</h1>
    <p role="alert" className="mt-5 rounded-xl border border-rose-300/30 p-5 text-rose-100">Unable to load complete report: {failures.join("; ")}</p>
  </main>;
  const alias = new Map(((profileResult.data||[]) as Profile[]).map(row=>[row.user_id,row.karaoke_alias?.trim()||"Alias not set"]));
  const groups = new Map<string,NominationGroup & { voterIds:Set<string> }>();
  for (const item of (nomResult.data||[]) as Nomination[]) {
    if (!isNominationBadge(item.badge_key)) continue;
    const key = [item.recipient_user_id,item.badge_key,item.nightlife_date,item.venue_slug].join(":");
    let group = groups.get(key);
    if (!group) {
      group = {recipientUserId:item.recipient_user_id,alias:alias.get(item.recipient_user_id)||"Alias not set",
        badgeKey:item.badge_key,badgeName:ACHIEVEMENT_BY_KEY[item.badge_key].name,
        nightlifeDate:item.nightlife_date,venueSlug:item.venue_slug,nominators:0,
        notes:[],voterIds:new Set()};
      groups.set(key,group);
    }
    group.voterIds.add(item.nominator_user_id);
    group.nominators=group.voterIds.size;
    group.notes.push(item.reason);
  }
  const cards=[...groups.values()].sort((a,b)=>b.nominators-a.nominators||b.nightlifeDate.localeCompare(a.nightlifeDate));
  const incomplete=(nomResult.count||0)>500 || (profileResult.data||[]).length>=2000 || (awardResult.data||[]).length>=2000;
  return <main className="mx-auto max-w-6xl px-4 py-10 text-white">
    <Link href="/admin" className="text-sm font-bold text-cyan-200">← Admin Tools</Link>
    <p className="mt-8 text-xs font-black uppercase tracking-[.2em] text-fuchsia-300">My SingHUB · Pilot</p>
    <h1 className="mt-2 text-4xl font-black">Achievement Control</h1>
    <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
      Six milestones award automatically from singer records. Two audience-participation patches
      require independent community nominations and admin approval. No KJ is obligated to verify a performance.
    </p>
    <section className="mt-7 grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-white/10 p-4"><span className="text-xs text-slate-400">Achievements defined</span><strong className="mt-1 block text-3xl">8</strong></div>
      <div className="rounded-xl border border-white/10 p-4"><span className="text-xs text-slate-400">Award records</span><strong className="mt-1 block text-3xl">{awardResult.data?.length||0}</strong></div>
      <div className="rounded-xl border border-white/10 p-4"><span className="text-xs text-slate-400">Pending nominations</span><strong className="mt-1 block text-3xl">{nomResult.count||0}</strong></div>
    </section>
    {incomplete&&<p role="alert" className="mt-5 rounded-xl border border-amber-300/30 p-4 text-sm text-amber-100">The report reached a row limit; figures may be incomplete. Expand pagination before handling a large campaign.</p>}
    <h2 className="mt-9 text-2xl font-black">Community approval queue</h2>
    <p className="mt-2 text-sm text-slate-400">Approvals require at least three different signed-in people nominating the same recipient, badge, venue and nightlife date. Reasons are private to admin.</p>
    <AchievementModeration groups={cards}/>
    <h2 className="mt-10 text-2xl font-black">Locked founding catalog</h2>
    <section className="mt-4 grid gap-3 md:grid-cols-2">
      {FOUNDING_ACHIEVEMENTS.map(item=><article key={item.key} className="rounded-xl border border-white/10 bg-white/[.03] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">{item.kind}</p>
        <h3 className="mt-2 text-lg font-black">{item.name}</h3>
        <p className="mt-2 text-sm text-slate-300">I · {item.levelOne}</p>
        {item.levelTwo&&<p className="mt-1 text-sm text-cyan-200">II · {item.levelTwo} (neon-pink frame)</p>}
        <p className="mt-2 text-xs text-slate-500">{item.evidence}</p>
      </article>)}
    </section>
    <p className="mt-6 text-xs text-slate-400">Self-reported activity is not independent venue verification. Achievement patch images remain concept artwork pending brand sign-off.</p>
  </main>;
}
