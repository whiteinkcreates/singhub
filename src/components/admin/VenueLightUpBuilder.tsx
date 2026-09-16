"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { VenueMediaLibrary } from "@/components/admin/VenueMediaLibrary";
import { VenueTag } from "@/components/venue/VenueTag";
import {
  EMPTY_VENUE_ENHANCEMENT,
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
  profileTier: string;
};

type VenueLightUpBuilderProps = {
  initialSlug: string;
  initialProfile: VenueEnhancement;
  venues: VenueOption[];
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function normalizeProfile(profile?: VenueEnhancement | null): VenueEnhancement {
  return {
    ...EMPTY_VENUE_ENHANCEMENT,
    ...(profile || {}),
    gallery: profile?.gallery || [],
    amenities: profile?.amenities || [],
    weeklySpecials: profile?.weeklySpecials || [],
    dailyDeals: profile?.dailyDeals || [],
  };
}

function FactsPicker({ values, onChange }: { values: string[]; onChange: (values: string[]) => void }) {
  const selected = new Set(values);
  function toggle(label: string) {
    onChange(selected.has(label) ? values.filter((item) => item !== label) : [...values, label]);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Good to Know</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">These are venue facts chosen by SingHUB or the venue. They do not come from singer feedback.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {VENUE_FACT_OPTIONS.map((fact) => {
          const active = selected.has(fact);
          return (
            <button key={fact} type="button" onClick={() => toggle(fact)} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${active ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white"}`}>
              {fact}
            </button>
          );
        })}
      </div>
      <details className="mt-4">
        <summary className="cursor-pointer text-xs font-bold text-slate-500">Custom fact</summary>
        <div className="mt-3 flex gap-2">
          <input id="custom-venue-fact" placeholder="e.g. Dog-friendly patio" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50" />
          <button type="button" onClick={() => {
            const input = document.getElementById("custom-venue-fact") as HTMLInputElement | null;
            const value = input?.value.trim();
            if (value && !selected.has(value)) onChange([...values, value]);
            if (input) input.value = "";
          }} className="rounded-xl border border-white/15 px-4 py-2 text-xs font-black text-white">Add</button>
        </div>
        {values.filter((value) => !VENUE_FACT_OPTIONS.includes(value as (typeof VENUE_FACT_OPTIONS)[number])).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {values.filter((value) => !VENUE_FACT_OPTIONS.includes(value as (typeof VENUE_FACT_OPTIONS)[number])).map((value) => (
              <button key={value} type="button" onClick={() => toggle(value)} className="rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-2 text-xs font-bold text-violet-100">{value} ×</button>
            ))}
          </div>
        )}
      </details>
    </section>
  );
}

