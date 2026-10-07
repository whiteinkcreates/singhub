"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlacementEditor } from "@/components/admin/ImagePlacementEditor";
import { MediaImagePreview } from "@/components/admin/MediaImagePreview";
import { GUEST_GUIDE_DEFAULTS_SLUG, type GuestGuideLifestyleMedia } from "@/lib/hotelProfiles";
import type { VenueMediaAsset } from "@/lib/venueMediaCloudinary";

type Slot = "walkable" | "quickRide" | "standout";
const META: Record<Slot, { label: string; urlKey: keyof GuestGuideLifestyleMedia; altKey: keyof GuestGuideLifestyleMedia; placementKey: keyof GuestGuideLifestyleMedia }> = {
  walkable: { label: "Walkable", urlKey: "walkableImageUrl", altKey: "walkableImageAlt", placementKey: "walkableImagePlacement" },
  quickRide: { label: "Quick Ride", urlKey: "quickRideImageUrl", altKey: "quickRideImageAlt", placementKey: "quickRideImagePlacement" },
  standout: { label: "Local Standouts", urlKey: "standoutImageUrl", altKey: "standoutImageAlt", placementKey: "standoutImagePlacement" },
};

async function fetchGlobalGuestGuideMedia() {
  const [defaultsResponse, assetsResponse] = await Promise.all([
    fetch("/api/admin/hotel-guest-guide-defaults", { cache: "no-store" }),
    fetch("/api/admin/hotel-media?slug=" + encodeURIComponent(GUEST_GUIDE_DEFAULTS_SLUG), { cache: "no-store" }),
  ]);
  const defaultsPayload = await defaultsResponse.json();
  const assetsPayload = await assetsResponse.json();
  if (!defaultsResponse.ok) throw new Error(defaultsPayload.error || "Could not load Guest Guide defaults.");
  if (!assetsResponse.ok) throw new Error(assetsPayload.error || "Could not load global Guest Guide media.");
  return {
    defaults: (defaultsPayload.defaults || {}) as GuestGuideLifestyleMedia,
    assets: (assetsPayload.assets || []) as VenueMediaAsset[],
  };
}

