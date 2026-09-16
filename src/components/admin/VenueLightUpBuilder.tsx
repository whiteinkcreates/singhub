"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { VenueMediaLibrary } from "@/components/admin/VenueMediaLibrary";
import {
  VENUE_FACT_OPTIONS,
  type HeroPosition,
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
  address: string;
  profileTier: string;
  isFeatured: boolean;
  featuredPriority?: number;
};

type VenueLightUpBuilderProps = {
  initialSlug: string;
  initialProfile: VenueEnhancement;
  venues: VenueOption[];
};

type PreviewMode = "list" | "open";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function emptyProfile(featured = false, featuredPriority?: number): VenueEnhancement {
  return {
    enabled: false,
    featured,
    featuredPriority,
    tagline: "",
    about: "",
    phone: "",
    menuUrl: "",
    heroImageUrl: "",
    heroImageAlt: "",
    heroPosition: "center",
    logoImageUrl: "",
    logoImageAlt: "",
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
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Weekly specials</p><p className="mt-1 text-sm text-slate-500">Add the offers singers should see by day.</p></div>
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

function AdminPreview({ venue, profile, mode }: { venue?: VenueOption; profile: VenueEnhancement; mode: PreviewMode }) {
  if (!venue) return <div className="rounded-2xl border border-white/10 p-5 text-sm text-slate-500">Choose a venue to preview it.</div>;
  const heroPosition = profile.heroPosition || "center";
  const hero = profile.heroImageUrl;
  const tags = profile.amenities.slice(0, 3);

  if (mode === "list") {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1118] shadow-xl shadow-black/20">
        <div className="relative h-40 overflow-hidden bg-slate-950">
          {hero ? <img src={hero} alt={profile.heroImageAlt || "Preview hero"} className="h-full w-full object-cover opacity-55" style={{ objectPosition: heroPosition }} /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1118] via-[#0b1118]/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-4"><span className="rounded-full bg-[#ff2aa3] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">Karaoke</span>{profile.featured ? <span className="rounded-full border border-violet-300/50 bg-violet-300/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-violet-100">Featured</span> : null}</div>
        </div>
        <div className="p-4"><h3 className="text-xl font-black text-white">{venue.name}</h3><p className="mt-1 text-xs text-slate-400">{venue.neighborhood || venue.city}</p>{profile.tagline ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-200">{profile.tagline}</p> : null}{tags.length ? <div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-300">{tag}</span>)}</div> : null}</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#071019]">
      <div className="relative h-56 overflow-hidden bg-slate-950">
        {hero ? <img src={hero} alt={profile.heroImageAlt || "Preview hero"} className="h-full w-full object-cover" style={{ objectPosition: heroPosition }} /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071019] via-transparent to-black/15" />
        <div className="absolute bottom-4 left-4 flex gap-2"><span className="rounded-full bg-[#ff2aa3] px-3 py-1 text-[10px] font-black uppercase text-white">Karaoke</span>{profile.featured ? <span className="rounded-full border border-violet-300/50 bg-black/45 px-3 py-1 text-[10px] font-black uppercase text-violet-100">Featured</span> : null}</div>
      </div>
      <div className="relative p-4">
        {profile.logoImageUrl ? <div className="absolute -top-10 right-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-300/60 bg-[#071019] p-2"><img src={profile.logoImageUrl} alt={profile.logoImageAlt || "Venue logo preview"} className="h-full w-full object-contain" /></div> : null}
        <h3 className="pr-24 text-2xl font-black text-white">{venue.name}</h3><p className="mt-1 text-xs text-slate-400">{venue.neighborhood || venue.city}</p>{profile.tagline ? <p className="mt-3 text-sm leading-6 text-slate-200">{profile.tagline}</p> : null}
        <div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-xl border border-fuchsia-300/25 p-2 text-center text-[10px] font-black text-fuchsia-100">Directions</div>{profile.phone ? <div className="rounded-xl border border-white/10 p-2 text-center text-[10px] font-black text-slate-200">Call</div> : null}{profile.menuUrl ? <div className="rounded-xl border border-white/10 p-2 text-center text-[10px] font-black text-slate-200">Menu</div> : null}</div>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-300">Tonight at {venue.name}</p><p className="mt-2 text-xs text-slate-400">Live profile uses the canonical karaoke schedule plus today&apos;s saved specials.</p></div>
      </div>
    </div>
  );
}

