import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { getVenueListings } from "@/lib/venueData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Venue Activity | SingHUB Admin", robots: { index: false, follow: false } };

type Performance = { user_id: string; venue_slug: string | null; venue_name: string | null; performed_on: string };
type TourStop = { user_id: string; venue_slug: string; venue_name: string; nightlife_date: string; method: string; status: string };
type Checkin = { user_id: string; venue_slug: string; venue_name: string; checked_in_on: string; method: string };
type Alias = { user_id: string; karaoke_alias: string | null };
type Entry = { slug: string; name: string; neighborhood: string; city: string; known: boolean;
  stars: number; tourVisits: number; pendingVisits: number; gpsTours: number; reportedTours: number;
  checkins: number; gpsCheckins: number; reportedCheckins: number; singers: Set<string>;
  activityBySinger: Map<string, { stars: number; tours: number; checkins: number }> };
const maxRows = 2000;
function aggregateKey(slug: string | null | undefined, fallback: string | null | undefined) {
  if (slug?.trim()) return slug.trim().toLowerCase();
  return "unmatched:" + (fallback?.trim().toLowerCase() || "unknown");
}
function localDateToday() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find(item => item.type === type)?.value || "";
  return part("year") + "-" + part("month") + "-" + part("day");
}
function daysAgo(days: number) {
  const local = localDateToday();
  const d = new Date(local + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}
export default async function VenueActivityPage({ searchParams }: {
  searchParams: Promise<{ q?: string; period?: string; sort?: string }>;
}) {
  await requireAdminAuthorization();
  const params = await searchParams;
  const q = String(params.q || "").trim().toLowerCase().slice(0, 120);
  const period = params.period === "all" ? "all" : "30";
  const since = period === "30" ? daysAgo(29) : "";
  const sort = ["stars", "tours", "checkins", "singers", "name"].includes(params.sort || "") ? params.sort : "stars";
  const db = createAdminClient();
  const [venues, performanceResult, toursResult, checkinsResult, aliasesResult] = await Promise.all([
    getVenueListings(),
    db.from("singer_performances").select("user_id,venue_slug,venue_name,performed_on", { count: "exact" }).order("created_at", { ascending: false }).limit(maxRows),
    db.from("singer_venue_visits").select("user_id,venue_slug,venue_name,nightlife_date,method,status", { count: "exact" }).order("created_at", { ascending: false }).limit(maxRows),
    db.from("singer_venue_checkins").select("user_id,venue_slug,venue_name,checked_in_on,method", { count: "exact" }).order("checked_in_at", { ascending: false }).limit(maxRows),
    db.from("singer_profiles").select("user_id,karaoke_alias", { count: "exact" }).limit(maxRows),
  ]);
  const errors = [
    performanceResult.error?.message, toursResult.error?.message,
    checkinsResult.error?.message, aliasesResult.error?.message,
  ].filter(Boolean);
  if (errors.length) return <main className="mx-auto max-w-5xl px-4 py-10 text-white">
    <Link href="/admin" className="text-cyan-200">← Admin Tools</Link>
    <h1 className="mt-5 text-4xl font-black">Venue Activity</h1>
    <p role="alert" className="mt-5 rounded-xl border border-rose-400/30 bg-rose-950/25 p-5 text-rose-200">Could not load the complete report: {errors.join("; ")}</p>
  </main>;
  const truncated = [performanceResult,toursResult,checkinsResult,aliasesResult].some(result => (result.count || 0) > maxRows);
  const aliases = new Map(((aliasesResult.data || []) as Alias[]).map(row => [row.user_id, row.karaoke_alias?.trim() || "Alias not set"]));
  const map = new Map<string, Entry>();
  for (const venue of venues) {
    map.set(venue.slug.toLowerCase(), { slug: venue.slug, name: venue.venueName,
      neighborhood: venue.neighborhood || "", city: venue.city || "", known: true,
      stars: 0, tourVisits: 0, pendingVisits: 0, gpsTours: 0, reportedTours: 0,
      checkins: 0, gpsCheckins: 0, reportedCheckins: 0, singers: new Set(),
      activityBySinger: new Map() });
  }
  function entry(slug: string | null | undefined, name: string | null | undefined) {
    const key = aggregateKey(slug, name);
    const existing = map.get(key);
    if (existing) return existing;
    const created: Entry = { slug: slug || key, name: name || "Unmatched venue", neighborhood: "",
      city: "", known: false, stars: 0, tourVisits: 0, pendingVisits: 0,
      gpsTours: 0, reportedTours: 0, checkins: 0, gpsCheckins: 0, reportedCheckins: 0,
      singers: new Set(), activityBySinger: new Map() };
    map.set(key, created);
    return created;
  }
  function singer(row: Entry, userId: string) {
    row.singers.add(userId);
    let item = row.activityBySinger.get(userId);
    if (!item) { item = { stars: 0, tours: 0, checkins: 0 }; row.activityBySinger.set(userId, item); }
    return item;
  }
  for (const p of (performanceResult.data || []) as Performance[]) {
    if (since && p.performed_on < since) continue;
    const row = entry(p.venue_slug,p.venue_name); row.stars++; singer(row,p.user_id).stars++;
  }
  for (const t of (toursResult.data || []) as TourStop[]) {
    if (since && t.nightlife_date < since) continue;
    const row = entry(t.venue_slug,t.venue_name);
    if (t.status !== "confirmed") { row.pendingVisits++; continue; }
    row.tourVisits++; singer(row,t.user_id).tours++;
    if (t.method === "location_matched") row.gpsTours++;
    if (t.method === "self_reported") row.reportedTours++;
  }
  for (const c of (checkinsResult.data || []) as Checkin[]) {
    if (since && c.checked_in_on < since) continue;
    const row = entry(c.venue_slug,c.venue_name); row.checkins++; singer(row,c.user_id).checkins++;
    if (c.method === "location_matched") row.gpsCheckins++;
    if (c.method === "self_reported") row.reportedCheckins++;
  }
  const all = [...map.values()];
  const active = all.filter(row => row.stars || row.tourVisits || row.checkins || row.pendingVisits);
  const totals = active.reduce((acc,row) => {
    acc.stars+=row.stars;acc.tours+=row.tourVisits;acc.checkins+=row.checkins;
    row.singers.forEach(id=>acc.singers.add(id));return acc;
  },{ stars:0,tours:0,checkins:0,singers:new Set<string>() });
  const visible = all.filter(row => {
    const hit = [row.name,row.neighborhood,row.city,row.slug].some(value => value.toLowerCase().includes(q));
    return hit && (q !== "" || row.stars + row.tourVisits + row.checkins + row.pendingVisits > 0);
  }).sort((a,b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    const score = (row:Entry) => sort==="tours"?row.tourVisits:sort==="checkins"?row.checkins:sort==="singers"?row.singers.size:row.stars;
    return score(b)-score(a) || b.stars-a.stars || a.name.localeCompare(b.name);
  });
  const th="px-4 py-3 text-left text-[11px] font-black uppercase tracking-[.12em] text-slate-400";
  const td="px-4 py-4 align-top text-sm text-slate-200";
  return <main className="mx-auto max-w-7xl px-4 py-10 text-white">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin" className="text-sm font-bold text-cyan-200">← Admin Tools</Link>
      <span className="rounded-full border border-fuchsia-300/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-fuchsia-200">Private · Admin only</span>
    </div>
    <header className="mt-7">
      <p className="text-xs font-black uppercase tracking-[.25em] text-fuchsia-300">Venue engagement</p>
      <h1 className="mt-2 text-4xl font-black md:text-5xl">Venue Activity</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
        Which karaoke rooms are generating saved performances, Tour Stop visits, and venue check-ins?
        Reported activity, not independently verified attendance. Totals are based on the date of the activity.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/admin/singers" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-cyan-200">Singer Activity →</Link>
        <Link href="/admin/light-up-venues" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-cyan-200">Edit venue profiles →</Link>
      </div>
    </header>
    {truncated && <p role="alert" className="mt-5 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">Data source row cap reached (2,000). Displayed totals may be incomplete.</p>}
    <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {[
        ["Performance Stars",totals.stars],["Tour Stop visits",totals.tours],
        ["Venue check-ins",totals.checkins],["Participating singers",totals.singers.size],
        ["Venues with activity",active.length],
      ].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-white/10 bg-slate-950/80 p-5">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
        <strong className="mt-2 block text-4xl font-black">{value}</strong>
      </div>)}
    </section>
    <form action="/admin/venue-activity" method="get" className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4">
      <label className="grid min-w-[200px] flex-1 gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">Venue search
        <input name="q" type="search" defaultValue={params.q || ""} placeholder="Venue, neighborhood or city"
          className="h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-sm font-normal normal-case tracking-normal text-white"/>
      </label>
      <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">Period
        <select name="period" defaultValue={period} className="h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-sm text-white">
          <option value="30">Past 30 days</option><option value="all">All time</option>
        </select>
      </label>
      <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">Sort
        <select name="sort" defaultValue={sort} className="h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-sm text-white">
          <option value="stars">Most stars</option><option value="tours">Most Tour Stop visits</option>
          <option value="checkins">Most check-ins</option><option value="singers">Most singers</option>
          <option value="name">Venue name</option>
        </select>
      </label>
      <button className="h-11 rounded-xl bg-cyan-300 px-5 text-sm font-black text-slate-950">Apply</button>
    </form>
    <p className="mt-3 text-xs text-slate-400">{visible.length} venue records shown. With no search, only venues with activity are shown.</p>
    <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[930px] border-collapse">
        <thead className="bg-white/[.06]"><tr>
          <th className={th}>Venue</th><th className={th}>Stars</th><th className={th}>Tour Stops</th>
          <th className={th}>Check-ins</th><th className={th}>Singers</th><th className={th}>Admin actions</th>
        </tr></thead>
        <tbody>{visible.map(row=><tr key={row.slug} className="border-t border-white/10">
          <td className={td}><strong className="text-base text-white">{row.name}</strong>
            <span className="mt-1 block text-xs text-slate-400">{row.neighborhood || row.city || (row.known?"Other area":"Unmatched slug: "+row.slug)}</span>
            {!row.known&&<span className="mt-1 block text-xs text-amber-200">Not matched to current Venue Index</span>}
          </td>
          <td className={td}><strong className="text-xl text-amber-200">{row.stars}</strong></td>
          <td className={td}><strong className="text-xl text-cyan-200">{row.tourVisits}</strong>
            <span className="block text-xs text-slate-500">{row.gpsTours} location matched · {row.reportedTours} self-reported</span>
            {row.pendingVisits>0&&<span className="block text-xs text-amber-200">{row.pendingVisits} pending</span>}
          </td>
          <td className={td}><strong className="text-xl">{row.checkins}</strong>
            <span className="block text-xs text-slate-500">{row.gpsCheckins} location matched · {row.reportedCheckins} self-reported</span>
          </td>
          <td className={td}>{row.singers.size}</td>
          <td className={td}>
            <div className="flex flex-wrap gap-2">
              {row.known&&<Link href={`/admin/light-up-venues?venue=${encodeURIComponent(row.slug)}`} className="text-xs font-bold text-cyan-200 hover:underline">Edit profile ↗</Link>}
              {row.known&&<Link href={`/venues/${row.slug}`} className="text-xs font-bold text-slate-300 hover:underline">Public page ↗</Link>}
            </div>
            <details className="mt-3"><summary className="cursor-pointer text-xs font-bold text-fuchsia-200">Singer breakdown</summary>
              <div className="mt-2 min-w-[190px] space-y-2 rounded-xl border border-white/10 bg-slate-950 p-3">
                {[...row.activityBySinger].map(([id,stats])=><div key={id} className="border-b border-white/10 pb-2 text-xs last:border-0">
                  <Link href={`/admin/singers?q=${encodeURIComponent(aliases.get(id)||id)}`} className="font-bold text-cyan-200">{aliases.get(id)||"No alias"}</Link>
                  <span className="block text-slate-400">{stats.stars} stars · {stats.tours} Tour Stops · {stats.checkins} check-ins</span>
                </div>)}
                {!row.activityBySinger.size && <p className="text-xs text-slate-500">No singer activity recorded.</p>}
              </div>
            </details>
          </td>
        </tr>)}</tbody>
      </table>
      {!visible.length&&<p className="p-6 text-sm text-slate-400">No activity for this selection.</p>}
    </div>
    <p className="mt-5 text-xs leading-6 text-slate-400">
      Tour Stops marked confirmed can be location-matched or self-reported. Counts represent visits, so one
      singer may collect multiple visits at the same venue. Check-ins are a separate action, not additional
      Tour Stops. This dashboard is internal; public engagement statistics require their own privacy review.
    </p>
  </main>;
}
