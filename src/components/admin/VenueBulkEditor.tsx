"use client";

import { useMemo, useState } from "react";
import {
  HOTEL_VIBE_OPTIONS, VENUE_FACT_OPTIONS, VENUE_STANDOUT_OPTIONS,
} from "@/lib/venueEnhancements";

type VenueOption = { slug: string; name: string; neighborhood: string; city: string };
type Field = "amenities" | "vibeTags" | "standoutFeatures";
type Operation = "add" | "remove";
const options: Record<Field, readonly string[]> = {
  amenities: VENUE_FACT_OPTIONS,
  vibeTags: HOTEL_VIBE_OPTIONS,
  standoutFeatures: VENUE_STANDOUT_OPTIONS,
};
const maxVenues = 40;
const inputClass = "min-h-11 w-full rounded-xl border border-white/15 bg-slate-950 px-3 text-sm text-white";
const labelClass = "grid gap-2 text-xs font-black uppercase tracking-wider text-slate-400";

export function VenueBulkEditor({ venues }: { venues: VenueOption[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [field, setField] = useState<Field>("amenities");
  const [operation, setOperation] = useState<Operation>("add");
  const [value, setValue] = useState<string>(options.amenities[0]);
  const [review, setReview] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [issues, setIssues] = useState<{ slug: string; reason: string }[]>([]);
  const cities = useMemo(() => [...new Set(venues.map(v => v.city).filter(Boolean))].sort(), [venues]);
  const filtered = useMemo(() => venues.filter(v => (
    (city === "all" || v.city === city)
    && [v.name,v.neighborhood,v.city,v.slug].some(text => text.toLowerCase().includes(search.trim().toLowerCase()))
  )), [venues, city, search]);
  const selectedVenues = venues.filter(v => selected.includes(v.slug));
  const selectedVisible = filtered.filter(v => selected.includes(v.slug));
  const allVisibleSelected = filtered.length > 0 && selectedVisible.length === filtered.length;
  function updateSelection(next: string[]) {
    setSelected(next); setReview(false); setMessage(""); setIssues([]);
  }
  function toggle(slug: string) {
    updateSelection(selected.includes(slug) ? selected.filter(v => v !== slug) : [...selected, slug]);
  }
  function toggleVisible() {
    if (allVisibleSelected) {
      const visible = new Set(filtered.map(v => v.slug));
      updateSelection(selected.filter(slug => !visible.has(slug)));
    } else {
      updateSelection([...new Set([...selected, ...filtered.map(v => v.slug)])]);
    }
  }
  function changeField(next: Field) { setField(next); setValue(options[next][0]); setReview(false); }
  async function apply() {
    if (working || !review || !selected.length || selected.length > maxVenues) return;
    setWorking(true); setMessage(""); setIssues([]);
    try {
      const response = await fetch("/api/admin/venue-enhancements/bulk", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ slugs: selected, field, operation, value }),
      });
      const result = await response.json();
      if (!response.ok && response.status !== 207) throw new Error(result.error || "Bulk edit failed.");
      const failures = (result.issues || []) as { slug: string; reason: string }[];
      setIssues(failures);
      setMessage(`Applied to ${result.changed} venue(s); ${result.unchanged} unchanged.`
        + (failures.length ? ` ${failures.length} require your attention. See details below.` : " No other profile fields were modified."));
      setReview(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bulk edit could not be completed.");
      setReview(false);
    } finally { setWorking(false); }
  }
  return <section className="mt-8 rounded-[2rem] border border-cyan-300/20 bg-[#07131a] p-5 text-white md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[.22em] text-fuchsia-300">Batch operations</p>
        <h2 className="mt-2 text-2xl font-black">Bulk Venue Edits</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Select multiple venues, add or remove one shared factual trait, then review before applying.
          Existing images, editorial descriptions, karaoke schedules, SingHERE links, and Partner status stay untouched.
        </p>
      </div>
      <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-black text-cyan-200">{selected.length} selected</span>
    </div>
    <div className="mt-6 grid gap-3 md:grid-cols-[1fr_12rem]">
      <label className={labelClass}>Find venues
        <input className={inputClass} value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search names, neighborhoods or slugs" />
      </label>
      <label className={labelClass}>City
        <select className={inputClass} value={city} onChange={e => setCity(e.target.value)}>
          <option value="all">All cities</option>
          {cities.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
      <span className="text-xs text-slate-400">{filtered.length} shown · {selectedVisible.length} selected in view</span>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={working || filtered.length === 0 || (!allVisibleSelected && new Set([...selected, ...filtered.map(v => v.slug)]).size > maxVenues)}
          onClick={toggleVisible} className="rounded-xl border border-cyan-300/30 px-3 py-2 text-xs font-black text-cyan-100 disabled:opacity-30">
          {allVisibleSelected ? "Deselect filtered" : "Select filtered"}
        </button>
        <button type="button" disabled={working || !selected.length} onClick={() => updateSelection([])}
          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-slate-300 disabled:opacity-30">Clear</button>
      </div>
    </div>
    <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/70">
      {filtered.map(v => <label key={v.slug} className="flex cursor-pointer items-start gap-3 border-b border-white/5 px-4 py-3 hover:bg-white/[.04]">
        <input type="checkbox" className="mt-1 accent-cyan-300" disabled={working || (!selected.includes(v.slug) && selected.length >= maxVenues)}
          checked={selected.includes(v.slug)} onChange={() => toggle(v.slug)} />
        <span className="min-w-0"><strong className="block text-sm text-white">{v.name}</strong>
          <span className="block text-xs text-slate-400">{[v.neighborhood,v.city].filter(Boolean).join(" · ")}</span></span>
      </label>)}
      {!filtered.length && <p className="p-4 text-sm text-slate-500">No venues match this filter.</p>}
    </div>
    <div className="mt-6 grid gap-3 md:grid-cols-3">
      <label className={labelClass}>Attribute to change
        <select className={inputClass} value={field} disabled={working} onChange={e => changeField(e.target.value as Field)}>
          <option value="amenities">Good to Know (facts)</option>
          <option value="vibeTags">Vibe tags</option>
          <option value="standoutFeatures">Standout features</option>
        </select>
      </label>
      <label className={labelClass}>Action
        <select className={inputClass} value={operation} disabled={working} onChange={e => { setOperation(e.target.value as Operation); setReview(false); }}>
          <option value="add">Add trait</option><option value="remove">Remove trait</option>
        </select>
      </label>
      <label className={labelClass}>Trait
        <select className={inputClass} value={value} disabled={working} onChange={e => { setValue(e.target.value); setReview(false); }}>
          {options[field].map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
    </div>
    <p className="mt-3 text-xs leading-5 text-slate-500">Maximum 40 venues per batch. Vibe tags are limited to four per venue and standout features to three. If a venue is full, the batch is blocked before edits begin. Concurrent changes are flagged, not overwritten.</p>
    {!review ? <button type="button" disabled={working || !selected.length || selected.length > maxVenues}
      onClick={() => { setReview(true); setMessage(""); setIssues([]); }}
      className="mt-5 rounded-full bg-cyan-300 px-6 py-3 text-sm font-black text-slate-950 disabled:opacity-40">Review bulk change</button>
    : <section className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/[.05] p-4">
      <p className="text-xs font-black uppercase tracking-wider text-amber-200">Confirm changes</p>
      <h3 className="mt-2 text-xl font-black">{operation === "add" ? "Add" : "Remove"} “{value}” {operation === "add" ? "to" : "from"} {selected.length} venues?</h3>
      <p className="mt-2 text-sm text-slate-300">Only the selected {field === "amenities" ? "Good to Know" : field === "vibeTags" ? "vibe" : "standout"} list will change for:</p>
      <p className="mt-2 text-sm text-slate-400">{selectedVenues.map(v => v.name).join(" · ")}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={working} onClick={() => void apply()} className="rounded-full bg-fuchsia-400 px-6 py-3 text-sm font-black text-slate-950 disabled:opacity-40">{working ? "Applying…" : "Confirm and apply"}</button>
        <button type="button" disabled={working} onClick={() => setReview(false)} className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold">Cancel</button>
      </div>
    </section>}
    {message && <p role="status" className="mt-5 rounded-xl border border-white/15 bg-white/[.04] p-4 text-sm text-slate-200">{message}</p>}
    {issues.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-rose-200">
      {issues.map(issue => <li key={issue.slug}>{venues.find(v => v.slug === issue.slug)?.name || issue.slug}: {issue.reason}</li>)}
    </ul>}
  </section>;
}
