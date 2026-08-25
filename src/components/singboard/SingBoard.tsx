"use client";

import { useMemo, useRef, useState } from "react";

type BoardRegion = "all" | "east-county" | "central" | "beach" | "downtown" | "south-bay" | "north-county";
type PersistedRegion = Exclude<BoardRegion, "all">;

type BoardFlyer = {
  id: string;
  title: string;
  venue: string;
  neighborhood: string;
  region: PersistedRegion;
  detail: string;
  x: number;
  y: number;
  rotation: number;
  imageUrl: string;
  pinned: true;
  eventDate: string;
};

type DraftFlyer = Omit<BoardFlyer, "id" | "pinned" | "imageUrl"> & {
  id: string;
  pinned: false;
  imageUrl: string;
};

type Rect = { x: number; y: number; w: number; h: number };

const boardRegions: { id: BoardRegion; label: string }[] = [
  { id: "all", label: "All San Diego" },
  { id: "east-county", label: "East County" },
  { id: "central", label: "Central" },
  { id: "beach", label: "Beach Areas" },
  { id: "downtown", label: "Downtown" },
  { id: "south-bay", label: "South Bay" },
  { id: "north-county", label: "North County" },
];

const reservedRects: Rect[] = [
  { x: 30, y: 1, w: 42, h: 17 },
  { x: 3, y: 18, w: 24, h: 25 },
  { x: 78, y: 17, w: 18, h: 18 },
  { x: 24, y: 79, w: 52, h: 18 },
];

function overlapRatio(a: Rect, b: Rect) {
  const left = Math.max(a.x, b.x);
  const right = Math.min(a.x + a.w, b.x + b.w);
  const top = Math.max(a.y, b.y);
  const bottom = Math.min(a.y + a.h, b.y + b.h);
  if (right <= left || bottom <= top) return 0;
  return ((right - left) * (bottom - top)) / (a.w * a.h);
}

