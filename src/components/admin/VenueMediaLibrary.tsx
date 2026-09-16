"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import type { VenueGalleryItem } from "@/lib/venueEnhancements";
import type { VenueMediaAsset } from "@/lib/venueMediaCloudinary";

type VenueMediaLibraryProps = {
  slug: string;
  heroUrl: string;
  heroAlt: string;
  gallery: VenueGalleryItem[];
  onHeroChange: (url: string) => void;
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
  heroUrl,
  heroAlt,
  gallery,
  onHeroChange,
  onGalleryChange,
}: VenueMediaLibraryProps) {
  const [assets, setAssets] = useState<VenueMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("Loading this venue's Cloudinary library…");

  const galleryUrls = useMemo(() => new Set(gallery.map((item) => item.url)), [gallery]);

  async function loadLibrary() {
    if (!slug.trim()) {
      setAssets([]);
      setMessage("Add a venue slug to load its media library.");
      return;
    }

    setLoading(true);
    setMessage("Loading Cloudinary media…");
    try {
      const response = await fetch(`/api/admin/venue-media?slug=${encodeURIComponent(slug.trim())}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as MediaResponse;
      if (!response.ok) throw new Error(payload.error || "Could not load venue media.");
      setAssets(payload.assets || []);
      setMessage(
        payload.assets?.length
          ? `${payload.assets.length} venue image${payload.assets.length === 1 ? "" : "s"} available.`
          : "No venue images yet. Upload the first one below.",
      );
    } catch (error) {
      setAssets([]);
      setMessage(error instanceof Error ? error.message : "Could not load venue media.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!slug.trim()) return;
    const timer = window.setTimeout(() => void loadLibrary(), 250);
    return () => window.clearTimeout(timer);
    // loadLibrary intentionally reads the current slug value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length || !slug.trim()) return;

    setUploading(true);
    setMessage(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}…`);
    const uploaded: VenueMediaAsset[] = [];

    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("slug", slug.trim());
        form.append("file", file);
        const response = await fetch("/api/admin/venue-media", {
          method: "POST",
          body: form,
        });
        const payload = (await response.json()) as MediaResponse;
        if (!response.ok || !payload.asset) {
          throw new Error(payload.error || `Could not upload ${file.name}.`);
        }
        uploaded.push(payload.asset);
      }

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

  function toggleGallery(asset: VenueMediaAsset) {
    if (galleryUrls.has(asset.url)) {
      onGalleryChange(gallery.filter((item) => item.url !== asset.url));
      return;
    }

    onGalleryChange([
      ...gallery,
      { url: asset.url, alt: heroAlt.trim() || defaultAlt(slug) },
    ]);
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
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Venue media</p>
          <h3 className="mt-1 text-lg font-black normal-case tracking-normal text-white">Cloudinary library</h3>
          <p className="mt-2 max-w-2xl text-sm font-medium normal-case tracking-normal text-slate-400">
            Upload once, then choose the hero image and gallery photos here. No image URLs to hunt down or paste.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadLibrary()}
          disabled={!slug.trim() || loading}
          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black normal-case tracking-normal text-white disabled:opacity-40"
        >
          {loading ? "Loading…" : "Refresh library"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black normal-case tracking-normal text-white">Add venue photos</p>
            <p className="mt-1 text-xs font-medium normal-case tracking-normal text-slate-500">JPG, PNG or WebP. Up to 12 MB each.</p>
          </div>
          <label className={`cursor-pointer rounded-xl bg-fuchsia-300 px-4 py-2.5 text-xs font-black normal-case tracking-normal text-slate-950 ${uploading || !slug.trim() ? "pointer-events-none opacity-40" : ""}`}>
            {uploading ? "Uploading…" : "Upload photos"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={uploading || !slug.trim()}
              onChange={(event) => {
                void uploadFiles(event.target.files);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        <p className="mt-3 text-xs font-semibold normal-case tracking-normal text-cyan-100" aria-live="polite">{message}</p>
      </div>

      {heroUrl && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-fuchsia-300/25 bg-black/30">
          <div className="relative aspect-[16/7] overflow-hidden">
            <img src={heroUrl} alt={heroAlt || "Selected venue hero"} className="h-full w-full object-cover" />
            <span className="absolute left-3 top-3 rounded-full bg-[#ff2aa3] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">Hero</span>
          </div>
          <div className="flex items-center justify-between gap-3 p-3">
            <p className="truncate text-xs font-semibold normal-case tracking-normal text-slate-300">Current hero image</p>
            <button type="button" onClick={() => onHeroChange("")} className="text-xs font-black normal-case tracking-normal text-rose-200">Clear hero</button>
          </div>
        </div>
      )}

      {assets.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => {
            const isHero = heroUrl === asset.url;
            const inGallery = galleryUrls.has(asset.url);
            return (
              <div key={asset.publicId} className={`overflow-hidden rounded-2xl border bg-black/25 ${isHero ? "border-fuchsia-300/70" : inGallery ? "border-cyan-300/50" : "border-white/10"}`}>
                <div className="relative aspect-square overflow-hidden bg-black/30">
                  <img src={asset.url} alt="Venue media option" className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {isHero && <span className="rounded-full bg-[#ff2aa3] px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white">Hero</span>}
                    {inGallery && <span className="rounded-full bg-cyan-300 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-950">Gallery</span>}
                  </div>
                </div>
                <div className="grid gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => onHeroChange(asset.url)}
                    className={`rounded-lg px-2 py-2 text-[11px] font-black normal-case tracking-normal ${isHero ? "bg-fuchsia-300 text-slate-950" : "border border-white/15 text-white"}`}
                  >
                    {isHero ? "Selected hero" : "Set as hero"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleGallery(asset)}
                    className={`rounded-lg px-2 py-2 text-[11px] font-black normal-case tracking-normal ${inGallery ? "bg-cyan-300 text-slate-950" : "border border-white/15 text-white"}`}
                  >
                    {inGallery ? "Remove from gallery" : "Add to gallery"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {gallery.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black normal-case tracking-normal text-white">Gallery order and labels</p>
              <p className="mt-1 text-xs font-medium normal-case tracking-normal text-slate-500">These are the photos that will appear on the open venue profile.</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black normal-case tracking-normal text-slate-300">{gallery.length} selected</span>
          </div>
          <div className="mt-3 grid gap-3">
            {gallery.map((item, index) => (
              <div key={`${item.url}-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 sm:grid-cols-[92px_1fr_auto] sm:items-center">
                <img src={item.url} alt={item.alt} className="aspect-square h-20 w-20 rounded-xl object-cover" />
                <div className="grid gap-2">
                  <input
                    value={item.alt}
                    onChange={(event) => updateGalleryItem(index, { alt: event.target.value })}
                    placeholder="Alt text"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-semibold normal-case tracking-normal text-white outline-none focus:border-cyan-300/50"
                  />
                  <input
                    value={item.caption || ""}
                    onChange={(event) => updateGalleryItem(index, { caption: event.target.value || undefined })}
                    placeholder="Optional caption"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-semibold normal-case tracking-normal text-white outline-none focus:border-cyan-300/50"
                  />
                </div>
                <div className="flex gap-1 sm:flex-col">
                  <button type="button" onClick={() => moveGalleryItem(index, -1)} disabled={index === 0} className="rounded-lg border border-white/10 px-2 py-1 text-xs font-black normal-case tracking-normal text-slate-300 disabled:opacity-25">↑</button>
                  <button type="button" onClick={() => moveGalleryItem(index, 1)} disabled={index === gallery.length - 1} className="rounded-lg border border-white/10 px-2 py-1 text-xs font-black normal-case tracking-normal text-slate-300 disabled:opacity-25">↓</button>
                  <button type="button" onClick={() => onGalleryChange(gallery.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg border border-rose-300/20 px-2 py-1 text-xs font-black normal-case tracking-normal text-rose-200">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
