"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

export type SalesVenue = { slug: string; name: string; neighborhood: string; city: string; enhanced: boolean };
export function VenueProfileExplorer({ venues, initialSlug }: { venues: SalesVenue[]; initialSlug?: string }) {
  const enhanced = useMemo(() => venues.filter(v => v.enhanced), [venues]);
  const basic = useMemo(() => venues.filter(v => !v.enhanced), [venues]);
  const [slug, setSlug] = useState(initialSlug && venues.some(v => v.slug === initialSlug) ? initialSlug : "");
  const current = venues.find(v => v.slug === slug);
  const selectClass = "mt-2 w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white";
  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-fuchsia-400/40 bg-slate-900 p-5">
        <label htmlFor="sales-enhanced" className="text-sm font-bold text-fuchsia-200">Enhanced profiles ({enhanced.length})</label>
        <select id="sales-enhanced" className={selectClass} value={current?.enhanced ? slug : ""} onChange={e => setSlug(e.target.value)}>
          <option value="">Select an enhanced venue</option>
          {enhanced.map(v => <option key={v.slug} value={v.slug}>{v.name} · {v.neighborhood || v.city}</option>)}
        </select>
        <p className="mt-3 text-sm text-slate-300">See the actual public enhanced presentation. An enhanced profile does not necessarily mean a paid partnership.</p>
      </div>
      <div className="rounded-2xl border border-cyan-400/40 bg-slate-900 p-5">
        <label htmlFor="sales-basic" className="text-sm font-bold text-cyan-200">Basic profiles ({basic.length})</label>
        <select id="sales-basic" className={selectClass} value={current && !current.enhanced ? slug : ""} onChange={e => setSlug(e.target.value)}>
          <option value="">Select a basic venue</option>
          {basic.map(v => <option key={v.slug} value={v.slug}>{v.name} · {v.neighborhood || v.city}</option>)}
        </select>
        <p className="mt-3 text-sm text-slate-300">Every listed venue keeps its essential karaoke information free.</p>
      </div>
      {current && <div className="md:col-span-2 rounded-2xl border border-white/20 bg-white/[0.04] p-5">
        <p className="text-xs font-black uppercase tracking-widest text-cyan-200">Selected venue · {current.enhanced ? "Enhanced example" : "Basic example"}</p>
        <h3 className="mt-2 text-2xl font-bold text-white">{current.name}</h3>
        <p className="mt-1 text-sm text-slate-400">{current.neighborhood || current.city}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="inline-flex rounded-lg bg-cyan-300 px-5 py-3 font-bold text-slate-950" href={`/venues/${current.slug}`}>View live profile ↗</Link>
          <button type="button" onClick={() => { const url = new URL(window.location.href); url.searchParams.set("venue", current.slug); navigator.clipboard?.writeText(url.toString()); }} className="rounded-lg border border-slate-500 px-5 py-3 font-bold text-white">Copy page with venue selected</button>
        </div>
        <p className="mt-3 text-xs text-slate-400">Profile links use current public listings, not a simulated before-and-after.</p>
      </div>}
    </div>
  );
}
