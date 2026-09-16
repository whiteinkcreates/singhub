"use client";

import { useMemo, useState } from "react";
import { VenueMediaLibrary } from "@/components/admin/VenueMediaLibrary";
import {
  VENUE_FACT_OPTIONS,
  type VenueDailyDeal,
  type VenueEnhancement,
  type VenueGalleryItem,
  type VenueSpecial,
} from "@/lib/venueEnhancements";

type VenueOption = {
  slug: string;
  name: string;
  neighborhood: string;
  city: string;
  profileTier: string;
};

type VenueLightUpBuilderProps = {
  initialSlug: string;
  initialProfile: VenueEnhancement;
  venues: VenueOption[];
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function emptyProfile(): VenueEnhancement {
  return {
    enabled: false,
    tagline: "",
    about: "",
    phone: "",
    menuUrl: "",
    heroImageUrl: "",
    heroImageAlt: "",
    gallery: [],
    amenities: [],
    weeklySpecials: [],
    dailyDeals: [],
  };
}

function SpecialEditor({ specials, onChange }: { specials: VenueSpecial[]; onChange: (items: VenueSpecial[]) => void }) {
  function patch(index: number, next: Partial<VenueSpecial>) {
    onChange(specials.map((item, itemIndex) => itemIndex === index ? { ...item, ...next } : item));
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/15 p-4 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Weekly specials</p><p className="mt-1 text-sm text-slate-500">Add the offers singers should see by day. No JSON.</p></div>
        <button type="button" onClick={() => onChange([...specials, { day: "Friday", title: "" }])} className="rounded-full border border-fuchsia-300/40 px-3 py-2 text-xs font-black text-fuchsia-100">+ Add special</button>
      </div>
      <div className="mt-4 space-y-3">
        {specials.map((special, index) => (
          <div key={`${special.day}-${index}`} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[8rem_1fr_7rem_1fr_auto]">
            <select value={special.day} onChange={(event) => patch(index, { day: event.target.value })} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white">{DAYS.map((day) => <option key={day}>{day}</option>)}</select>
            <input value={special.title} onChange={(event) => patch(index, { title: event.target.value })} placeholder="Special name" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <input value={special.price || ""} onChange={(event) => patch(index, { price: event.target.value || undefined })} placeholder="$" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <input value={special.detail || ""} onChange={(event) => patch(index, { detail: event.target.value || undefined })} placeholder="Optional detail" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <button type="button" aria-label="Remove special" onClick={() => onChange(specials.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl border border-rose-300/20 px-3 py-2 font-black text-rose-200">×</button>
          </div>
        ))}
        {specials.length === 0 ? <p className="text-sm text-slate-600">No weekly specials added yet.</p> : null}
      </div>
    </section>
  );
}

function DailyDealEditor({ deals, onChange }: { deals: VenueDailyDeal[]; onChange: (items: VenueDailyDeal[]) => void }) {
  function patch(index: number, next: Partial<VenueDailyDeal>) {
    onChange(deals.map((item, itemIndex) => itemIndex === index ? { ...item, ...next } : item));
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/15 p-4 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Daily deals</p><p className="mt-1 text-sm text-slate-500">Offers that apply every day.</p></div>
        <button type="button" onClick={() => onChange([...deals, { title: "" }])} className="rounded-full border border-cyan-300/40 px-3 py-2 text-xs font-black text-cyan-100">+ Add deal</button>
      </div>
      <div className="mt-4 space-y-3">
        {deals.map((deal, index) => (
          <div key={`${deal.title}-${index}`} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[1fr_7rem_1.4fr_auto]">
            <input value={deal.title} onChange={(event) => patch(index, { title: event.target.value })} placeholder="Deal name" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <input value={deal.price || ""} onChange={(event) => patch(index, { price: event.target.value || undefined })} placeholder="$" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <input value={deal.detail || ""} onChange={(event) => patch(index, { detail: event.target.value || undefined })} placeholder="Optional detail" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <button type="button" aria-label="Remove deal" onClick={() => onChange(deals.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl border border-rose-300/20 px-3 py-2 font-black text-rose-200">×</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function VenueLightUpBuilder({ initialSlug, initialProfile, venues }: VenueLightUpBuilderProps) {
  const [slug, setSlug] = useState(initialSlug);
  const [enabled, setEnabled] = useState(initialProfile.enabled);
  const [tagline, setTagline] = useState(initialProfile.tagline || "");
  const [about, setAbout] = useState(initialProfile.about || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [menuUrl, setMenuUrl] = useState(initialProfile.menuUrl || "");
  const [heroImageUrl, setHeroImageUrl] = useState(initialProfile.heroImageUrl || "");
  const [heroImageAlt, setHeroImageAlt] = useState(initialProfile.heroImageAlt || "");
  const [gallery, setGallery] = useState<VenueGalleryItem[]>(initialProfile.gallery);
  const [amenities, setAmenities] = useState(initialProfile.amenities);
  const [weeklySpecials, setWeeklySpecials] = useState<VenueSpecial[]>(initialProfile.weeklySpecials);
  const [dailyDeals, setDailyDeals] = useState<VenueDailyDeal[]>(initialProfile.dailyDeals);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const selectedVenue = venues.find((venue) => venue.slug === slug);
  const selectedFacts = new Set(amenities);

  function applyProfile(profile: VenueEnhancement) {
    setEnabled(profile.enabled);
    setTagline(profile.tagline || "");
    setAbout(profile.about || "");
    setPhone(profile.phone || "");
    setMenuUrl(profile.menuUrl || "");
    setHeroImageUrl(profile.heroImageUrl || "");
    setHeroImageAlt(profile.heroImageAlt || "");
    setGallery(profile.gallery || []);
    setAmenities(profile.amenities || []);
    setWeeklySpecials(profile.weeklySpecials || []);
    setDailyDeals(profile.dailyDeals || []);
  }

  async function selectVenue(nextSlug: string) {
    setSlug(nextSlug);
    setSaveMessage(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/venue-enhancements?slug=${encodeURIComponent(nextSlug)}`, { cache: "no-store" });
      if (response.status === 404) {
        applyProfile(emptyProfile());
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load venue profile.");
      applyProfile(result.profile as VenueEnhancement);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Could not load venue profile.");
      applyProfile(emptyProfile());
    } finally {
      setLoading(false);
    }
  }

  const output = useMemo<VenueEnhancement>(() => ({
    enabled,
    tagline: tagline.trim() || undefined,
    about: about.trim() || undefined,
    phone: phone.trim() || undefined,
    menuUrl: menuUrl.trim() || undefined,
    heroImageUrl: heroImageUrl.trim() || undefined,
    heroImageAlt: heroImageAlt.trim() || undefined,
    amenities,
    weeklySpecials: weeklySpecials.filter((special) => special.title.trim()),
    dailyDeals: dailyDeals.filter((deal) => deal.title.trim()),
    gallery,
  }), [about, amenities, dailyDeals, enabled, gallery, heroImageAlt, heroImageUrl, menuUrl, phone, tagline, weeklySpecials]);

  function toggleFact(label: string) {
    setAmenities((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
  }

  async function saveProfile() {
    if (!slug.trim()) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch("/api/admin/venue-enhancements", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: slug.trim(), profile: output }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Profile could not be saved.");
      setSaveMessage(enabled ? "Saved and live." : "Saved as a draft. Light Up is off.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20";
  const labelClass = "text-xs font-black uppercase tracking-[0.16em] text-slate-400";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-cyan-300/15 bg-[#07131a] p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className={labelClass}>Venue
            <select value={slug} disabled={loading} onChange={(event) => void selectVenue(event.target.value)} className={`${fieldClass} min-w-0 lg:min-w-[32rem]`}>
              {venues.map((venue) => <option key={venue.slug} value={venue.slug}>{venue.name} · {venue.neighborhood || venue.city}</option>)}
            </select>
          </label>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-3">
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Light Up</p><p className="mt-1 text-sm font-bold text-white">{enabled ? "Public enhanced profile" : "Draft / standard listing"}</p></div>
            <button type="button" onClick={() => setEnabled((current) => !current)} aria-pressed={enabled} className={`relative h-8 w-14 rounded-full transition ${enabled ? "bg-fuchsia-400" : "bg-slate-700"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${enabled ? "left-7" : "left-1"}`} /></button>
          </div>
        </div>
        {selectedVenue ? <p className="mt-3 text-xs text-slate-500">Editing {selectedVenue.name} · {selectedVenue.neighborhood || selectedVenue.city} · Venue Index slug: {selectedVenue.slug}</p> : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.78fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 md:p-7">
          <div className="grid gap-5 md:grid-cols-2">
            <label className={labelClass}>Phone<input className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
            <label className={labelClass}>Menu URL<input className={fieldClass} value={menuUrl} onChange={(event) => setMenuUrl(event.target.value)} /></label>
            <label className={`${labelClass} md:col-span-2`}>Tagline<input className={fieldClass} value={tagline} onChange={(event) => setTagline(event.target.value)} /></label>
            <label className={`${labelClass} md:col-span-2`}>About<textarea className={`${fieldClass} min-h-28`} value={about} onChange={(event) => setAbout(event.target.value)} /></label>

            <VenueMediaLibrary slug={slug} heroUrl={heroImageUrl} heroAlt={heroImageAlt} gallery={gallery} onHeroChange={setHeroImageUrl} onGalleryChange={setGallery} />
            <label className={`${labelClass} md:col-span-2`}>Hero image alt text<input className={fieldClass} value={heroImageAlt} onChange={(event) => setHeroImageAlt(event.target.value)} placeholder="Describe the venue photo for accessibility" /></label>

            <section className="md:col-span-2 rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className={labelClass}>Good to Know</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Choose factual venue traits. These are not generated from Vibe Check feedback.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {VENUE_FACT_OPTIONS.map((fact) => {
                  const active = selectedFacts.has(fact);
                  return <button key={fact} type="button" onClick={() => toggleFact(fact)} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${active ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white"}`}>{fact}</button>;
                })}
              </div>
              <details className="mt-4"><summary className="cursor-pointer text-xs font-bold text-slate-500">Add custom facts</summary><textarea className={`${fieldClass} min-h-24`} value={amenities.join("\n")} onChange={(event) => setAmenities(event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} placeholder="One fact per line" /></details>
            </section>

            <SpecialEditor specials={weeklySpecials} onChange={setWeeklySpecials} />
            <DailyDealEditor deals={dailyDeals} onChange={setDailyDeals} />

            <details className="md:col-span-2 rounded-2xl border border-white/10 bg-black/15 p-4"><summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-slate-400">Advanced image fallback</summary><label className={`${labelClass} mt-4 block`}>External hero image URL<input className={fieldClass} value={heroImageUrl} onChange={(event) => setHeroImageUrl(event.target.value)} placeholder="Only when the image is not in Cloudinary" /></label></details>
          </div>
        </section>

        <aside className="self-start rounded-[2rem] border border-fuchsia-300/20 bg-[#081018] p-5 md:p-7 xl:sticky xl:top-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">{enabled ? "Ready to publish" : "Draft mode"}</p><h2 className="mt-2 text-2xl font-black text-white">{selectedVenue?.name || "Venue profile"}</h2></div><span className={`rounded-full px-3 py-1 text-xs font-black ${enabled ? "bg-emerald-300/15 text-emerald-200" : "bg-white/[0.06] text-slate-400"}`}>{enabled ? "LIVE" : "DRAFT"}</span></div>
          <p className="mt-3 text-sm leading-6 text-slate-400">Save media, facts, specials, and copy here. Turning Light Up off keeps the work saved without showing the enhanced layout publicly.</p>
          {heroImageUrl ? <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/25">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={heroImageUrl} alt={heroImageAlt || "Selected venue hero"} className="aspect-[16/9] w-full object-cover" /></div> : null}
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs"><div className="rounded-xl border border-white/10 p-3"><strong className="block text-lg text-white">{gallery.length}</strong><span className="text-slate-500">gallery photos</span></div><div className="rounded-xl border border-white/10 p-3"><strong className="block text-lg text-white">{weeklySpecials.length + dailyDeals.length}</strong><span className="text-slate-500">offers</span></div></div>
          {saveMessage ? <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">{saveMessage}</p> : null}
          <button type="button" onClick={saveProfile} disabled={saving || loading || !slug.trim()} className="mt-5 w-full rounded-full bg-[#ff2aa3] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff4bb2] disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Saving..." : enabled ? "Save + Publish" : "Save Draft"}</button>
          {enabled ? <a href={`/venues/${slug}`} target="_blank" rel="noreferrer" className="mt-3 block w-full rounded-full border border-cyan-300/30 px-5 py-3 text-center text-sm font-black text-cyan-100">Open live profile ↗</a> : null}
        </aside>
      </div>
    </div>
  );
}
