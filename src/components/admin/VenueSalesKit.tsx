"use client";
import { useState } from "react";
import type { SalesVenue } from "@/components/venue/VenueProfileExplorer";

const steps = ["Verify live profile and karaoke schedule","Confirm decision-maker and preferred contact","Request accurate photos, logo and permission","Review venue events, specials and KJ details","Discuss optional check-in offer and staff validation","Agree on next action and follow-up date","Present terms and checkout only when the venue is ready"];
export function VenueSalesKit({ venues }: { venues: SalesVenue[] }) {
  const [slug, setSlug] = useState("");
  const [checked, setChecked] = useState<number[]>([]);
  const [copied, setCopied] = useState("");
  const venue = venues.find(v => v.slug === slug);
  const root = "https://singhub.app";
  const page = root + "/venues/premium" + (slug ? "?venue=" + encodeURIComponent(slug) : "");
  const live = venue ? root + "/venues/" + venue.slug : "";
  const message = venue ? `Hey! I wanted to show you how ${venue.name} appears on SingHUB and make sure we've got the details right: ${live}\n\nHere's how the free listing and the enhanced experience work: ${page}\n\nIf you spot any corrections, have photos or upcoming events to add, or want to explore a venue offer, let me know. No paperwork or payment needed just to review your listing.` : "";
  async function copy(value:string, label:string) { try { await navigator.clipboard.writeText(value); setCopied(label); } catch { setCopied("Copy failed. Please select the text instead."); } }
  return <div className="mt-8 grid gap-6 lg:grid-cols-2">
    <section className="rounded-2xl border border-cyan-400/30 bg-slate-900 p-6">
      <p className="text-xs font-black uppercase tracking-widest text-cyan-200">01 / Personalize</p>
      <h2 className="mt-2 text-2xl font-black">Choose a venue</h2>
      <label htmlFor="sales-venue" className="mt-5 block text-sm text-slate-300">Canonical public venue</label>
      <select id="sales-venue" className="mt-2 w-full rounded-xl border border-slate-500 bg-slate-950 p-3 text-white" value={slug} onChange={e => {setSlug(e.target.value);setChecked([]);setCopied("");}}>
        <option value="">Choose a venue</option>
        <optgroup label="Enhanced examples">{venues.filter(v=>v.enhanced).map(v=><option key={v.slug} value={v.slug}>{v.name} · {v.city}</option>)}</optgroup>
        <optgroup label="Basic listings">{venues.filter(v=>!v.enhanced).map(v=><option key={v.slug} value={v.slug}>{v.name} · {v.city}</option>)}</optgroup>
      </select>
      {venue && <p className="mt-3 text-sm text-slate-400">{venue.enhanced ? "Enhanced presentation, not necessarily a paid Partner" : "Free basic listing"} · {venue.neighborhood || venue.city}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={()=>copy(page,"Sales page link copied")} className="rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950">Copy shareable For Venues link</button>
        {venue && <button onClick={()=>copy(live,"Venue link copied")} className="rounded-xl border border-slate-500 px-4 py-3 font-bold">Copy venue link</button>}
      </div>
      <a className="mt-4 inline-block text-cyan-200 underline" href={page} target="_blank" rel="noopener noreferrer">Open public For Venues page ↗</a>
      {copied && <p role="status" className="mt-3 text-sm text-green-200">{copied}</p>}
    </section>
    <section className="rounded-2xl border border-fuchsia-400/30 bg-slate-900 p-6">
      <p className="text-xs font-black uppercase tracking-widest text-fuchsia-200">02 / Keep it human</p>
      <h2 className="mt-2 text-2xl font-black">Outreach and follow-up</h2>
      {venue ? <><textarea readOnly value={message} aria-label="Suggested venue message" rows={9} className="mt-5 w-full rounded-xl border border-slate-600 bg-slate-950 p-4 text-sm leading-6 text-slate-100"/><button onClick={()=>copy(message,"Message copied")} className="mt-3 rounded-xl border border-fuchsia-300 px-4 py-3 font-bold">Copy personalized message</button></> : <p className="mt-4 text-sm text-slate-300">Choose a venue to generate a useful, no-pressure profile review message.</p>}
      <p className="mt-4 text-xs leading-5 text-slate-400">Edit the message to match your actual relationship. For original collaborators, do not reintroduce the withdrawn invoice or pilot without a new explicit decision.</p>
    </section>
    <section className="rounded-2xl border border-white/15 bg-slate-900 p-6 lg:col-span-2">
      <p className="text-xs font-black uppercase tracking-widest text-cyan-200">03 / In-person close checklist</p>
      <h2 className="mt-2 text-2xl font-black">Nothing to forget. No extra portal.</h2>
      <p className="mt-2 text-sm text-slate-400">Local checklist for this session only. It does not record approvals or create an agreement.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">{steps.map((step,i)=><label key={step} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3"><input type="checkbox" checked={checked.includes(i)} onChange={e=>setChecked(old=>e.target.checked?[...old,i]:old.filter(v=>v!==i))} className="mt-1 h-4 w-4"/><span className="text-sm">{step}</span></label>)}</div>
      <div className="mt-5 flex flex-wrap gap-4 text-sm">
        <a className="text-cyan-200 underline" href="/venue-partner-terms" target="_blank" rel="noopener noreferrer">Review Venue Partner Terms ↗</a>
        <a className="text-cyan-200 underline" href="/privacy" target="_blank" rel="noopener noreferrer">Review Privacy Policy ↗</a>
        <a className="text-cyan-200 underline" href="/admin/light-up-venues">Open profile editor ↗</a>
      </div>
      <p className="mt-4 text-xs text-slate-400">No live payment button until agreement, privacy policy, and Stripe terms acceptance are verified. Do not represent enhanced previews as confirmed paid Partners or report unverified ROI.</p>
    </section>
  </div>;
}
