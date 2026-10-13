"use client";
import { useState } from "react";

export type NominationGroup = {
  recipientUserId: string;
  alias: string;
  badgeKey: "sing_along_superstar" | "cheer_captain";
  badgeName: string;
  nightlifeDate: string;
  venueSlug: string;
  nominators: number;
  notes: string[];
};
export function AchievementModeration({ groups }: { groups: NominationGroup[] }) {
  const [pending, setPending] = useState("");
  const [message, setMessage] = useState("");
  async function review(group: NominationGroup, action: "approve" | "reject") {
    if (pending) return;
    if (!window.confirm((action === "approve" ? "Award the patch to " : "Reject nominations for ")
      + group.alias + " at " + group.venueSlug + "?")) return;
    const key = group.recipientUserId + group.badgeKey + group.nightlifeDate + group.venueSlug;
    setPending(key);setMessage("");
    try {
      const response = await fetch("/api/admin/achievements", {
        method:"POST", headers:{"content-type":"application/json"},
        body:JSON.stringify({recipientUserId:group.recipientUserId,badgeKey:group.badgeKey,
          nightlifeDate:group.nightlifeDate,venueSlug:group.venueSlug,action}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Review failed.");
      window.location.reload();
    } catch(error) {
      setMessage(error instanceof Error ? error.message : "Review failed.");
      setPending("");
    }
  }
  return <section className="mt-8 space-y-4" aria-label="Community nominations">
    {groups.length === 0 && <p className="rounded-2xl border border-white/10 bg-white/[.03] p-6 text-sm text-slate-400">No pending community nominations yet.</p>}
    {groups.map(group => {
      const key = group.recipientUserId+group.badgeKey+group.nightlifeDate+group.venueSlug;
      const ready = group.nominators >= 3;
      return <article key={key} className="rounded-2xl border border-white/10 bg-[#0b121d] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-fuchsia-300">{group.badgeName}</p>
            <h2 className="mt-2 text-xl font-black text-white">{group.alias}</h2>
            <p className="mt-1 text-sm text-slate-400">{group.venueSlug} · {group.nightlifeDate}</p>
          </div>
          <span className={"rounded-full border px-3 py-2 text-xs font-bold "+(ready
            ? "border-cyan-300/40 text-cyan-100" : "border-amber-300/30 text-amber-100")}>
            {group.nominators} distinct nominators · {ready ? "Ready to review" : "Needs 3"}
          </span>
        </div>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-bold text-cyan-200">Read nomination reasons</summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {group.notes.map((note,i)=><li key={i}>{note}</li>)}
          </ul>
        </details>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" disabled={!ready || Boolean(pending)}
            onClick={()=>void review(group,"approve")}
            className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-35">
            Approve patch
          </button>
          <button type="button" disabled={Boolean(pending)}
            onClick={()=>void review(group,"reject")}
            className="rounded-full border border-rose-300/35 px-5 py-2.5 text-sm font-bold text-rose-200 disabled:opacity-35">
            Reject group
          </button>
        </div>
      </article>;
    })}
    {message&&<p role="alert" className="rounded-xl border border-rose-300/30 p-4 text-sm text-rose-200">{message}</p>}
  </section>;
}
