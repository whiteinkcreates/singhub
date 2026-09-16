"use client";

import { useMemo, useState } from "react";
import { VenueMediaLibrary } from "@/components/admin/VenueMediaLibrary";
import {
  VENUE_FACT_OPTIONS,
  type VenueEnhancement,
  type VenueGalleryItem,
} from "@/lib/venueEnhancements";

type VenueLightUpBuilderProps = {
  initialSlug: string;
  initialProfile: VenueEnhancement;
};

function listToText(values: string[]) {
  return values.join("\n");
}

export function VenueLightUpBuilder({ initialSlug, initialProfile }: VenueLightUpBuilderProps) {
  const [slug, setSlug] = useState(initialSlug);
  const [tagline, setTagline] = useState(initialProfile.tagline || "");
  const [about, setAbout] = useState(initialProfile.about || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [menuUrl, setMenuUrl] = useState(initialProfile.menuUrl || "");
  const [heroImageUrl, setHeroImageUrl] = useState(initialProfile.heroImageUrl || "");
  const [heroImageAlt, setHeroImageAlt] = useState(initialProfile.heroImageAlt || "");
  const [gallery, setGallery] = useState<VenueGalleryItem[]>(initialProfile.gallery);
  const [amenities, setAmenities] = useState(listToText(initialProfile.amenities));
  const [weeklySpecials, setWeeklySpecials] = useState(JSON.stringify(initialProfile.weeklySpecials, null, 2));
  const [dailyDeals, setDailyDeals] = useState(JSON.stringify(initialProfile.dailyDeals, null, 2));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const output = useMemo(() => {
    try {
      const profile: VenueEnhancement = {
        enabled: true,
        tagline: tagline.trim() || undefined,
        about: about.trim() || undefined,
        phone: phone.trim() || undefined,
        menuUrl: menuUrl.trim() || undefined,
        heroImageUrl: heroImageUrl.trim() || undefined,
        heroImageAlt: heroImageAlt.trim() || undefined,
        amenities: amenities.split("\n").map((item) => item.trim()).filter(Boolean),
        weeklySpecials: JSON.parse(weeklySpecials),
        dailyDeals: JSON.parse(dailyDeals),
        gallery,
      };
      return { valid: true as const, profile };
    } catch (error) {
      return {
        valid: false as const,
        error: error instanceof Error ? error.message : "One of the JSON fields is invalid.",
      };
    }
  }, [about, amenities, dailyDeals, gallery, heroImageAlt, heroImageUrl, menuUrl, phone, tagline, weeklySpecials]);

  function toggleFact(label: string) {
    const current = amenities.split("\n").map((item) => item.trim()).filter(Boolean);
    const next = current.includes(label)
      ? current.filter((item) => item !== label)
      : [...current, label];
    setAmenities(listToText(next));
  }

  async function saveProfile() {
    if (!output.valid || !slug.trim()) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/admin/venue-enhancements", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: slug.trim(), profile: output.profile }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Profile could not be saved.");
      setSaveMessage("Saved. The live venue profile will use these settings.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const selectedFacts = new Set(amenities.split("\n").map((item) => item.trim()).filter(Boolean));
  const fieldClass = "mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20";
  const labelClass = "text-xs font-black uppercase tracking-[0.16em] text-slate-400";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>Venue slug<input className={fieldClass} value={slug} onChange={(event) => setSlug(event.target.value)} /></label>
          <label className={labelClass}>Phone<input className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          <label className={`${labelClass} md:col-span-2`}>Tagline<input className={fieldClass} value={tagline} onChange={(event) => setTagline(event.target.value)} /></label>
          <label className={`${labelClass} md:col-span-2`}>About<textarea className={`${fieldClass} min-h-28`} value={about} onChange={(event) => setAbout(event.target.value)} /></label>
          <label className={`${labelClass} md:col-span-2`}>Menu URL<input className={fieldClass} value={menuUrl} onChange={(event) => setMenuUrl(event.target.value)} /></label>

          <VenueMediaLibrary
            slug={slug}
            heroUrl={heroImageUrl}
            heroAlt={heroImageAlt}
            gallery={gallery}
            onHeroChange={setHeroImageUrl}
            onGalleryChange={setGallery}
          />

          <label className={`${labelClass} md:col-span-2`}>Hero image alt text<input className={fieldClass} value={heroImageAlt} onChange={(event) => setHeroImageAlt(event.target.value)} placeholder="Describe the venue photo for accessibility" /></label>

          <section className="md:col-span-2 rounded-2xl border border-white/10 bg-black/15 p-4">
            <p className={labelClass}>Good to Know</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Choose the facts that should appear as venue information. These are set by SingHUB or the venue, not inferred from singer reviews.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {VENUE_FACT_OPTIONS.map((fact) => {
                const active = selectedFacts.has(fact);
                return (
                  <button
                    key={fact}
                    type="button"
                    onClick={() => toggleFact(fact)}
                    className={`rounded-full border px-3 py-2 text-xs font-bold transition ${active ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white"}`}
                  >
                    {fact}
                  </button>
                );
              })}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-bold text-slate-500">Custom facts</summary>
              <textarea className={`${fieldClass} min-h-28`} value={amenities} onChange={(event) => setAmenities(event.target.value)} placeholder="One fact per line" />
            </details>
          </section>

          <details className="md:col-span-2 rounded-2xl border border-white/10 bg-black/15 p-4">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-slate-400">Advanced image fallback</summary>
            <label className={`${labelClass} mt-4 block`}>External hero image URL<input className={fieldClass} value={heroImageUrl} onChange={(event) => setHeroImageUrl(event.target.value)} placeholder="Only use when the image is not in the SingHUB Cloudinary library" /></label>
          </details>

          <label className={`${labelClass} md:col-span-2`}>Weekly specials JSON<textarea className={`${fieldClass} min-h-72 font-mono text-xs`} value={weeklySpecials} onChange={(event) => setWeeklySpecials(event.target.value)} /></label>
          <label className={`${labelClass} md:col-span-2`}>Daily deals JSON<textarea className={`${fieldClass} min-h-56 font-mono text-xs`} value={dailyDeals} onChange={(event) => setDailyDeals(event.target.value)} /></label>
        </div>
      </section>

      <aside className="self-start rounded-[2rem] border border-fuchsia-300/20 bg-[#081018] p-5 md:p-7 xl:sticky xl:top-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Publish venue profile</p>
        <h2 className="mt-2 text-2xl font-black text-white">Save changes</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">Cloudinary media selections, Good to Know facts, specials, and profile copy are saved directly to the venue profile. No JSON copy step.</p>

        {heroImageUrl ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImageUrl} alt={heroImageAlt || "Selected venue hero"} className="aspect-[16/9] w-full object-cover" />
          </div>
        ) : null}

        {!output.valid ? <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{output.error}</p> : null}
        {saveMessage ? <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">{saveMessage}</p> : null}

        <button
          type="button"
          onClick={saveProfile}
          disabled={!output.valid || saving || !slug.trim()}
          className="mt-5 w-full rounded-full bg-[#ff2aa3] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff4bb2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </aside>
    </div>
  );
}
