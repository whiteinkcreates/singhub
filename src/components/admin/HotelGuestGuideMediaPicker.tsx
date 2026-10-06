"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlacementEditor } from "@/components/admin/ImagePlacementEditor";
import { MediaImagePreview } from "@/components/admin/MediaImagePreview";
import type { HotelMediaProfile } from "@/lib/hotelProfiles";
import type { VenueMediaAsset } from "@/lib/venueMediaCloudinary";

type Props = { slug: string; profile: HotelMediaProfile; onChange: (patch: Partial<HotelMediaProfile>) => void; };
type Slot = "walkable" | "quickRide" | "standout";
const META: Record<Slot, { label: string; urlKey: keyof HotelMediaProfile; altKey: keyof HotelMediaProfile; placementKey: keyof HotelMediaProfile }> = {
  walkable: { label: "Walkable image", urlKey: "walkableImageUrl", altKey: "walkableImageAlt", placementKey: "walkableImagePlacement" },
  quickRide: { label: "Quick Ride image", urlKey: "quickRideImageUrl", altKey: "quickRideImageAlt", placementKey: "quickRideImagePlacement" },
  standout: { label: "Local Standouts image", urlKey: "standoutImageUrl", altKey: "standoutImageAlt", placementKey: "standoutImagePlacement" },
};

export function HotelGuestGuideMediaPicker({ slug, profile, onChange }: Props) {
  const [assets, setAssets] = useState<VenueMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    if (!slug) return;
    setLoading(true); setMessage("Loading hotel media library…");
    try {
      const response = await fetch("/api/admin/hotel-media?slug=" + encodeURIComponent(slug), { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not load hotel media.");
      setAssets(payload.assets || []);
      setMessage(payload.assets?.length ? payload.assets.length + " hotel images available." : "Upload hotel images above, then refresh this picker.");
    } catch (error) { setAssets([]); setMessage(error instanceof Error ? error.message : "Could not load hotel media."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [slug]);

  const selected = useMemo(() => new Set([profile.walkableImageUrl, profile.quickRideImageUrl, profile.standoutImageUrl].filter(Boolean)), [profile]);

  function setSlot(slot: Slot, url: string) {
    const meta = META[slot];
    onChange({ [meta.urlKey]: url, [meta.altKey]: url ? meta.label.replace(" image", "") + " guest guide lifestyle photo" : "", [meta.placementKey]: undefined } as Partial<HotelMediaProfile>);
  }

  return <section className="rounded-[1.6rem] border border-cyan-300/15 bg-[#07131a] p-4 md:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Guest Guide media pickers</p><h2 className="mt-1 text-xl font-black text-white">Section lifestyle images</h2><p className="mt-2 max-w-2xl text-sm text-slate-400">Assign one image to each section. The public template alternates them right, left, right and uses them as swipe/tap reveal panels.</p></div><button type="button" onClick={() => void load()} disabled={loading} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white disabled:opacity-40">{loading ? "Loading…" : "Refresh library"}</button></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-3">{(Object.keys(META) as Slot[]).map((slot) => {
      const meta = META[slot]; const url = String(profile[meta.urlKey] || ""); const alt = String(profile[meta.altKey] || ""); const placement = profile[meta.placementKey] as HotelMediaProfile["walkableImagePlacement"];
      return <div key={slot} className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">{url ? <><ImagePlacementEditor src={url} alt={alt || meta.label} label={meta.label} value={placement} onChange={(next) => onChange({ [meta.placementKey]: next } as Partial<HotelMediaProfile>)} /><div className="grid gap-2 p-3"><input value={alt} onChange={(event) => onChange({ [meta.altKey]: event.target.value } as Partial<HotelMediaProfile>)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white" placeholder="Image description" /><button type="button" onClick={() => setSlot(slot, "")} className="rounded-xl border border-rose-300/20 px-3 py-2 text-xs font-black text-rose-200">Clear {meta.label}</button></div></> : <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-slate-600">No {meta.label.toLowerCase()} selected</div>}</div>;
    })}</div>
    <p className="mt-4 text-xs font-semibold text-cyan-100" aria-live="polite">{message}</p>
    {assets.length > 0 ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{assets.map((asset) => <div key={asset.publicId} className={"overflow-hidden rounded-2xl border bg-black/25 " + (selected.has(asset.url) ? "border-cyan-300/60" : "border-white/10")}><div className="aspect-square overflow-hidden bg-black/30"><MediaImagePreview src={asset.url} alt="Hotel media option" className="h-full w-full object-cover" /></div><div className="grid gap-1.5 p-2">{(Object.keys(META) as Slot[]).map((slot) => { const meta = META[slot]; const active = profile[meta.urlKey] === asset.url; return <button key={slot} type="button" onClick={() => setSlot(slot, asset.url)} className={"rounded-lg px-2 py-2 text-[11px] font-black " + (active ? "bg-cyan-300 text-slate-950" : "border border-white/15 text-white")}>{active ? "Selected: " : "Set: "}{meta.label.replace(" image", "")}</button>; })}</div></div>)}</div> : null}
  </section>;
}