function nextDayLabel(dateValue: string) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function SingBoard({ initialFlyers }: { initialFlyers: BoardFlyer[] }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<File | null>(null);
  const [flyers, setFlyers] = useState<BoardFlyer[]>(initialFlyers);
  const [draft, setDraft] = useState<DraftFlyer | null>(null);
  const [activeRegion, setActiveRegion] = useState<BoardRegion>("all");
  const [accessCode, setAccessCode] = useState("");
  const [venueName, setVenueName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [posting, setPosting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState("Verified venues and KJs can publish with a SingBOARD access code.");

  const visibleFlyers = useMemo(
    () => [...flyers, ...(draft ? [draft] : [])].filter((flyer) => activeRegion === "all" || flyer.region === activeRegion),
    [activeRegion, draft, flyers],
  );
  const activeLabel = boardRegions.find((region) => region.id === activeRegion)?.label ?? "All San Diego";

  function isBlocked(x: number, y: number) {
    const moving: Rect = { x, y, w: 25, h: 28 };
    if (reservedRects.some((rect) => overlapRatio(moving, rect) > 0.08)) return true;
    return flyers.some((flyer) => overlapRatio(moving, { x: flyer.x, y: flyer.y, w: 24, h: 27 }) > 0.18);
  }

  function handleUpload(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) {
      setStatus("Choose an image file for the flyer.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus("Flyer image must be under 10 MB.");
      return;
    }
    if (draft?.imageUrl.startsWith("blob:")) URL.revokeObjectURL(draft.imageUrl);
    fileRef.current = file;
    const region: PersistedRegion = activeRegion === "all" ? "central" : activeRegion;
    setDraft({
      id: `draft-${Date.now()}`,
      title: file.name.replace(/\.[^.]+$/, "") || "Karaoke event",
      venue: venueName || "Your venue",
      neighborhood: neighborhood || "Your neighborhood",
      region,
      detail: "",
      x: 37,
      y: 47,
      rotation: -1,
      imageUrl: URL.createObjectURL(file),
      pinned: false,
      eventDate,
    });
    setStatus("Flyer loaded. Add the venue details, date, and place it on the board.");
  }

  function startDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!draft || posting) return;
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - (rect.left + (draft.x / 100) * rect.width),
      y: event.clientY - (rect.top + (draft.y / 100) * rect.height),
    });
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!draft || !dragging) return;
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const x = Math.max(2, Math.min(73, ((event.clientX - rect.left - dragOffset.x) / rect.width) * 100));
    const y = Math.max(18, Math.min(70, ((event.clientY - rect.top - dragOffset.y) / rect.height) * 100));
    if (isBlocked(x, y)) {
      setStatus("That spot overlaps something already pinned.");
      return;
    }
    setDraft({ ...draft, x, y });
  }

  function endDrag(event: React.PointerEvent<HTMLButtonElement>) {
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  async function publishDraft() {
    if (!draft || !fileRef.current) return setStatus("Upload a flyer first.");
    if (!accessCode.trim()) return setStatus("Enter your SingBOARD access code.");
    if (!venueName.trim() || !neighborhood.trim()) return setStatus("Add the venue and neighborhood.");
    if (!eventDate) return setStatus("Confirm the event date.");

    setPosting(true);
    setStatus("Publishing flyer...");
    try {
      const form = new FormData();
      form.append("accessCode", accessCode);
      form.append("file", fileRef.current);
      form.append("title", draft.title);
      form.append("venueName", venueName.trim());
      form.append("neighborhood", neighborhood.trim());
      form.append("region", draft.region);
      form.append("detail", draft.detail);
      form.append("eventDate", eventDate);
      form.append("x", String(draft.x));
      form.append("y", String(draft.y));
      form.append("rotation", String(draft.rotation));

      const response = await fetch("/api/singboard/publish", { method: "POST", body: form });
      const result = (await response.json()) as { id?: string; imageUrl?: string; error?: string };
      if (!response.ok || !result.id || !result.imageUrl) throw new Error(result.error || "Unable to publish flyer.");

      setFlyers((current) => [
        ...current,
        {
          ...draft,
          id: result.id!,
          venue: venueName.trim(),
          neighborhood: neighborhood.trim(),
          eventDate,
          imageUrl: result.imageUrl!,
          pinned: true,
        },
      ]);
      URL.revokeObjectURL(draft.imageUrl);
      fileRef.current = null;
      setDraft(null);
      setStatus(`Pinned. It will leave the live board after ${nextDayLabel(eventDate)}.`);
      setVenueName("");
      setNeighborhood("");
      setEventDate("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to publish flyer.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300">Want on the board?</p>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">Posting is invite-only for verified San Diego venues and KJs. Approved posters receive a private access code.</p>
        </div>
        <a href="mailto:hello@singhub.app?subject=SingBoard%20posting%20access" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-black text-white transition hover:bg-fuchsia-400">Get verified for board access</a>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {boardRegions.map((region) => <button key={region.id} type="button" onClick={() => setActiveRegion(region.id)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black transition ${activeRegion === region.id ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}>{region.label}</button>)}
      </div>

      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#3d2412,#8b5529_20%,#5c361a_48%,#9f6733_78%,#3e2413)] p-3 shadow-[0_28px_80px_rgba(0,0,0,.65)] sm:p-5 lg:p-6">
        <div ref={boardRef} className="relative min-h-[900px] overflow-hidden rounded-[1.1rem] border border-amber-950/60 bg-[#ae7041] shadow-[inset_0_0_55px_rgba(69,34,10,.35)] sm:min-h-[960px] lg:min-h-[1020px]" aria-label={`${activeLabel} SingBoard`}>
          <div className="pointer-events-none absolute left-1/2 top-4 z-30 w-[72%] max-w-[620px] -translate-x-1/2 sm:top-5 sm:w-[56%] lg:w-[44%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://res.cloudinary.com/dy3lyejkk/image/upload/v1787622424/ChatGPT_Image_Aug_24_2026_06_45_03_PM_l2vodb.png" alt="SingBOARD" className="h-auto w-full object-contain select-none" draggable={false} />
          </div>

          <div className="absolute left-[4%] top-[19%] z-20 w-[42%] max-w-[250px] rotate-[-2deg] bg-[#fffdf7] p-4 text-slate-950 shadow-[0_14px_20px_rgba(58,30,10,.32)] sm:w-[24%]">
            <span className="absolute left-1/2 top-2 h-5 w-5 -translate-x-1/2 rounded-full border border-fuchsia-950 bg-fuchsia-500 shadow-md" />
            <h2 className="mt-3 text-sm font-black uppercase sm:text-lg">Post a flyer</h2>
            <ol className="mt-3 space-y-2 text-xs font-bold leading-5 sm:text-sm"><li>1. Get verified</li><li>2. Upload + add details</li><li>3. Place your flyer</li><li>4. Publish</li></ol>
          </div>

          {visibleFlyers.length === 0 && <div className="absolute inset-x-0 top-[48%] flex justify-center p-8"><div className="rotate-[-1deg] bg-white/90 p-5 text-center text-slate-950 shadow-lg"><p className="text-xl font-black">Fresh cork.</p><p className="mt-1 text-sm font-bold">Nothing pinned here yet.</p></div></div>}

          {visibleFlyers.map((flyer) => {
            const isDraft = !flyer.pinned;
            return <button key={flyer.id} type="button" aria-label={`${flyer.title} at ${flyer.venue}`} className={`absolute w-[42%] max-w-[270px] select-none text-left shadow-[0_16px_22px_rgba(40,20,5,0.34)] outline-none sm:w-[28%] ${isDraft ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`} style={{ left: `${flyer.x}%`, top: `${flyer.y}%`, transform: `rotate(${flyer.rotation}deg)`, zIndex: isDraft ? 35 : 10 }} onPointerDown={isDraft ? startDrag : undefined} onPointerMove={isDraft ? moveDrag : undefined} onPointerUp={isDraft ? endDrag : undefined}>
              {flyer.pinned && <span className="absolute left-1/2 top-2 z-20 h-5 w-5 -translate-x-1/2 rounded-full border border-red-950 bg-red-500 shadow-md" />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flyer.imageUrl} alt="" className="block h-auto max-h-[360px] w-full bg-white object-contain" draggable={false} />
            </button>;
          })}

          <div className="absolute bottom-[3%] left-1/2 z-40 w-[94%] max-w-[980px] -translate-x-1/2 rounded-xl bg-slate-950/95 p-3 text-white shadow-xl backdrop-blur sm:p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <input type="password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="Access code" className="min-h-11 rounded-lg border border-white/15 bg-white/10 px-3 text-sm" />
              <input value={venueName} onChange={(event) => { setVenueName(event.target.value); if (draft) setDraft({ ...draft, venue: event.target.value }); }} placeholder="Venue" className="min-h-11 rounded-lg border border-white/15 bg-white/10 px-3 text-sm" />
              <input value={neighborhood} onChange={(event) => { setNeighborhood(event.target.value); if (draft) setDraft({ ...draft, neighborhood: event.target.value }); }} placeholder="Neighborhood" className="min-h-11 rounded-lg border border-white/15 bg-white/10 px-3 text-sm" />
              <input type="date" value={eventDate} onChange={(event) => { setEventDate(event.target.value); if (draft) setDraft({ ...draft, eventDate: event.target.value }); }} className="min-h-11 rounded-lg border border-white/15 bg-white/10 px-3 text-sm [color-scheme:dark]" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-fuchsia-500 px-4 text-sm font-black hover:bg-fuchsia-400">Upload flyer<input className="sr-only" type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files?.[0])} /></label>
              <button type="button" onClick={() => draft && setDraft({ ...draft, rotation: Math.max(-5, draft.rotation - 1) })} disabled={!draft || posting} className="min-h-11 rounded-lg border border-white/15 px-3 font-bold disabled:opacity-40">↶</button>
              <button type="button" onClick={() => draft && setDraft({ ...draft, rotation: Math.min(5, draft.rotation + 1) })} disabled={!draft || posting} className="min-h-11 rounded-lg border border-white/15 px-3 font-bold disabled:opacity-40">↷</button>
              <button type="button" onClick={publishDraft} disabled={!draft || posting} className="min-h-11 rounded-lg bg-white px-4 font-black text-slate-950 disabled:opacity-40">📌 {posting ? "Publishing..." : "Publish flyer"}</button>
              <span className="min-w-[220px] flex-1 text-xs leading-5 text-slate-300 sm:text-sm" aria-live="polite">{status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/85 p-4 text-sm text-slate-200 sm:grid-cols-3">
        <div><span className="mr-2 text-fuchsia-300">✓</span><strong className="text-white">Verified access code required</strong></div>
        <div><span className="mr-2 text-fuchsia-300">📌</span><strong className="text-white">No covering other flyers</strong></div>
        <div><span className="mr-2 text-fuchsia-300">♡</span><strong className="text-white">Auto-archive after the event</strong></div>
      </div>
    </div>
  );
}
