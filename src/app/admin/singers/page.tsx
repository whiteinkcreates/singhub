import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Singer Activity | SingHUB Admin",
  description: "Private singer activity and account diagnostics.",
  robots: { index: false, follow: false },
};

type SingerProfile = {
  user_id: string;
  karaoke_alias: string | null;
  created_at: string | null;
};
type MemberProfile = {
  user_id: string;
  email: string | null;
  created_at: string | null;
};
type Performance = {
  id: string;
  user_id: string;
  song_title: string;
  artist: string | null;
  venue_name: string | null;
  performed_on: string;
  created_at: string;
};
type TourStop = {
  id: string;
  user_id: string;
  venue_name: string;
  venue_slug: string;
  nightlife_date: string;
  method: string;
  status: string;
  created_at: string;
};
type VenueCheckin = {
  id: string;
  user_id: string;
  venue_name: string;
  checked_in_on: string;
  method: string;
  checked_in_at: string;
};
type Award = {
  id: string;
  user_id: string;
  badge_name: string;
  awarded_at: string;
};
type SavedVenue = {
  user_id: string;
  venue_slug: string;
};
type AuthUser = {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
};
type SingerRow = {
  id: string;
  alias: string;
  email: string | null;
  joined: string | null;
  lastSignIn: string | null;
  performances: Performance[];
  stops: TourStop[];
  checkins: VenueCheckin[];
  awards: Award[];
  savedVenues: SavedVenue[];
  lastActivity: string | null;
};

const limit = 1000;
function displayDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.valueOf()) ? "—" : new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles", month: "short", day: "numeric", year: "numeric",
  }).format(d);
}
function methodLabel(value: string) {
  if (value === "location_matched") return "Location matched";
  if (value === "self_reported") return "Self-reported";
  return value.replaceAll("_", " ");
}
function mostRecent(values: Array<string | null | undefined>) {
  return values.filter((v): v is string => Boolean(v)).sort().at(-1) ?? null;
}
function Stat({ label, count, detail }: { label: string; count: number; detail?: string }) {
  return <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5">
    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
    <strong className="mt-2 block text-4xl font-black text-white">{count}</strong>
    {detail && <p className="mt-2 text-xs text-slate-500">{detail}</p>}
  </div>;
}

