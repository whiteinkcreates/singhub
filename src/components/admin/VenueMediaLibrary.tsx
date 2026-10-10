"use client";
import {ImagePlacementEditor} from './ImagePlacementEditor';
import type {ResponsiveImagePlacement} from '@/lib/imagePlacement';

import { useEffect, useMemo, useRef, useState } from "react";
import type { HeroPosition, VenueGalleryItem } from "@/lib/venueEnhancements";
import type { VenueMediaAsset } from "@/lib/venueMediaCloudinary";

import { MediaImagePreview } from "./MediaImagePreview";

const MAX_GALLERY_PHOTOS = 15;
type VenueMediaLibraryProps = {
  slug: string;
  kind?: "venue" | "hotel" | "host";
  heroPreview?: "venue-base" | "venue-partner";
  allowPortrait?: boolean;
  heroUrl: string;
  heroAlt: string;
  heroPosition: HeroPosition;
  heroPlacement?: ResponsiveImagePlacement;
  logoPlacement?: ResponsiveImagePlacement;
  logoPosition?: string;
  onHeroPlacementChange: (value:ResponsiveImagePlacement)=>void;
  onLogoPlacementChange: (value:ResponsiveImagePlacement)=>void;
  logoUrl: string;
  logoAlt: string;
  gallery: VenueGalleryItem[];
  onHeroChange: (url: string) => void;
  onHeroPositionChange: (position: HeroPosition) => void;
  onLogoChange: (url: string) => void;
  onGalleryChange: (gallery: VenueGalleryItem[]) => void;
};

type MediaResponse = {
  assets?: VenueMediaAsset[];
  asset?: VenueMediaAsset;
  error?: string;
};

function defaultAlt(slug: string) {
  const venueName = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return `${venueName || "Venue"} photo`;
}