function WeeklySpecialsEditor({ values, onChange }: { values: VenueSpecial[]; onChange: (values: VenueSpecial[]) => void }) {
  function update(index: number, patch: Partial<VenueSpecial>) {
    onChange(values.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }
  return (
    <section className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Weekly Specials</p><p className="mt-1 text-sm text-slate-500">Add only what you actually want singers to see.</p></div>
        <button type="button" onClick={() => onChange([...values, { day: "Friday", title: "" }])} className="rounded-xl border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-2 text-xs font-black text-fuchsia-100">+ Add special</button>
      </div>
      <div className="mt-4 grid gap-3">
        {values.map((item, index) => (
          <div key={`${index}-${item.day}-${item.title}`} className="grid gap-2 rounded-2xl border border-white/10 bg-slate-950/55 p-3 md:grid-cols-[130px_1.4fr_100px_1.2fr_auto] md:items-center">
            <select value={item.day} onChange={(event) => update(index, { day: event.target.value })} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white">{DAYS.map((day) => <option key={day}>{day}</option>)}</select>
            <input value={item.title} onChange={(event) => update(index, { title: event.target.value })} placeholder="Special name" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <input value={item.price || ""} onChange={(event) => update(index, { price: event.target.value || undefined })} placeholder="$" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <input value={item.detail || ""} onChange={(event) => update(index, { detail: event.target.value || undefined })} placeholder="Short detail" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl border border-rose-300/20 px-3 py-2 text-xs font-black text-rose-200">×</button>
          </div>
        ))}
        {values.length === 0 && <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">No weekly specials added.</p>}
      </div>
    </section>
  );
}

function DailyDealsEditor({ values, onChange }: { values: VenueDailyDeal[]; onChange: (values: VenueDailyDeal[]) => void }) {
  function update(index: number, patch: Partial<VenueDailyDeal>) {
    onChange(values.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }
  return (
    <section className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Everyday Deals</p><p className="mt-1 text-sm text-slate-500">Deals that are not tied to one weekday.</p></div>
        <button type="button" onClick={() => onChange([...values, { title: "" }])} className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-black text-cyan-100">+ Add deal</button>
      </div>
      <div className="mt-4 grid gap-3">
        {values.map((item, index) => (
          <div key={`${index}-${item.title}`} className="grid gap-2 rounded-2xl border border-white/10 bg-slate-950/55 p-3 md:grid-cols-[1.3fr_100px_1.5fr_auto] md:items-center">
            <input value={item.title} onChange={(event) => update(index, { title: event.target.value })} placeholder="Deal name" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <input value={item.price || ""} onChange={(event) => update(index, { price: event.target.value || undefined })} placeholder="$" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <input value={item.detail || ""} onChange={(event) => update(index, { detail: event.target.value || undefined })} placeholder="Short detail" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" />
            <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl border border-rose-300/20 px-3 py-2 text-xs font-black text-rose-200">×</button>
          </div>
        ))}
        {values.length === 0 && <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">No everyday deals added.</p>}
      </div>
    </section>
  );
}

export function VenueLightUpBuilder({ initialSlug, initialProfile, venues }: VenueLightUpBuilderProps) {
  const starting = normalizeProfile(initialProfile);
  const [slug, setSlug] = useState(initialSlug);
  const [enabled, setEnabled] = useState(starting.enabled);
  const [tagline, setTagline] = useState(starting.tagline || "");
  const [about, setAbout] = useState(starting.about || "");
  const [phone, setPhone] = useState(starting.phone || "");
  const [menuUrl, setMenuUrl] = useState(starting.menuUrl || "");
  const [heroImageUrl, setHeroImageUrl] = useState(starting.heroImageUrl || "");
  const [heroImageAlt, setHeroImageAlt] = useState(starting.heroImageAlt || "");
  const [logoImageUrl, setLogoImageUrl] = useState(starting.logoImageUrl || "");
  const [logoImageAlt, setLogoImageAlt] = useState(starting.logoImageAlt || "");
  const [gallery, setGallery] = useState<VenueGalleryItem[]>(starting.gallery);
  const [amenities, setAmenities] = useState<string[]>(starting.amenities);
  const [weeklySpecials, setWeeklySpecials] = useState<VenueSpecial[]>(starting.weeklySpecials);
  const [dailyDeals, setDailyDeals] = useState<VenueDailyDeal[]>(starting.dailyDeals);
  const [loadingVenue, setLoadingVenue] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const selectedVenue = venues.find((venue) => venue.slug === slug);

  function applyProfile(profile?: VenueEnhancement | null) {
    const next = normalizeProfile(profile);
    setEnabled(next.enabled);
    setTagline(next.tagline || "");
    setAbout(next.about || "");
    setPhone(next.phone || "");
    setMenuUrl(next.menuUrl || "");
    setHeroImageUrl(next.heroImageUrl || "");
    setHeroImageAlt(next.heroImageAlt || "");
    setLogoImageUrl(next.logoImageUrl || "");
    setLogoImageAlt(next.logoImageAlt || "");
    setGallery(next.gallery);
    setAmenities(next.amenities);
    setWeeklySpecials(next.weeklySpecials);
    setDailyDeals(next.dailyDeals);
  }

  async function changeVenue(nextSlug: string) {
    setSlug(nextSlug);
    setSaveMessage(null);
    if (!nextSlug) return;
    setLoadingVenue(true);
    try {
      const response = await fetch(`/api/admin/venue-enhancements?slug=${encodeURIComponent(nextSlug)}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not load venue profile.");
      applyProfile(payload.profile);
    } catch (error) {
      applyProfile(null);
      setSaveMessage(error instanceof Error ? error.message : "Could not load venue profile.");
    } finally {
      setLoadingVenue(false);
    }
  }

  const profile = useMemo<VenueEnhancement>(() => ({
    enabled,
    tagline: tagline.trim() || undefined,
    about: about.trim() || undefined,
    phone: phone.trim() || undefined,
    menuUrl: menuUrl.trim() || undefined,
    heroImageUrl: heroImageUrl.trim() || undefined,
    heroImageAlt: heroImageAlt.trim() || undefined,
    logoImageUrl: logoImageUrl.trim() || undefined,
    logoImageAlt: logoImageAlt.trim() || undefined,
    gallery,
    amenities,
    weeklySpecials: weeklySpecials.filter((item) => item.title.trim()),
    dailyDeals: dailyDeals.filter((item) => item.title.trim()),
  }), [about, amenities, dailyDeals, enabled, gallery, heroImageAlt, heroImageUrl, logoImageAlt, logoImageUrl, menuUrl, phone, tagline, weeklySpecials]);

  async function saveProfile() {
    if (!slug.trim()) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch("/api/admin/venue-enhancements", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, profile }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Profile could not be saved.");
      setSaveMessage(enabled ? "Saved and live." : "Saved as a draft. The enhanced profile is not public.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const completenessChecks = [heroImageUrl, tagline, about, phone || menuUrl, amenities.length > 0, weeklySpecials.length > 0 || dailyDeals.length > 0];
  const completeness = Math.round((completenessChecks.filter(Boolean).length / completenessChecks.length) * 100);
  const fieldClass = "mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20";
  const labelClass = "text-xs font-black uppercase tracking-[0.16em] text-slate-400";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 md:p-7">
        <div className="rounded-[1.5rem] border border-fuchsia-300/20 bg-[linear-gradient(135deg,rgba(236,72,153,.10),rgba(8,16,24,.9)_55%,rgba(34,211,238,.08))] p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className={labelClass}>Venue
              <select value={slug} onChange={(event) => void changeVenue(event.target.value)} className={fieldClass} disabled={loadingVenue}>
                {venues.map((venue) => <option key={venue.slug} value={venue.slug}>{venue.name}{venue.neighborhood ? ` · ${venue.neighborhood}` : ""}</option>)}
              </select>
            </label>
            <div className="min-w-56 rounded-2xl border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Enhanced profile</p><p className={`mt-1 text-sm font-bold ${enabled ? "text-cyan-100" : "text-slate-500"}`}>{enabled ? "Live" : "Draft / Off"}</p></div>
                <button type="button" role="switch" aria-checked={enabled} onClick={() => setEnabled((value) => !value)} className={`relative h-8 w-14 rounded-full border transition ${enabled ? "border-cyan-300/60 bg-cyan-300/25" : "border-white/15 bg-white/[0.04]"}`}><span className={`absolute top-1 h-6 w-6 rounded-full transition ${enabled ? "left-7 bg-cyan-200" : "left-1 bg-slate-500"}`} /></button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Turning this off keeps all profile content saved but returns the public venue to its standard indexed presentation.</p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className={labelClass}>Phone<input className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          <label className={labelClass}>Menu URL<input className={fieldClass} value={menuUrl} onChange={(event) => setMenuUrl(event.target.value)} /></label>
          <label className={`${labelClass} md:col-span-2`}>Tagline<input className={fieldClass} value={tagline} onChange={(event) => setTagline(event.target.value)} placeholder="Why choose this place?" /></label>
          <label className={`${labelClass} md:col-span-2`}>About<textarea className={`${fieldClass} min-h-28`} value={about} onChange={(event) => setAbout(event.target.value)} /></label>

          <VenueMediaLibrary slug={slug} heroUrl={heroImageUrl} heroAlt={heroImageAlt} logoUrl={logoImageUrl} gallery={gallery} onHeroChange={setHeroImageUrl} onLogoChange={setLogoImageUrl} onGalleryChange={setGallery} />

          <label className={labelClass}>Hero alt text<input className={fieldClass} value={heroImageAlt} onChange={(event) => setHeroImageAlt(event.target.value)} placeholder="Describe the venue photo" /></label>
          <label className={labelClass}>Logo alt text<input className={fieldClass} value={logoImageAlt} onChange={(event) => setLogoImageAlt(event.target.value)} placeholder={`${selectedVenue?.name || "Venue"} logo`} /></label>

          <div className="md:col-span-2"><FactsPicker values={amenities} onChange={setAmenities} /></div>
          <div className="md:col-span-2"><WeeklySpecialsEditor values={weeklySpecials} onChange={setWeeklySpecials} /></div>
          <div className="md:col-span-2"><DailyDealsEditor values={dailyDeals} onChange={setDailyDeals} /></div>
        </div>
      </section>

      <aside className="self-start rounded-[2rem] border border-fuchsia-300/20 bg-[#081018] p-5 md:p-7 xl:sticky xl:top-6">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Venue preview</p><h2 className="mt-2 text-2xl font-black text-white">{selectedVenue?.name || "Select a venue"}</h2></div>
          <span className={`rounded-full border px-3 py-1 text-xs font-black ${enabled ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-slate-500"}`}>{enabled ? "LIVE" : "DRAFT"}</span>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0b1118]">
          <div className="relative aspect-[16/9] bg-slate-900">
            {heroImageUrl ? <img src={heroImageUrl} alt={heroImageAlt || "Venue hero preview"} className="absolute inset-0 h-full w-full object-cover opacity-60" /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1118] via-[#0b1118]/25 to-transparent" />
            {logoImageUrl ? <img src={logoImageUrl} alt={logoImageAlt || "Venue logo preview"} className="absolute right-4 top-4 h-16 w-16 rounded-full border-2 border-cyan-200 bg-black/70 object-contain p-2" /> : null}
            <div className="absolute inset-x-0 bottom-0 p-4"><VenueTag label="Karaoke" accent="pink" /></div>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-black text-white">{selectedVenue?.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{selectedVenue?.neighborhood}</p>
            {tagline ? <p className="mt-3 text-sm leading-6 text-slate-200">{tagline}</p> : null}
            {amenities.length > 0 ? <div className="mt-4 flex flex-wrap gap-2">{amenities.slice(0, 4).map((item) => <VenueTag key={item} label={item} />)}</div> : null}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400"><span>Profile completeness</span><span>{completeness}%</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300" style={{ width: `${completeness}%` }} /></div>
        </div>

        {saveMessage ? <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">{saveMessage}</p> : null}

        <button type="button" onClick={saveProfile} disabled={saving || loadingVenue || !slug} className="mt-5 w-full rounded-full bg-[#ff2aa3] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff4bb2] disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Saving..." : enabled ? "Save + Publish" : "Save Draft"}</button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href={`/venues/${slug}`} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-3 text-center text-xs font-black text-white">Open profile</a>
          <a href="/find-karaoke" target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-3 text-center text-xs font-black text-white">List view</a>
        </div>
      </aside>
    </div>
  );
}