export default async function SingerActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; show?: string }>;
}) {
  // The proxy blocks unauthenticated admin routes. Check again before using the
  // service role key so the database never becomes a browser-facing data source.
  await requireAdminAuthorization();

  const db = createAdminClient();
  const params = await searchParams;
  const query = String(params.q || "").trim().toLowerCase().slice(0, 160);
  const sort = ["stars", "tour", "recent", "alias"].includes(params.sort || "") ? params.sort : "stars";
  const show = params.show === "active" ? "active" : "all";

  const [profilesResult, membersResult, performancesResult, stopsResult, checkinsResult, awardsResult, savedResult, usersResult] = await Promise.all([
    db.from("singer_profiles").select("user_id,karaoke_alias,created_at", { count: "exact" }).limit(limit),
    db.from("singhub_member_profiles").select("user_id,email,created_at", { count: "exact" }).limit(limit),
    db.from("singer_performances").select("id,user_id,song_title,artist,venue_name,performed_on,created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(limit),
    db.from("singer_venue_visits").select("id,user_id,venue_name,venue_slug,nightlife_date,method,status,created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(limit),
    db.from("singer_venue_checkins").select("id,user_id,venue_name,checked_in_on,method,checked_in_at", { count: "exact" }).order("checked_in_at", { ascending: false }).limit(limit),
    db.from("singer_achievements").select("id,user_id,badge_name,awarded_at", { count: "exact" }).order("awarded_at", { ascending: false }).limit(limit),
    db.from("singer_saved_venues").select("user_id,venue_slug", { count: "exact" }).limit(limit),
    db.auth.admin.listUsers({ page: 1, perPage: limit }),
  ]);

  const failures = [
    ["Singer profiles", profilesResult.error],
    ["Member profiles", membersResult.error],
    ["Performances", performancesResult.error],
    ["Tour Stops", stopsResult.error],
    ["Venue check-ins", checkinsResult.error],
    ["Achievements", awardsResult.error],
    ["Saved venues", savedResult.error],
    ["Auth accounts", usersResult.error],
  ].filter(([, error]) => error);

  if (failures.length) {
    return <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <Link href="/admin" className="text-cyan-200">← Admin Tools</Link>
      <h1 className="mt-6 text-4xl font-black">Singer Activity</h1>
      <div role="alert" className="mt-8 rounded-2xl border border-rose-400/40 bg-rose-950/30 p-5">
        <p className="font-bold text-rose-200">The singer report could not load completely.</p>
        <p className="mt-2 text-sm text-slate-300">No partial totals are displayed. Please retry or check database access.</p>
        <ul className="mt-3 list-disc pl-5 text-sm text-rose-100">{failures.map(([name, error]) =>
          <li key={String(name)}>{String(name)}: {error?.message}</li>
        )}</ul>
      </div>
    </main>;
  }

  const profiles = (profilesResult.data || []) as SingerProfile[];
  const members = (membersResult.data || []) as MemberProfile[];
  const performances = (performancesResult.data || []) as Performance[];
  const stops = (stopsResult.data || []) as TourStop[];
  const checkins = (checkinsResult.data || []) as VenueCheckin[];
  const awards = (awardsResult.data || []) as Award[];
  const savedVenues = (savedResult.data || []) as SavedVenue[];
  const users = (usersResult.data?.users || []) as AuthUser[];
  const counts = [
    profilesResult, membersResult, performancesResult, stopsResult,
    checkinsResult, awardsResult, savedResult,
  ];
  const truncated = counts.some(result => (result.count || 0) > limit)
    || users.length >= limit;

  const rows = new Map<string, SingerRow>();
  function ensure(id: string): SingerRow {
    const found = rows.get(id);
    if (found) return found;
    const fresh: SingerRow = {
      id, alias: "Not set", email: null, joined: null, lastSignIn: null,
      performances: [], stops: [], checkins: [], awards: [], savedVenues: [], lastActivity: null,
    };
    rows.set(id, fresh);
    return fresh;
  }
  for (const user of users) {
    const row = ensure(user.id);
    row.email = user.email || null;
    row.joined = user.created_at || null;
    row.lastSignIn = user.last_sign_in_at || null;
  }
  for (const member of members) {
    const row = ensure(member.user_id);
    row.email ||= member.email;
    row.joined ||= member.created_at;
  }
  for (const profile of profiles) {
    const row = ensure(profile.user_id);
    row.alias = profile.karaoke_alias?.trim() || "Not set";
    row.joined ||= profile.created_at;
  }
  for (const item of performances) ensure(item.user_id).performances.push(item);
  for (const item of stops) ensure(item.user_id).stops.push(item);
  for (const item of checkins) ensure(item.user_id).checkins.push(item);
  for (const item of awards) ensure(item.user_id).awards.push(item);
  for (const item of savedVenues) ensure(item.user_id).savedVenues.push(item);

  const all = Array.from(rows.values()).map(row => ({
    ...row,
    lastActivity: mostRecent([
      ...row.performances.map(item => item.created_at),
      ...row.stops.map(item => item.created_at),
      ...row.checkins.map(item => item.checked_in_at),
    ]),
  }));
  const activeCount = all.filter(row =>
    row.performances.length || row.stops.length || row.checkins.length
  ).length;
  const visible = all.filter(row => {
    const matches = !query || [row.alias, row.email, row.id]
      .some(value => value?.toLowerCase().includes(query));
    return matches && (show === "all" || row.performances.length > 0 || row.stops.length > 0 || row.checkins.length > 0);
  }).sort((a, b) => {
    if (sort === "alias") return a.alias.localeCompare(b.alias);
    if (sort === "tour") return b.stops.filter(s => s.status === "confirmed").length - a.stops.filter(s => s.status === "confirmed").length
      || b.performances.length - a.performances.length;
    if (sort === "recent") return (b.lastActivity || "").localeCompare(a.lastActivity || "");
    return b.performances.length - a.performances.length
      || b.stops.filter(s => s.status === "confirmed").length - a.stops.filter(s => s.status === "confirmed").length;
  });

  const th = "px-4 py-3 text-left text-[11px] font-black uppercase tracking-[.12em] text-slate-400";
  const td = "px-4 py-4 align-top text-sm text-slate-200";
  return <main className="mx-auto max-w-7xl px-4 py-10 text-white">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin" className="text-sm font-bold text-cyan-200 hover:underline">← Admin Tools</Link>
      <span className="rounded-full border border-fuchsia-300/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-fuchsia-200">Private · Admin only</span>
    </div>
    <header className="mt-7">
      <p className="text-xs font-black uppercase tracking-[.26em] text-fuchsia-300">Community intelligence</p>
      <h1 className="mt-2 text-4xl font-black md:text-5xl">Singer Activity</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
        Live SingHUB account and activity records. See who has signed up, which aliases are active,
        what they recorded, and how they check in. Sign-in emails and song history are visible here
        for administration only, never on the public leaderboard.
      </p>
    </header>

    {truncated && <p role="alert" className="mt-5 rounded-xl border border-amber-300/40 bg-amber-400/10 p-4 text-sm text-amber-100">
      Report row cap reached (1,000 per data source). Some accounts or activity may be missing.
      Do not treat these figures as complete until pagination is added.
    </p>}

    <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Account records" count={all.length} detail="Auth or member/singer records" />
      <Stat label="Active singers" count={activeCount} detail="With a performance, Tour Stop or venue check-in" />
      <Stat label="Performance stars" count={performances.length} detail="Self-reported song records" />
      <Stat label="Confirmed Tour Stops" count={stops.filter(stop => stop.status === "confirmed").length} detail="May include self-reported attendance" />
      <Stat label="Venue check-ins" count={checkins.length} detail="Anytime check-in, separate from Tour Stops" />
      <Stat label="Awarded patches" count={awards.length} detail="Server-awarded achievements" />
      <Stat label="Singer aliases" count={profiles.filter(profile => profile.karaoke_alias?.trim()).length} />
      <Stat label="Saved venue entries" count={savedVenues.length} />
    </section>

    <section className="mt-8 rounded-2xl border border-white/10 bg-white/[.035] p-4">
      <form method="get" action="/admin/singers" className="flex flex-wrap items-end gap-3">
        <label className="grid min-w-[180px] flex-1 gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Find a singer
          <input name="q" type="search" defaultValue={params.q || ""} placeholder="Alias, email, or account ID"
            className="h-11 rounded-xl border border-white/20 bg-slate-950 px-3 text-sm font-normal normal-case tracking-normal text-white placeholder:text-slate-500"/>
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Order
          <select name="sort" defaultValue={sort} className="h-11 rounded-xl border border-white/20 bg-slate-950 px-3 text-sm text-white">
            <option value="stars">Most stars</option><option value="tour">Most Tour Stops</option>
            <option value="recent">Recent activity</option><option value="alias">Alias A–Z</option>
          </select>
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Show
          <select name="show" defaultValue={show} className="h-11 rounded-xl border border-white/20 bg-slate-950 px-3 text-sm text-white">
            <option value="all">All accounts</option><option value="active">Active only</option>
          </select>
        </label>
        <button type="submit" className="h-11 rounded-xl bg-cyan-300 px-5 text-sm font-black text-slate-950 hover:bg-cyan-200">Apply filters</button>
      </form>
      <p className="mt-3 text-xs text-slate-400">{visible.length} of {all.length} account records shown. Refreshed on page load.</p>
    </section>

    <section className="mt-6 overflow-hidden rounded-2xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead className="bg-white/[.06]"><tr>
            <th className={th}>Alias / account</th>
            <th className={th}>Stars</th><th className={th}>Tour Stops</th>
            <th className={th}>Check-ins</th><th className={th}>Patches</th>
            <th className={th}>Last activity</th><th className={th}>Details</th>
          </tr></thead>
          <tbody>{visible.map(row => <tr key={row.id} className="border-t border-white/10">
            <td className={td}><strong className="block text-base text-white">{row.alias}</strong>
              <span className="mt-1 block text-xs text-slate-400">{row.email || "No account email available"}</span>
              <span className="mt-1 block font-mono text-[10px] text-slate-600">ID · …{row.id.slice(-8)}</span>
            </td>
            <td className={td}><strong className="text-xl text-amber-200">{row.performances.length}</strong></td>
            <td className={td}><strong className="text-xl text-cyan-200">{row.stops.filter(item => item.status === "confirmed").length}</strong>
              <span className="mt-1 block text-xs text-slate-500">{new Set(row.stops.filter(item => item.status === "confirmed").map(item => item.venue_slug)).size} rooms</span>
            </td>
            <td className={td}>{row.checkins.length}</td>
            <td className={td}>{row.awards.length}</td>
            <td className={td}>{displayDate(row.lastActivity)}</td>
            <td className={td}>
              <details className="min-w-[190px]">
                <summary className="cursor-pointer font-bold text-cyan-200 hover:text-white">View history</summary>
                <div className="mt-3 w-[340px] max-w-full space-y-4 rounded-xl border border-white/10 bg-slate-950 p-4 text-xs leading-5">
                  <div><p className="font-black uppercase text-slate-400">Account</p>
                    <p className="mt-1">Joined: {displayDate(row.joined)}</p>
                    <p>Last sign-in: {displayDate(row.lastSignIn)}</p>
                    <p className="mt-1 break-all font-mono text-[10px] text-slate-500">{row.id}</p>
                  </div>
                  <div><p className="font-black uppercase text-amber-200">Recorded performances ({row.performances.length})</p>
                    {row.performances.length ? <ul className="mt-2 space-y-2">
                      {row.performances.slice(0, 20).map(p => <li key={p.id}>
                        <strong className="text-white">{p.song_title}</strong>{p.artist ? " · " + p.artist : ""}
                        <span className="block text-slate-400">{p.venue_name || "Venue not recorded"} · {displayDate(p.performed_on)}</span>
                      </li>)}
                    </ul> : <p className="mt-1 text-slate-500">None recorded.</p>}
                  </div>
                  <div><p className="font-black uppercase text-cyan-200">Tour Stop visits ({row.stops.length})</p>
                    {row.stops.length ? <ul className="mt-2 space-y-2">
                      {row.stops.slice(0, 20).map(stop => <li key={stop.id}>
                        <strong>{stop.venue_name}</strong> · {displayDate(stop.nightlife_date)}
                        <span className="block text-slate-400">{stop.status} · {methodLabel(stop.method)}</span>
                      </li>)}
                    </ul> : <p className="mt-1 text-slate-500">None recorded.</p>}
                  </div>
                  <div><p className="font-black uppercase text-fuchsia-200">Venue check-ins ({row.checkins.length})</p>
                    {row.checkins.length ? <ul className="mt-2 space-y-2">
                      {row.checkins.slice(0, 20).map(entry => <li key={entry.id}>
                        <strong>{entry.venue_name}</strong> · {displayDate(entry.checked_in_on)}
                        <span className="block text-slate-400">{methodLabel(entry.method)}</span>
                      </li>)}
                    </ul> : <p className="mt-1 text-slate-500">None recorded.</p>}
                  </div>
                  <div><p className="font-black uppercase text-slate-400">Patches ({row.awards.length})</p>
                    <p className="mt-1">{row.awards.length ? row.awards.map(award => award.badge_name).join(", ") : "None awarded."}</p>
                  </div>
                </div>
              </details>
            </td>
          </tr>)}</tbody>
        </table>
        {!visible.length && <p className="p-6 text-sm text-slate-400">No accounts matched the current filters.</p>}
      </div>
    </section>
    <aside className="mt-6 rounded-xl border border-cyan-300/15 bg-cyan-300/[.04] p-4 text-xs leading-6 text-slate-300">
      <strong className="block text-cyan-100">How to read these numbers</strong>
      Performance Stars are singer-entered records, not independently verified live performances. A Tour Stop
      marked confirmed may have been self-reported or location-matched. Venue check-ins are a separate
      action and must not be added to Tour Stops as if they were the same event. Account emails, song history,
      and venue history are administrative details and must remain behind this admin-only page.
    </aside>
  </main>;
}