export function VenueLightUpBuilder({ initialSlug, initialProfile, venues }: VenueLightUpBuilderProps) {
  const initialVenue = venues.find((venue) => venue.slug === initialSlug);
  const [slug, setSlug] = useState(initialSlug);
  const [enabled, setEnabled] = useState(initialProfile.enabled);
  const [featured, setFeatured] = useState(initialProfile.featured ?? initialVenue?.isFeatured ?? false);
  const [featuredPriority, setFeaturedPriority] = useState(initialProfile.featuredPriority ?? initialVenue?.featuredPriority ?? 10);
  const [tagline, setTagline] = useState(initialProfile.tagline || "");
  const [about, setAbout] = useState(initialProfile.about || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [menuUrl, setMenuUrl] = useState(initialProfile.menuUrl || "");
  const [heroImageUrl, setHeroImageUrl] = useState(initialProfile.heroImageUrl || "");
  const [heroImageAlt, setHeroImageAlt] = useState(initialProfile.heroImageAlt || "");
  const [heroPosition, setHeroPosition] = useState<HeroPosition>(initialProfile.heroPosition || "center");
  const [logoImageUrl, setLogoImageUrl] = useState(initialProfile.logoImageUrl || "");
  const [logoImageAlt, setLogoImageAlt] = useState(initialProfile.logoImageAlt || "");
  const [gallery, setGallery] = useState<VenueGalleryItem[]>(initialProfile.gallery || []);
  const [amenities, setAmenities] = useState(initialProfile.amenities || []);
  const [weeklySpecials, setWeeklySpecials] = useState<VenueSpecial[]>(initialProfile.weeklySpecials || []);
  const [dailyDeals, setDailyDeals] = useState<VenueDailyDeal[]>(initialProfile.dailyDeals || []);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("open");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const selectedVenue = venues.find((venue) => venue.slug === slug);
  const selectedFacts = new Set(amenities);

  function applyProfile(profile: VenueEnhancement, venue = selectedVenue) {
    setEnabled(profile.enabled);
    setFeatured(profile.featured ?? venue?.isFeatured ?? false);
    setFeaturedPriority(profile.featuredPriority ?? venue?.featuredPriority ?? 10);
    setTagline(profile.tagline || "");
    setAbout(profile.about || "");
    setPhone(profile.phone || "");
    setMenuUrl(profile.menuUrl || "");
    setHeroImageUrl(profile.heroImageUrl || "");
    setHeroImageAlt(profile.heroImageAlt || "");
    setHeroPosition(profile.heroPosition || "center");
    setLogoImageUrl(profile.logoImageUrl || "");
    setLogoImageAlt(profile.logoImageAlt || "");
    setGallery(profile.gallery || []);
    setAmenities(profile.amenities || []);
    setWeeklySpecials(profile.weeklySpecials || []);
    setDailyDeals(profile.dailyDeals || []);
  }

  async function selectVenue(nextSlug: string) {
    const nextVenue = venues.find((venue) => venue.slug === nextSlug);
    setSlug(nextSlug);
    setSaveMessage(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/venue-enhancements?slug=${encodeURIComponent(nextSlug)}`, { cache: "no-store" });
      if (response.status === 404) {
        applyProfile(emptyProfile(nextVenue?.isFeatured ?? false, nextVenue?.featuredPriority), nextVenue);
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load venue profile.");
      applyProfile(result.profile as VenueEnhancement, nextVenue);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Could not load venue profile.");
      applyProfile(emptyProfile(nextVenue?.isFeatured ?? false, nextVenue?.featuredPriority), nextVenue);
    } finally {
      setLoading(false);
    }
  }

  const output = useMemo<VenueEnhancement>(() => ({
    enabled,
    featured,
    featuredPriority: featured ? Math.max(1, Math.min(99, featuredPriority || 10)) : undefined,
    tagline: tagline.trim() || undefined,
    about: about.trim() || undefined,
    phone: phone.trim() || undefined,
    menuUrl: menuUrl.trim() || undefined,
    heroImageUrl: heroImageUrl.trim() || undefined,
    heroImageAlt: heroImageAlt.trim() || undefined,
    heroPosition,
    logoImageUrl: logoImageUrl.trim() || undefined,
    logoImageAlt: logoImageAlt.trim() || undefined,
    amenities,
    weeklySpecials: weeklySpecials.filter((special) => special.title.trim()),
    dailyDeals: dailyDeals.filter((deal) => deal.title.trim()),
    gallery,
  }), [about, amenities, dailyDeals, enabled, featured, featuredPriority, gallery, heroImageAlt, heroImageUrl, heroPosition, logoImageAlt, logoImageUrl, menuUrl, phone, tagline, weeklySpecials]);

  const completionChecks = useMemo(() => [
    { label: "Hero + alt text", done: Boolean(heroImageUrl.trim() && heroImageAlt.trim()) },
    { label: "Tagline", done: Boolean(tagline.trim()) },
    { label: "About", done: about.trim().length >= 40 },
    { label: "Good to Know", done: amenities.length > 0 },
    { label: "Offers", done: weeklySpecials.some((item) => item.title.trim()) || dailyDeals.some((item) => item.title.trim()) },
    { label: "Gallery", done: gallery.length > 0 },
    { label: "Useful CTA", done: Boolean(phone.trim() || menuUrl.trim()) },
  ], [about, amenities.length, dailyDeals, gallery.length, heroImageAlt, heroImageUrl, menuUrl, phone, tagline, weeklySpecials]);
  const completedCount = completionChecks.filter((item) => item.done).length;
  const completionPercent = Math.round((completedCount / completionChecks.length) * 100);

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
      const status = enabled ? "Saved and live." : "Saved as a draft. Light Up is off.";
      setSaveMessage(featured ? `${status} Featured priority ${output.featuredPriority}.` : status);
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
        <div className="grid gap-5 xl:grid-cols-[1fr_auto_auto] xl:items-end">
          <label className={labelClass}>Venue
            <select value={slug} disabled={loading} onChange={(event) => void selectVenue(event.target.value)} className={`${fieldClass} min-w-0 xl:min-w-[30rem]`}>
              {venues.map((venue) => <option key={venue.slug} value={venue.slug}>{venue.name} · {venue.neighborhood || venue.city}</option>)}
            </select>
          </label>
          <div className="flex min-w-64 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-3">
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Light Up</p><p className="mt-1 text-sm font-bold text-white">{enabled ? "Enhanced profile live" : "Draft / standard listing"}</p></div>
            <button type="button" onClick={() => setEnabled((current) => !current)} aria-pressed={enabled} className={`relative h-8 w-14 shrink-0 rounded-full transition ${enabled ? "bg-fuchsia-400" : "bg-slate-700"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${enabled ? "left-7" : "left-1"}`} /></button>
          </div>
          <div className="min-w-64 rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Featured</p><p className="mt-1 text-sm font-bold text-white">{featured ? "Extra placement on" : "Normal placement"}</p></div><button type="button" onClick={() => setFeatured((current) => !current)} aria-pressed={featured} className={`relative h-8 w-14 shrink-0 rounded-full transition ${featured ? "bg-violet-400" : "bg-slate-700"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${featured ? "left-7" : "left-1"}`} /></button></div>
            {featured ? <label className="mt-3 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Priority <span className="normal-case tracking-normal text-slate-600">1 = highest</span><input type="number" min={1} max={99} value={featuredPriority} onChange={(event) => setFeaturedPriority(Number(event.target.value) || 10)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white" /></label> : null}
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

            <VenueMediaLibrary slug={slug} heroUrl={heroImageUrl} heroAlt={heroImageAlt} heroPosition={heroPosition} logoUrl={logoImageUrl} logoAlt={logoImageAlt} gallery={gallery} onHeroChange={setHeroImageUrl} onHeroPositionChange={setHeroPosition} onLogoChange={setLogoImageUrl} onGalleryChange={setGallery} />
            <label className={labelClass}>Hero image alt text<input className={fieldClass} value={heroImageAlt} onChange={(event) => setHeroImageAlt(event.target.value)} placeholder="Describe the hero photo" /></label>
            <label className={labelClass}>Logo / mark alt text<input className={fieldClass} value={logoImageAlt} onChange={(event) => setLogoImageAlt(event.target.value)} placeholder="Venue logo or mark" /></label>

            <section className="md:col-span-2 rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className={labelClass}>Good to Know</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Choose factual venue traits. These are separate from Singers Say.</p>
              <div className="mt-4 flex flex-wrap gap-2">{VENUE_FACT_OPTIONS.map((fact) => { const active = selectedFacts.has(fact); return <button key={fact} type="button" onClick={() => toggleFact(fact)} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${active ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white"}`}>{fact}</button>; })}</div>
              <details className="mt-4"><summary className="cursor-pointer text-xs font-bold text-slate-500">Add custom facts</summary><textarea className={`${fieldClass} min-h-24`} value={amenities.join("\n")} onChange={(event) => setAmenities(event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} placeholder="One fact per line" /></details>
            </section>

            <SpecialEditor specials={weeklySpecials} onChange={setWeeklySpecials} />
            <DailyDealEditor deals={dailyDeals} onChange={setDailyDeals} />

            <details className="md:col-span-2 rounded-2xl border border-white/10 bg-black/15 p-4"><summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-slate-400">Advanced image fallback</summary><div className="mt-4 grid gap-4 md:grid-cols-2"><label className={labelClass}>External hero image URL<input className={fieldClass} value={heroImageUrl} onChange={(event) => setHeroImageUrl(event.target.value)} placeholder="Only when not in Cloudinary" /></label><label className={labelClass}>External logo image URL<input className={fieldClass} value={logoImageUrl} onChange={(event) => setLogoImageUrl(event.target.value)} placeholder="Only when not in Cloudinary" /></label></div></details>
          </div>
        </section>

        <aside className="self-start space-y-4 xl:sticky xl:top-6">
          <section className="rounded-[2rem] border border-fuchsia-300/20 bg-[#081018] p-5 md:p-6">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Profile readiness</p><h2 className="mt-2 text-2xl font-black text-white">{completionPercent}% complete</h2></div><span className={`rounded-full px-3 py-1 text-xs font-black ${enabled ? "bg-emerald-300/15 text-emerald-200" : "bg-white/[0.06] text-slate-400"}`}>{enabled ? "LIVE" : "DRAFT"}</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 transition-all" style={{ width: `${completionPercent}%` }} /></div>
            <div className="mt-4 grid grid-cols-2 gap-2">{completionChecks.map((item) => <div key={item.label} className={`rounded-xl border px-3 py-2 text-xs font-bold ${item.done ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100" : "border-white/10 text-slate-500"}`}>{item.done ? "✓" : "○"} {item.label}</div>)}</div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#081018] p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Preview</p><h2 className="mt-1 text-xl font-black text-white">Before you publish</h2></div><div className="flex rounded-full border border-white/10 bg-black/20 p-1"><button type="button" onClick={() => setPreviewMode("list")} className={`rounded-full px-3 py-1.5 text-xs font-black ${previewMode === "list" ? "bg-cyan-300 text-slate-950" : "text-slate-400"}`}>List</button><button type="button" onClick={() => setPreviewMode("open")} className={`rounded-full px-3 py-1.5 text-xs font-black ${previewMode === "open" ? "bg-fuchsia-300 text-slate-950" : "text-slate-400"}`}>Open</button></div></div>
            <div className="mt-4"><AdminPreview venue={selectedVenue} profile={output} mode={previewMode} /></div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#081018] p-5 md:p-6">
            {saveMessage ? <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">{saveMessage}</p> : null}
            <button type="button" onClick={saveProfile} disabled={saving || loading || !slug.trim()} className="w-full rounded-full bg-[#ff2aa3] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff4bb2] disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Saving..." : enabled ? "Save + Publish" : "Save Draft"}</button>
            {enabled ? <a href={`/venues/${slug}`} target="_blank" rel="noreferrer" className="mt-3 block w-full rounded-full border border-cyan-300/30 px-5 py-3 text-center text-sm font-black text-cyan-100">Open live profile ↗</a> : null}
          </section>
        </aside>
      </div>
    </div>
  );
}
