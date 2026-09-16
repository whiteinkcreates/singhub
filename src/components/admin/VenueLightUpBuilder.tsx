"use client";

import { useMemo, useState } from "react";
import { VenueMediaLibrary } from "@/components/admin/VenueMediaLibrary";
import type { VenueEnhancement, VenueGalleryItem } from "@/lib/venueEnhancements";

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
  const [adminMediaKey, setAdminMediaKey] = useState("");
  const [copied, setCopied] = useState(false);

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
      return { valid: true as const, value: JSON.stringify({ [slug.trim() || "venue-slug"]: profile }, null, 2) };
    } catch (error) {
      return {
        valid: false as const,
        value: error instanceof Error ? error.message : "One of the JSON fields is invalid.",
      };
    }
  }, [about, amenities, dailyDeals, gallery, heroImageAlt, heroImageUrl, menuUrl, phone, slug, tagline, weeklySpecials]);

  async function copyOutput() {
    if (!output.valid) return;
    await navigator.clipboard.writeText(output.value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const fieldClass = "mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20";
  const labelClass = "text-xs font-black uppercase tracking-[0.16em] text-slate-400";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>Venue slug<input className={fieldClass} value={slug} onChange={(event) => setSlug(event.target.value)} /></label>
          <label className={labelClass}>Phone<input className={fieldClass} value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          <label className={`${labelClass} md:col-span-2`}>Tagline<input className={fieldClass} value={tagline} onChange={(event) => setTagline(event.target.value)} /></label>
          <label className={`${labelClass} md:col-span-2`}>About<textarea className={`${fieldClass} min-h-28`} value={about} onChange={(event) => setAbout(event.target.value)} /></label>
          <label className={`${labelClass} md:col-span-2`}>Menu URL<input className={fieldClass} value={menuUrl} onChange={(event) => setMenuUrl(event.target.value)} /></label>

          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-black/20 p-4">
            <label className={labelClass}>
              Admin media key
              <input
                type="password"
                value={adminMediaKey}
                onChange={(event) => setAdminMediaKey(event.target.value)}
                autoComplete="off"
                placeholder="Venue media key"
                className={fieldClass}
              />
            </label>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              The venue media endpoint accepts VENUE_MEDIA_UPLOAD_KEY, with the existing Daily Mic upload key as a fallback.
            </p>
          </div>

          <VenueMediaLibrary
            slug={slug}
            adminKey={adminMediaKey}
            heroUrl={heroImageUrl}
            heroAlt={heroImageAlt}
            gallery={gallery}
            onHeroChange={setHeroImageUrl}
            onGalleryChange={setGallery}
          />

          <label className={`${labelClass} md:col-span-2`}>Hero image alt text<input className={fieldClass} value={heroImageAlt} onChange={(event) => setHeroImageAlt(event.target.value)} placeholder="Describe the venue photo for accessibility" /></label>

          <details className="md:col-span-2 rounded-2xl border border-white/10 bg-black/15 p-4">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-slate-400">Advanced image fallback</summary>
            <label className={`${labelClass} mt-4 block`}>External hero image URL<input className={fieldClass} value={heroImageUrl} onChange={(event) => setHeroImageUrl(event.target.value)} placeholder="Only use when the image is not in the SingHUB Cloudinary library" /></label>
          </details>

          <label className={`${labelClass} md:col-span-2`}>Amenities, one per line<textarea className={`${fieldClass} min-h-32`} value={amenities} onChange={(event) => setAmenities(event.target.value)} /></label>
          <label className={`${labelClass} md:col-span-2`}>Weekly specials JSON<textarea className={`${fieldClass} min-h-72 font-mono text-xs`} value={weeklySpecials} onChange={(event) => setWeeklySpecials(event.target.value)} /></label>
          <label className={`${labelClass} md:col-span-2`}>Daily deals JSON<textarea className={`${fieldClass} min-h-56 font-mono text-xs`} value={dailyDeals} onChange={(event) => setDailyDeals(event.target.value)} /></label>
        </div>
      </section>

      <aside className="self-start rounded-[2rem] border border-fuchsia-300/20 bg-[#081018] p-5 md:p-7 xl:sticky xl:top-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Profile payload</p>
        <h2 className="mt-2 text-2xl font-black text-white">Ready for the data file</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Venue photos now stay in Cloudinary and are selected visually. The same structured profile still powers both the compact Venue Index card and the full Lit Up page.
        </p>

        <pre className={`mt-5 max-h-[42rem] overflow-auto rounded-2xl border p-4 text-xs leading-5 ${output.valid ? "border-white/10 bg-black/30 text-slate-300" : "border-red-400/30 bg-red-400/5 text-red-200"}`}>
          {output.value}
        </pre>

        <button
          type="button"
          onClick={copyOutput}
          disabled={!output.valid}
          className="mt-4 w-full rounded-full bg-[#ff2aa3] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff4bb2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? "Copied" : "Copy profile JSON"}
        </button>
      </aside>
    </div>
  );
}
