import { buildRoundupDraft, revalidateRoundupDraft } from "@/lib/roundups/builder";
import { getRoundupByDate } from "@/lib/roundups/repository";
import { RoundupEditor } from "@/components/admin/RoundupEditor";
import type { RoundupDraft, RoundupVenueRow } from "@/lib/roundups/types";

export const metadata = { title: "Roundup Generator | SingHUB Admin", description: "Build, lock, render and export deterministic SingHUB karaoke roundups.", robots: { index: false, follow: false } };

function todayInLosAngeles() {
  const parts = new Intl.DateTimeFormat("en-CA", { year:"numeric", month:"2-digit", day:"2-digit", timeZone:"America/Los_Angeles" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function groupsFor(rows: RoundupVenueRow[]) {
  const groups = [];
  for (let index = 0; index < rows.length; index += 5) {
    groups.push({
      groupId: `venues-${String(groups.length + 1).padStart(2, "0")}`,
      venueEventIds: rows.slice(index, index + 5).map((row) => row.eventId),
    });
  }
  return groups;
}

async function sanitizePersistedDraft(persistedDraft: RoundupDraft, candidate: RoundupDraft) {
  const eligibleEventIds = new Set(candidate.rows.map((row) => row.eventId));
  const rows = persistedDraft.rows
    .filter((row) => eligibleEventIds.has(row.eventId))
    .map((row, index) => ({ ...row, number: index + 1 }));

  if (rows.length === persistedDraft.rows.length) return persistedDraft;

  return revalidateRoundupDraft({
    ...persistedDraft,
    state: "draft",
    rows,
    groups: groupsFor(rows),
  });
}

export default async function RoundupsPage({ searchParams }:{ searchParams:Promise<{date?:string}> }) {
  const params=await searchParams;
  const date=params.date||todayInLosAngeles();
  const candidate=await buildRoundupDraft(date);
  const persisted=await getRoundupByDate(date);
  const state=persisted?.state||"draft";
  let draft=persisted?.draftPayload||candidate;

  if (persisted?.draftPayload && state === "draft") {
    draft = await sanitizePersistedDraft(persisted.draftPayload, candidate);
  }

  const blockers=draft.validation.filter(issue=>issue.severity==="blocker");
  const warnings=draft.validation.filter(issue=>issue.severity==="warning");

  return <main className="mx-auto max-w-7xl px-4 py-8 text-white">
    <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-black uppercase tracking-[.25em] text-fuchsia-300">Publishing</p><h1 className="mt-2 text-4xl font-black">Roundup Generator</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Choose a date, review the exact San Diego County lineup, resolve blockers, lock it, then generate downloadable Story or Feed PNGs.</p></div><form className="flex items-end gap-3" method="get"><label className="grid gap-2 text-xs font-bold uppercase tracking-[.16em] text-slate-300">Choose date<input className="rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-base font-semibold text-white" defaultValue={date} name="date" type="date"/></label><button className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-black text-slate-950">Load lineup</button></form></section>
    <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-xs uppercase text-slate-400">Day</p><p className="mt-1 text-xl font-black">{draft.weekday}</p><p className="text-sm text-slate-400">{draft.date}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-xs uppercase text-slate-400">San Diego County venues</p><p className="mt-1 text-3xl font-black">{draft.rows.length}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-xs uppercase text-slate-400">Validation</p><p className="mt-1 text-xl font-black">{blockers.length} blockers</p><p className="text-sm text-slate-400">{warnings.length} warnings</p></div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-xs uppercase text-slate-400">State</p><p className="mt-1 text-xl font-black uppercase">{state}</p>{persisted?.lockedHash&&<p className="mt-1 font-mono text-[10px] text-slate-500">{persisted.lockedHash.slice(0,16)}…</p>}</div></section>
    <div className="mt-7"><RoundupEditor initialDraft={draft} state={state} lockedPayload={persisted?.lockedPayload} lockedHash={persisted?.lockedHash}/></div>
  </main>;
}
