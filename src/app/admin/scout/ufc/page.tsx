import Link from "next/link";
import { requireAdminAuthorization } from "@/lib/adminAuthorization";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UfcCandidate, UfcEvent, UfcScreening } from "@/lib/backyardUfc.server";
import { getPacificDate, formatPacificUfcTime } from "@/lib/backyardUfc.server";
import { reviewUfcCandidate, reviewUfcScreening, saveUfcEvent, submitUfcScreening } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "UFC-SCOUT | SingHUB Admin", robots: { index: false, follow: false } };

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold text-cyan-200 underline underline-offset-2">{children}</a>;
}
function Status({ enabled, label }: { enabled: boolean; label: string }) {
  return <span className={enabled ? "rounded-full border border-emerald-400/40 px-2 py-1 text-xs text-emerald-200" : "rounded-full border border-white/20 px-2 py-1 text-xs text-slate-300"}>{label}</span>;
}

export default async function UfcScoutPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdminAuthorization();
  const params = await searchParams;
  const client = createAdminClient();
  const [candidatesResult, eventsResult, screeningsResult] = await Promise.all([
    client.from("backyard_ufc_candidates").select("*").order("candidate_key", { ascending: true }).limit(250),
    client.from("backyard_ufc_events").select("*").order("event_date", { ascending: true }).limit(100),
    client.from("backyard_ufc_screenings").select("*").order("created_at", { ascending: false }).limit(250),
  ]);
  const error = candidatesResult.error || eventsResult.error || screeningsResult.error;
  const candidates = (candidatesResult.data || []) as UfcCandidate[];
  const events = (eventsResult.data || []) as UfcEvent[];
  const screenings = (screeningsResult.data || []) as UfcScreening[];
  const visibleCount = candidates.filter((c) => c.public_enabled && c.review_status === "approved").length;
  const pendingCount = candidates.filter((c) => c.review_status === "pending").length;
  const pendingScreenings = screenings.filter((s) => s.review_status === "pending").length;
  return <main className="mx-auto max-w-7xl space-y-8 px-5 py-10 text-white">
    <header>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">SingHUB Intelligence / UFC-SCOUT</p>
        <Link href="/admin/scout" className="text-sm font-bold text-cyan-200">← SCOUT Command Center</Link>
      </div>
      <h1 className="mt-3 text-4xl font-black">UFC viewing & screening review</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Venue viewing coverage and dated screenings are separate. Only approved canonical karaoke venues can become public. Research signals, historical posts and the UFC locator are not proof that any particular fight will be shown.</p>
      {params.saved === "1" && <p role="status" className="mt-3 text-sm font-bold text-emerald-300">Saved. Backyard feed revalidated.</p>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/40 p-4 text-red-200">UFC-SCOUT data unavailable: {error.message}</p>}
      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <Status enabled label={String(visibleCount) + " approved for Backyard"} />
        <Status enabled={false} label={String(pendingCount) + " venue leads awaiting review"} />
        <Status enabled={false} label={String(pendingScreenings) + " dated screenings awaiting review"} />
        <Link className="font-bold text-cyan-200 underline" href="/backyard?activity=ufc">View Backyard UFC →</Link>
      </div>
    </header>

    <section className="rounded-2xl border border-white/15 bg-slate-950/80 p-5">
      <h2 className="text-2xl font-black">Upcoming fight calendar</h2>
      <p className="mt-2 text-sm text-slate-300">Official UFC event dates, not confirmed bar broadcasts. Add or correct future cards using an official UFC or Paramount source.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {events.filter((event) => event.event_date >= getPacificDate() && event.active).map((event) =>
          <article key={event.event_key} className="rounded-xl border border-white/15 p-4">
            <p className="text-xs font-bold text-fuchsia-300">{event.event_date} · {formatPacificUfcTime(event.main_card_pt)}</p>
            <h3 className="mt-1 text-lg font-black">{event.event_name}</h3>
            <p className="mt-2 text-xs text-slate-400">Verified {event.verified_on}</p>
            <External href={event.official_url}>Official source ↗</External>
            <p className="mt-2 text-xs text-slate-400">{screenings.filter((screening) => screening.event_key === event.event_key && screening.public_enabled).length} published local screenings</p>
          </article>
        )}
      </div>
      <form action={saveUfcEvent} className="mt-5 grid gap-3 rounded-xl border border-cyan-300/20 p-4 sm:grid-cols-2">
        <h3 className="text-sm font-black sm:col-span-2">Add or update official card</h3>
        <label className="text-xs">Stable key (e.g. ufc-335-2026-12-12)<input required name="event_key" placeholder="ufc-335-2026-12-12" className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-sm"/></label>
        <label className="text-xs">Event title<input required name="event_name" placeholder="UFC 335: ..." className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-sm"/></label>
        <label className="text-xs">Event date<input required name="event_date" type="date" className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-sm"/></label>
        <label className="text-xs">Main card Pacific time<input name="main_card_pt" type="time" className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-sm"/></label>
        <label className="text-xs sm:col-span-2">Official UFC / Paramount event source<input required name="official_url" type="url" placeholder="https://www.ufc.com/event/..." className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-sm"/></label>
        <button type="submit" className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-black text-black sm:col-span-2">Save official fight</button>
      </form>
    </section>

    <section className="rounded-2xl border border-white/15 bg-slate-950/80 p-5">
      <h2 className="text-2xl font-black">Fight-specific screening verification</h2>
      <p className="mt-2 text-sm text-slate-300">Submit an actual dated venue/UFC post here. It enters review, not the public calendar. Publish only after reviewing that source and confirming the venue.</p>
      <form action={submitUfcScreening} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs">Venue<select name="candidate_key" required className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-sm">
          <option value="">Choose venue</option>{candidates.map((venue) => <option value={venue.candidate_key} key={venue.candidate_key}>{venue.venue_name}{venue.canonical_slug ? " · canonical" : " · lead"}</option>)}
        </select></label>
        <label className="text-xs">UFC event<select name="event_key" required className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-sm">
          <option value="">Choose event</option>{events.filter((event) => event.event_date >= getPacificDate()).map((event) => <option key={event.event_key} value={event.event_key}>{event.event_date}: {event.event_name}</option>)}
        </select></label>
        <label className="text-xs">Date of verification source<input required name="source_date" type="date" defaultValue={getPacificDate()} className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-sm"/></label>
        <label className="text-xs">Specific venue screening URL<input required name="source_url" type="url" placeholder="https://..." className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-sm"/></label>
        <label className="text-xs sm:col-span-2">Evidence notes<input name="notes" placeholder="Exact fight advertised, doors, time..." className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-sm"/></label>
        <button type="submit" className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-black text-black sm:col-span-2">Add screening to private review queue</button>
      </form>
      <div className="mt-6 space-y-3">
        {screenings.map((screening) => {
          const venue = candidates.find((candidate) => candidate.candidate_key === screening.candidate_key);
          const event = events.find((item) => item.event_key === screening.event_key);
          return <form key={screening.id} action={reviewUfcScreening} className="grid gap-3 rounded-xl border border-white/15 p-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
            <input type="hidden" name="screening_id" value={screening.id}/>
            <div>
              <p className="text-sm font-black">{venue?.venue_name || screening.candidate_key} · {event?.event_name || screening.event_key}</p>
              <p className="text-xs text-slate-400">Source dated {screening.source_date}</p>
              <External href={screening.source_url}>View specific event evidence ↗</External>
              {screening.notes && <p className="mt-1 text-xs text-slate-300">{screening.notes}</p>}
            </div>
            <select name="review_status" defaultValue={screening.review_status} className="rounded-lg bg-slate-900 px-3 py-2 text-sm">
              <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
            </select>
            <label className="text-xs"><input type="checkbox" name="public_enabled" defaultChecked={screening.public_enabled} className="mr-2"/>Publish screening</label>
            <button type="submit" className="rounded-lg border border-cyan-300/50 px-4 py-2 text-sm font-black text-cyan-200">Save</button>
          </form>;
        })}
        {!screenings.length && <p className="text-sm text-slate-400">No dated screening evidence yet. Nothing will be invented or published.</p>}
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-2xl font-black">Venue research and approvals</h2>
      <p className="text-sm text-slate-300">Review each candidate against its exact address. A UFC-only lead cannot publish until its karaoke venue has separately joined canonical.</p>
      <div className="grid gap-3 lg:grid-cols-2">
        {candidates.map((candidate) => <form key={candidate.candidate_key} action={reviewUfcCandidate} className="rounded-2xl border border-white/15 bg-slate-950/75 p-4">
          <input type="hidden" name="candidate_key" value={candidate.candidate_key}/>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-black">{candidate.venue_name}</h3>
            <Status enabled={candidate.public_enabled} label={candidate.public_enabled ? "Backyard visible" : "Research only"}/>
          </div>
          <p className="mt-1 text-xs text-slate-300">{candidate.address}</p>
          <p className="mt-2 text-xs text-slate-400">ID {candidate.candidate_key} · {candidate.canonical_slug ? "Canonical: " + candidate.canonical_slug : "Not canonical"} · {candidate.evidence_tier}</p>
          <p className="mt-2 text-xs text-slate-300">{candidate.research_notes}</p>
          <div className="mt-2 text-xs"><External href={candidate.source_url}>Evidence source ↗</External> · Checked {candidate.source_date}</div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select name="review_status" defaultValue={candidate.review_status} className="min-w-32 flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm">
              <option value="pending">Pending</option><option value="approved">Approved</option>
              <option value="hold">Hold</option><option value="rejected">Rejected</option>
            </select>
            <label className="text-xs"><input type="checkbox" name="public_enabled" defaultChecked={candidate.public_enabled} disabled={!candidate.canonical_slug} className="mr-2"/>Publish to Backyard</label>
            <button type="submit" className="rounded-lg border border-cyan-300/50 px-4 py-2 text-sm font-black text-cyan-200">Save</button>
          </div>
        </form>)}
      </div>
    </section>
  </main>;
}