export function VenueMediaLibrary({
  slug,
  kind = "venue",
  heroPreview,
  allowPortrait = true,
  heroUrl,
  heroAlt,
  heroPosition,
  logoUrl,
  logoAlt,
  gallery,
  onHeroChange,
  heroPlacement,logoPlacement,logoPosition,onHeroPlacementChange,onLogoPlacementChange,
  onLogoChange,
  onGalleryChange,
}: VenueMediaLibraryProps) {
  const endpoint = kind === "host" ? "/api/admin/host-media" : kind === "hotel" ? "/api/admin/hotel-media" : "/api/admin/venue-media";
  const [assets, setAssets] = useState<VenueMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("Loading this venue's Cloudinary library…");
  const requestSequence = useRef(0);

  const galleryUrls = useMemo(() => new Set(gallery.map((item) => item.url)), [gallery]);

  async function loadLibrary(requestedSlug = slug.trim()) {
    const currentRequest = ++requestSequence.current;
    if (!requestedSlug) {
      setAssets([]);
      setLoading(false);
      setMessage("Choose a venue to load its media library.");
      return;
    }

    setLoading(true);
    setMessage("Loading Cloudinary media…");
    try {
      const response = await fetch(`${endpoint}?slug=${encodeURIComponent(requestedSlug)}`, { cache: "no-store" });
      const payload = (await response.json()) as MediaResponse;
      if (currentRequest !== requestSequence.current) return;
      if (!response.ok) throw new Error(payload.error || "Could not load venue media.");
      setAssets(payload.assets || []);
      setMessage(payload.assets?.length ? `${payload.assets.length} ${kind} image${payload.assets.length === 1 ? "" : "s"} available.` : "No images yet. Upload the first one below.");
    } catch (error) {
      if (currentRequest !== requestSequence.current) return;
      setAssets([]);
      setMessage(error instanceof Error ? error.message : "Could not load venue media.");
    } finally {
      if (currentRequest === requestSequence.current) setLoading(false);
    }
  }

  useEffect(() => {
    const requestedSlug = slug.trim();
    const timer = window.setTimeout(() => void loadLibrary(requestedSlug), requestedSlug ? 250 : 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function uploadFiles(files: FileList | null) {
    const requestedSlug = slug.trim();
    if (!files?.length || !requestedSlug) return;

    setUploading(true);
    setMessage(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}…`);
    const uploaded: VenueMediaAsset[] = [];

    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("slug", requestedSlug);
        form.append("file", file);
        const response = await fetch(endpoint, { method: "POST", body: form });
        const payload = (await response.json()) as MediaResponse;
        if (!response.ok || !payload.asset) throw new Error(payload.error || `Could not upload ${file.name}.`);
        uploaded.push(payload.asset);
      }

      if (slug.trim() !== requestedSlug) return;
      setAssets((current) => {
        const merged = [...uploaded, ...current];
        const seen = new Set<string>();
        return merged.filter((asset) => {
          if (seen.has(asset.publicId)) return false;
          seen.add(asset.publicId);
          return true;
        });
      });
      setMessage(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded to Cloudinary.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Venue media upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteAsset(asset: VenueMediaAsset) {
    const requestedSlug = slug.trim();
    if (!requestedSlug) return;
    if (heroUrl === asset.url || logoUrl === asset.url || galleryUrls.has(asset.url)) {
      setMessage("Remove this image from Hero, Logo, and Gallery before deleting it from the file.");
      return;
    }
    if (!window.confirm("Permanently remove this image from this venue's media file?")) return;
    try {
      const response = await fetch(endpoint, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: requestedSlug, publicId: asset.publicId }) });
      const payload = (await response.json()) as MediaResponse;
      if (!response.ok) throw new Error(payload.error || "Could not remove image.");
      setAssets((current) => current.filter((item) => item.publicId !== asset.publicId));
      setMessage("Image removed from this venue's media file.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove image.");
    }
  }

  function toggleGallery(asset: VenueMediaAsset) {
    if (galleryUrls.has(asset.url)) {
      onGalleryChange(gallery.filter((item) => item.url !== asset.url));
      return;
    }
    if (gallery.length >= MAX_GALLERY_PHOTOS) {
      setMessage(`Gallery is limited to ${MAX_GALLERY_PHOTOS} photos. Remove one before adding another.`);
      return;
    }
    onGalleryChange([...gallery, { url: asset.url, alt: heroAlt.trim() || defaultAlt(slug) }]);
  }

  function updateGalleryItem(index: number, patch: Partial<VenueGalleryItem>) {
    onGalleryChange(gallery.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function moveGalleryItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= gallery.length) return;
    const next = [...gallery];
    [next[index], next[target]] = [next[target], next[index]];
    onGalleryChange(next);
  }

  return (
    <section className="md:col-span-2 rounded-[1.6rem] border border-cyan-300/15 bg-[#07131a] p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">{kind === "host" ? "Host media" : kind === "hotel" ? "Hotel media" : "Venue media"}</p>
          <h3 className="mt-1 text-lg font-black normal-case tracking-normal text-white">Cloudinary library</h3>
          <p className="mt-2 max-w-2xl text-sm font-medium normal-case tracking-normal text-slate-400">{kind === "host" ? "Upload photos, assign a portrait or hero, then save your selections in the host editor." : kind === "hotel" ? "Choose a hotel hero from this hotel’s library, or upload a photo. Save your selection in the hotel editor." : "One library, explicit roles. Choose a hero, optional venue mark, and gallery photos without copying image URLs."}</p>
        </div>
        <button type="button" onClick={() => void loadLibrary()} disabled={!slug.trim() || loading} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black normal-case tracking-normal text-white disabled:opacity-40">{loading ? "Loading…" : "Refresh library"}</button>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-black normal-case tracking-normal text-white">Add {kind} photos</p><p className="mt-1 text-xs font-medium normal-case tracking-normal text-slate-500">JPG, PNG or WebP. Up to 12 MB each.</p></div>
          <label className={`cursor-pointer rounded-xl bg-fuchsia-300 px-4 py-2.5 text-xs font-black normal-case tracking-normal text-slate-950 ${uploading || !slug.trim() ? "pointer-events-none opacity-40" : ""}`}>
            {uploading ? "Uploading…" : "Upload photos"}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploading || !slug.trim()} onChange={(event) => { void uploadFiles(event.target.files); event.currentTarget.value = ""; }} />
          </label>
        </div>
        <p className="mt-3 text-xs font-semibold normal-case tracking-normal text-cyan-100" aria-live="polite">{message}</p>
      </div>

      <div className={kind !== "venue" ? "mt-4 grid gap-3" : "mt-4 grid gap-3 lg:grid-cols-[1fr_15rem]"}>
        {heroUrl ? (
          <div className="overflow-hidden rounded-2xl border border-fuchsia-300/25 bg-black/30">
            <ImagePlacementEditor
              src={heroUrl}
              alt={heroAlt || `Selected ${kind} hero`}
              label="Hero"
              value={heroPlacement}
              position={heroPosition}
              onChange={onHeroPlacementChange}
              desktopAspectRatio={heroPreview==="venue-base"?"3.52 / 1":undefined}
              mobileAspectRatio={heroPreview==="venue-base"?"16 / 10":undefined}
              desktopLabel={heroPreview==="venue-base"?"Live desktop":"Desktop"}
              mobileLabel={heroPreview==="venue-base"?"Live mobile":"Mobile"}
            />
            <button type="button" onClick={() => onHeroChange("")} className="m-3 rounded-xl border border-rose-300/20 px-3 py-2 text-xs font-black text-rose-200">Clear hero</button>
          </div>
        ) : <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/15 text-sm text-slate-600">No hero selected</div>}

        {(kind === "venue" || (kind === "host" && allowPortrait)) && (logoUrl ? (
          <div className="rounded-2xl border border-cyan-300/20 bg-black/30 p-3"><div className="mx-auto flex aspect-square max-w-36 items-center justify-center overflow-hidden rounded-full border border-cyan-300/30 bg-white/[0.04]"><MediaImagePreview src={logoUrl} alt={logoAlt || (kind === "host" ? "Host portrait" : "Selected venue mark")} className={kind === "host" ? "h-full w-full object-cover" : "h-full w-full object-contain p-3"} placement={logoPlacement} style={{objectPosition:logoPosition}} /></div><div className="mt-3 flex items-center justify-between gap-2"><span className="text-xs font-black text-cyan-200">{kind === "host" ? "Portrait" : "Logo / mark"}</span><button type="button" onClick={() => onLogoChange("")} className="text-xs font-black text-rose-200">Clear</button></div><div className="mt-3"><ImagePlacementEditor src={logoUrl} alt={logoAlt || "Selected image"} label={kind === "host" ? "Portrait" : "Logo"} shape="square" fit={kind === "host" ? "cover" : "contain"} value={logoPlacement} position={logoPosition} onChange={onLogoPlacementChange} /></div></div>
        ) : <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/15 px-4 text-center text-sm text-slate-600">{kind === "host" ? "No portrait selected. Hosts without a photo use initials." : "Optional logo / venue mark"}</div>)}
      </div>

      {assets.length > 0 && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{assets.map((asset) => {
        const isHero = heroUrl === asset.url;
        const isLogo = logoUrl === asset.url;
        const inGallery = galleryUrls.has(asset.url);
        const galleryFull = gallery.length >= MAX_GALLERY_PHOTOS && !inGallery;
        return <div key={asset.publicId} className={`overflow-hidden rounded-2xl border bg-black/25 ${isHero ? "border-fuchsia-300/70" : isLogo ? "border-cyan-300/70" : inGallery ? "border-cyan-300/50" : "border-white/10"}`}>
          <div className="relative aspect-square overflow-hidden bg-black/30"><MediaImagePreview src={asset.url} alt={`${kind} media option`} className="h-full w-full object-cover" /><div className="absolute left-2 top-2 flex flex-wrap gap-1">{isHero && <span className="rounded-full bg-[#ff2aa3] px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white">Hero</span>}{isLogo && <span className="rounded-full bg-violet-300 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-950">{kind === "host" ? "Portrait" : "Logo"}</span>}{inGallery && <span className="rounded-full bg-cyan-300 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-950">Gallery</span>}</div></div>
          <div className="grid gap-2 p-2"><button type="button" onClick={() => onHeroChange(asset.url)} className={`rounded-lg px-2 py-2 text-[11px] font-black normal-case tracking-normal ${isHero ? "bg-fuchsia-300 text-slate-950" : "border border-white/15 text-white"}`}>{isHero ? "Selected hero" : "Set as hero"}</button>{(kind === "venue" || (kind === "host" && allowPortrait)) && <button type="button" onClick={() => onLogoChange(asset.url)} className={`rounded-lg px-2 py-2 text-[11px] font-black normal-case tracking-normal ${isLogo ? "bg-violet-300 text-slate-950" : "border border-white/15 text-white"}`}>{kind === "host" ? (isLogo ? "Selected portrait" : "Set as portrait") : (isLogo ? "Selected logo" : "Set as logo")}</button>}{kind === "venue" && <button type="button" onClick={() => toggleGallery(asset)} disabled={galleryFull} className={`rounded-lg px-2 py-2 text-[11px] font-black normal-case tracking-normal disabled:cursor-not-allowed disabled:opacity-35 ${inGallery ? "bg-cyan-300 text-slate-950" : "border border-white/15 text-white"}`}>{inGallery ? "Remove from gallery" : galleryFull ? "Gallery full" : "Add to gallery"}</button>}<button type="button" onClick={() => void deleteAsset(asset)} className="rounded-lg border border-rose-300/20 px-2 py-2 text-[11px] font-black normal-case tracking-normal text-rose-200">Remove image from file</button></div>
        </div>;
      })}</div>}

      {kind === "venue" && gallery.length > 0 && <div className="mt-6"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-black normal-case tracking-normal text-white">Gallery order and labels</p><p className="mt-1 text-xs font-medium normal-case tracking-normal text-slate-500">These are the photos that will appear on the open venue profile.</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black normal-case tracking-normal text-slate-300">{gallery.length}/{MAX_GALLERY_PHOTOS}</span></div><div className="mt-3 grid gap-3">{gallery.map((item, index) => <div key={`${item.url}-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:grid-cols-[92px_1fr_auto] sm:items-center"><div className="h-20 w-20 overflow-hidden rounded-xl"><MediaImagePreview src={item.url} alt={item.alt} placement={item.placement} className="aspect-square h-20 w-20 rounded-xl object-cover" /></div><div className="grid gap-2"><input value={item.alt} onChange={(event) => updateGalleryItem(index, { alt: event.target.value })} placeholder="Alt text" className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-semibold normal-case tracking-normal text-white outline-none focus:border-cyan-300/50" /><input value={item.caption || ""} onChange={(event) => updateGalleryItem(index, { caption: event.target.value || undefined })} placeholder="Optional caption" className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-semibold normal-case tracking-normal text-white outline-none focus:border-cyan-300/50" /></div><div className="flex gap-1 sm:flex-col"><button type="button" onClick={() => moveGalleryItem(index, -1)} disabled={index === 0} className="rounded-lg border border-white/10 px-2 py-1 text-xs font-black normal-case tracking-normal text-slate-300 disabled:opacity-25">↑</button><button type="button" onClick={() => moveGalleryItem(index, 1)} disabled={index === gallery.length - 1} className="rounded-lg border border-white/10 px-2 py-1 text-xs font-black normal-case tracking-normal text-slate-300 disabled:opacity-25">↓</button><button type="button" onClick={() => onGalleryChange(gallery.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg border border-rose-300/20 px-2 py-1 text-xs font-black normal-case tracking-normal text-rose-200">×</button></div><div className="sm:col-span-3"><ImagePlacementEditor src={item.url} alt={item.alt} label={`Gallery photo ${index+1}`} shape="gallery" value={item.placement} onChange={placement=>updateGalleryItem(index,{placement})} /></div></div>)}</div></div>}
    </section>
  );
}