export function GlobalGuestGuideMediaEditor() {
  const [defaults, setDefaults] = useState<GuestGuideLifestyleMedia>({});
  const [assets, setAssets] = useState<VenueMediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("Loading global Guest Guide media…");

  async function load() {
    setLoading(true);
    try {
      const [defaultsResponse, assetsResponse] = await Promise.all([
        fetch("/api/admin/hotel-guest-guide-defaults", { cache: "no-store" }),
        fetch("/api/admin/hotel-media?slug=" + encodeURIComponent(GUEST_GUIDE_DEFAULTS_SLUG), { cache: "no-store" }),
      ]);
      const defaultsPayload = await defaultsResponse.json();
      const assetsPayload = await assetsResponse.json();
      if (!defaultsResponse.ok) throw new Error(defaultsPayload.error || "Could not load Guest Guide defaults.");
      if (!assetsResponse.ok) throw new Error(assetsPayload.error || "Could not load global Guest Guide media.");
      setDefaults(defaultsPayload.defaults || {});
      setAssets(assetsPayload.assets || []);
      setDirty(false);
      setMessage("These three images are inherited by every hotel unless that hotel has an override.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load Guest Guide defaults.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    void fetchGlobalGuestGuideMedia()
      .then(({ defaults: nextDefaults, assets: nextAssets }) => {
        if (cancelled) return;
        setDefaults(nextDefaults);
        setAssets(nextAssets);
        setDirty(false);
        setMessage("These three images are inherited by every hotel unless that hotel has an override.");
      })
      .catch((error) => {
        if (cancelled) return;
        setMessage(error instanceof Error ? error.message : "Could not load Guest Guide defaults.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function edit(patch: Partial<GuestGuideLifestyleMedia>) {
    setDefaults((current) => ({ ...current, ...patch }));
    setDirty(true);
  }

  function setSlot(slot: Slot, url: string) {
    const meta = META[slot];
    edit({
      [meta.urlKey]: url,
      [meta.altKey]: url ? meta.label + " Guest Guide lifestyle image" : "",
      [meta.placementKey]: undefined,
    } as Partial<GuestGuideLifestyleMedia>);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setMessage("Uploading global Guest Guide images…");
    try {
      const uploaded: VenueMediaAsset[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("slug", GUEST_GUIDE_DEFAULTS_SLUG);
        form.append("file", file);
        const response = await fetch("/api/admin/hotel-media", { method: "POST", body: form });
        const payload = await response.json();
        if (!response.ok || !payload.asset) throw new Error(payload.error || "Could not upload " + file.name + ".");
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
      setMessage(uploaded.length + " global Guest Guide image" + (uploaded.length === 1 ? "" : "s") + " uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Global Guest Guide upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setMessage("Saving global Guest Guide defaults…");
    try {
      const response = await fetch("/api/admin/hotel-guest-guide-defaults", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaults }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Guest Guide defaults were not saved.");
      setDefaults(payload.defaults || {});
      setDirty(false);
      setMessage("Saved. Every hotel without an override now inherits these images.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Guest Guide defaults were not saved.");
    } finally {
      setSaving(false);
    }
  }

  const selected = useMemo(() => new Set([
    defaults.walkableImageUrl,
    defaults.quickRideImageUrl,
    defaults.standoutImageUrl,
  ].filter(Boolean)), [defaults]);

  return (
    <section className="mx-auto mt-6 max-w-6xl rounded-[1.8rem] border border-fuchsia-300/20 bg-[#071018] p-4 text-white shadow-[0_0_40px_rgba(34,211,238,.05)] md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">Global Guest Guide defaults</p>
          <h2 className="mt-1 text-2xl font-black">Shared lifestyle story</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Set these once. Walkable, Quick Ride and Local Standouts automatically use them across every hotel. A hotel-specific selection only overrides that one slot for that property.
          </p>
        </div>
        <label className={"cursor-pointer rounded-xl bg-fuchsia-300 px-4 py-2.5 text-xs font-black text-slate-950 " + (uploading ? "pointer-events-none opacity-40" : "")}>
          {uploading ? "Uploading…" : "Upload global images"}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploading} onChange={(event) => { void uploadFiles(event.target.files); event.currentTarget.value = ""; }} />
        </label>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {(Object.keys(META) as Slot[]).map((slot) => {
          const meta = META[slot];
          const url = String(defaults[meta.urlKey] || "");
          const alt = String(defaults[meta.altKey] || "");
          const placement = defaults[meta.placementKey] as GuestGuideLifestyleMedia["walkableImagePlacement"];
          return (
            <article key={slot} className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
              <div className="border-b border-white/10 px-3 py-2">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-300">{meta.label}</p>
              </div>
              {url ? (
                <>
                  <ImagePlacementEditor
                    src={url}
                    alt={alt || meta.label}
                    label={meta.label + " global image"}
                    value={placement}
                    onChange={(next) => edit({ [meta.placementKey]: next } as Partial<GuestGuideLifestyleMedia>)}
                  />
                  <div className="grid gap-2 p-3">
                    <input
                      value={alt}
                      onChange={(event) => edit({ [meta.altKey]: event.target.value } as Partial<GuestGuideLifestyleMedia>)}
                      className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white"
                      placeholder="Image description"
                    />
                    <button type="button" onClick={() => setSlot(slot, "")} className="rounded-xl border border-rose-300/20 px-3 py-2 text-xs font-black text-rose-200">
                      Clear global {meta.label}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-slate-600">No global {meta.label.toLowerCase()} image selected</div>
              )}
            </article>
          );
        })}
      </div>

      {assets.length > 0 ? (
        <div className="mt-5">
          <p className="mb-3 text-sm font-black text-white">Global Guest Guide media library</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {assets.map((asset) => (
              <div key={asset.publicId} className={"overflow-hidden rounded-2xl border bg-black/25 " + (selected.has(asset.url) ? "border-cyan-300/60" : "border-white/10")}>
                <div className="aspect-square overflow-hidden bg-black/30">
                  <MediaImagePreview src={asset.url} alt="Global Guest Guide media option" className="h-full w-full object-cover" />
                </div>
                <div className="grid gap-1.5 p-2">
                  {(Object.keys(META) as Slot[]).map((slot) => {
                    const meta = META[slot];
                    const active = defaults[meta.urlKey] === asset.url;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSlot(slot, asset.url)}
                        className={"rounded-lg px-2 py-2 text-[11px] font-black " + (active ? "bg-cyan-300 text-slate-950" : "border border-white/15 text-white")}
                      >
                        {active ? "Selected: " : "Set: "}{meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void save()} disabled={!dirty || saving || loading} className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-40">
          {saving ? "Saving…" : "Save global defaults"}
        </button>
        <button type="button" onClick={() => void load()} disabled={loading || saving} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-black text-white disabled:opacity-40">
          Refresh
        </button>
        <p className="text-xs font-semibold text-cyan-100" aria-live="polite">{loading ? "Loading global defaults…" : message}</p>
      </div>
    </section>
  );
}
