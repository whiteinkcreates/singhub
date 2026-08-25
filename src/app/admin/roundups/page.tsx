import { buildRoundupDraft } from "@/lib/roundups/builder";
import { getRoundupByDate } from "@/lib/roundups/repository";
import {
  lockRoundupAction,
  markRoundupReviewedAction,
  saveRoundupDraftAction,
} from "./actions";

export const metadata = {
  title: "Roundup Generator | SingHUB Admin",
  description: "Build and validate deterministic SingHUB daily karaoke roundups.",
  robots: { index: false, follow: false },
};

function todayInLosAngeles() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Los_Angeles",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function issueClasses(severity: "blocker" | "warning") {
  return severity === "blocker"
    ? "border-red-400/30 bg-red-400/10 text-red-100"
    : "border-amber-300/30 bg-amber-300/10 text-amber-100";
}

export default async function RoundupsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date || todayInLosAngeles();
  const candidate = await buildRoundupDraft(date);
  const persisted = await getRoundupByDate(date);
  const draft = persisted?.draftPayload || candidate;
  const blockers = draft.validation.filter((issue) => issue.severity === "blocker");
  const warnings = draft.validation.filter((issue) => issue.severity === "warning");
  const state = persisted?.state || "draft";
  const isLocked = state === "locked" || state === "rendered";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-white">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">Publishing</p>
          <h1 className="mt-2 text-4xl font-black">Roundup Generator</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Build the lineup from canonical SingHUB data, resolve validation issues, review it, then lock the exact publishing payload.
          </p>
        </div>

        <form className="flex items-end gap-3" method="get">
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
            Choose date
            <input className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-base font-semibold text-white" defaultValue={date} name="date" type="date" />
          </label>
          <button className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-black text-slate-950" type="submit">Load lineup</button>
        </form>
      </section>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Day</p>
          <p className="mt-1 text-xl font-black">{draft.weekday}</p>
          <p className="text-sm text-slate-400">{draft.date}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Eligible venues</p>
          <p className="mt-1 text-3xl font-black">{draft.rows.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Validation</p>
          <p className="mt-1 text-xl font-black">{blockers.length} blocker{blockers.length === 1 ? "" : "s"}</p>
          <p className="text-sm text-slate-400">{warnings.length} warning{warnings.length === 1 ? "" : "s"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Workflow state</p>
          <p className="mt-1 text-xl font-black uppercase">{state}</p>
          {persisted?.lockedHash ? <p className="mt-1 font-mono text-[10px] text-slate-500">{persisted.lockedHash.slice(0, 16)}…</p> : null}
        </div>
      </section>

      <section className="mt-7 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Workflow</p>
            <h2 className="mt-1 text-2xl font-black">DRAFT → REVIEWED → LOCKED → RENDERED</h2>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-slate-300">{state}</div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {!persisted ? (
            <form action={saveRoundupDraftAction}>
              <input type="hidden" name="date" value={date} />
              <button className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-black text-slate-950" type="submit">Save Draft</button>
            </form>
          ) : null}

          {state === "draft" ? (
            <form action={markRoundupReviewedAction}>
              <input type="hidden" name="date" value={date} />
              <button className="rounded-xl bg-fuchsia-300 px-4 py-2.5 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40" disabled={blockers.length > 0} type="submit">Mark Reviewed</button>
            </form>
          ) : null}

          {state === "reviewed" ? (
            <form action={lockRoundupAction}>
              <input type="hidden" name="date" value={date} />
              <button className="rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-black text-slate-950" type="submit">Lock Lineup</button>
            </form>
          ) : null}

          {isLocked ? (
            <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-2.5 text-sm font-bold text-emerald-100">
              Locked payload is immutable. Rendering will use this snapshot only.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-7 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Validation gate</p>
        <h2 className="mt-1 text-2xl font-black">{blockers.length === 0 ? "Candidate can proceed to review" : "Candidate cannot be reviewed yet"}</h2>
        {draft.validation.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">No validation issues found in the loaded candidate.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {draft.validation.map((issue, index) => (
              <div className={`rounded-2xl border p-4 ${issueClasses(issue.severity)}`} key={`${issue.code}-${index}`}>
                <p className="text-xs font-black uppercase tracking-[0.15em]">{issue.severity} · {issue.code.replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm leading-6">{issue.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Materialized lineup</p>
          <h2 className="mt-1 text-2xl font-black">Exact publishable fields</h2>
          <p className="mt-2 text-sm text-slate-400">After LOCKED, these strings and this ordering become renderer input. No venue, host, time, neighborhood, number, or ordering lookup happens again.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/20 text-xs uppercase tracking-[0.14em] text-slate-400">
              <tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Venue</th><th className="px-4 py-3">Neighborhood</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Host</th><th className="px-4 py-3">Event ID</th></tr>
            </thead>
            <tbody>
              {draft.rows.map((row) => (
                <tr className="border-t border-white/[0.06]" key={row.eventId}>
                  <td className="px-4 py-3 font-black text-cyan-200">{row.number}</td>
                  <td className="px-4 py-3 font-bold text-white">{row.venueName}</td>
                  <td className="px-4 py-3 text-slate-300">{row.neighborhood || "Missing"}</td>
                  <td className="px-4 py-3 text-slate-300">{row.startTime || "Missing"}{row.endTime ? ` – ${row.endTime}` : ""}</td>
                  <td className="px-4 py-3 text-slate-300">{row.hostName || "Not listed"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.eventId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-7 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Automatic grouping preview</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {draft.groups.map((group) => (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={group.groupId}>
              <p className="text-sm font-black text-white">{group.groupId}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{group.venueEventIds.join(" · ")}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
