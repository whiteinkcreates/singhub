"use client";

import { useMemo, useRef, useState } from "react";

type BoardRegion = "all" | "east-county" | "central" | "beach" | "downtown" | "south-bay" | "north-county";
type FlyerKind = "one-off" | "recurring" | "upload";

type BoardFlyer = {
  id: string;
  title: string;
  venue: string;
  neighborhood: string;
  region: Exclude<BoardRegion, "all">;
  detail: string;
  x: number;
  y: number;
  rotation: number;
  tone: "blue" | "gold" | "pink";
  kind: FlyerKind;
  imageUrl?: string;
  pinned?: boolean;
  eventDate?: string;
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

const seededFlyers: BoardFlyer[] = [
  { id: "casino-duets-sept-6", title: "Duets Night", venue: "Casino Inn Bar & Grill", neighborhood: "Alpine", region: "east-county", detail: "Sunday, Sept 6 · 6:00 PM", x: 7, y: 47, rotation: -2.4, tone: "gold", kind: "one-off", pinned: true, eventDate: "2026-09-06" },
  { id: "hoffers-saturday", title: "Karaoke Night", venue: "Hoffer's Cigar Bar", neighborhood: "La Mesa", region: "east-county", detail: "Every Saturday · 7:00–11:00 PM", x: 70, y: 34, rotation: 2.8, tone: "pink", kind: "recurring", pinned: true },
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

const toneClasses = {
  blue: "from-sky-100 via-white to-blue-100 text-slate-950",
  gold: "from-amber-100 via-yellow-50 to-orange-100 text-slate-950",
  pink: "from-slate-950 via-fuchsia-950 to-slate-950 text-white",
};

export function SingBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [flyers, setFlyers] = useState<BoardFlyer[]>(seededFlyers);
  const [activeRegion, setActiveRegion] = useState<BoardRegion>("all");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [pinInHand, setPinInHand] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [eventDate, setEventDate] = useState("");
  const [status, setStatus] = useState("Verified posters can upload, place and pin a flyer in a few clicks.");

  const draft = useMemo(() => flyers.find((flyer) => flyer.id === draftId), [draftId, flyers]);
  const visibleFlyers = useMemo(() => flyers.filter((flyer) => activeRegion === "all" || flyer.region === activeRegion), [activeRegion, flyers]);
  const activeLabel = boardRegions.find((region) => region.id === activeRegion)?.label ?? "All San Diego";
  const archiveLabel = nextDayLabel(eventDate);

  function isBlocked(x: number, y: number, id: string) {
    const moving: Rect = { x, y, w: 25, h: 28 };
    if (reservedRects.some((rect) => overlapRatio(moving, rect) > 0.08)) return true;
    return flyers.some((flyer) => flyer.id !== id && flyer.pinned && overlapRatio(moving, { x: flyer.x, y: flyer.y, w: 24, h: 27 }) > 0.18);
  }

  function handleUpload(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) { setStatus("Choose an image file for the flyer."); return; }
    if (draft?.imageUrl?.startsWith("blob:")) URL.revokeObjectURL(draft.imageUrl);
    const id = `draft-${Date.now()}`;
    const region = activeRegion === "all" ? "central" : activeRegion;
    const flyer: BoardFlyer = { id, title: file.name.replace(/\.[^.]+$/, "") || "New karaoke flyer", venue: "Your venue", neighborhood: "Your neighborhood", region, detail: "Place me on an open part of the board", x: 37, y: 47, rotation: -1, tone: "pink", kind: "upload", imageUrl: URL.createObjectURL(file), pinned: false };
    setFlyers((current) => [...current.filter((item) => item.id !== draftId), flyer]);
    setDraftId(id);
    setEventDate("");
    setPinInHand(false);
    setStatus("Flyer loaded. Confirm the event date, then place it on an open spot.");
  }

  function startDrag(event: React.PointerEvent<HTMLButtonElement>, flyer: BoardFlyer) {
    if (flyer.id !== draftId || flyer.pinned || pinInHand) return;
    const board = boardRef.current; if (!board) return;
    const rect = board.getBoundingClientRect();
    setDragOffset({ x: event.clientX - (rect.left + (flyer.x / 100) * rect.width), y: event.clientY - (rect.top + (flyer.y / 100) * rect.height) });
    setDraggingId(flyer.id);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!draggingId) return;
    const board = boardRef.current; if (!board) return;
    const rect = board.getBoundingClientRect();
    const x = Math.max(2, Math.min(73, ((event.clientX - rect.left - dragOffset.x) / rect.width) * 100));
    const y = Math.max(18, Math.min(70, ((event.clientY - rect.top - dragOffset.y) / rect.height) * 100));
    if (isBlocked(x, y, draggingId)) {
      setStatus("That spot covers something already pinned. Find a little breathing room.");
      return;
    }
    setFlyers((current) => current.map((item) => item.id === draggingId ? { ...item, x, y } : item));
    setStatus("Looks clear. Drop it there or keep moving.");
  }

  function endDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!draggingId) return;
    setDraggingId(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setStatus(eventDate ? "Placement looks good. Grab a pin when you are ready." : "Placement looks good. Confirm the event date before pinning.");
  }

  function pinDraft() {
    if (!draftId) { setStatus("Upload your flyer first."); return; }
    if (!eventDate) { setStatus("Confirm the event date first. We use it to archive the flyer automatically."); return; }
    if (!pinInHand) { setStatus("Grab a pin first."); return; }
    setFlyers((current) => current.map((item) => item.id === draftId ? { ...item, pinned: true, eventDate } : item));
    setPinInHand(false);
    setStatus(`Pinned. This flyer leaves the live board and moves to the archive on ${archiveLabel}.`);
  }

  function rotateDraft(delta: number) {
    if (!draftId) return;
    setFlyers((current) => current.map((item) => item.id === draftId && !item.pinned ? { ...item, rotation: Math.max(-5, Math.min(5, item.rotation + delta)) } : item));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300">Want on the board?</p>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">Posting is invite-only for verified San Diego venues and KJs. Start the conversation and we&apos;ll unlock board access.</p>
        </div>
        <a href="mailto:hello@singhub.app?subject=SingBoard%20posting%20access&body=Hi%20SingHUB%2C%0A%0AI%27d%20like%20to%20get%20verified%20for%20SingBoard%20access.%0A%0AName%3A%0AVenue%20or%20KJ%3A%0A" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-black text-white transition hover:bg-fuchsia-400">Get verified for board access</a>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {boardRegions.map((region) => <button key={region.id} type="button" onClick={() => setActiveRegion(region.id)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black transition ${activeRegion === region.id ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}>{region.label}</button>)}
      </div>

      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#3d2412,#8b5529_20%,#5c361a_48%,#9f6733_78%,#3e2413)] p-3 shadow-[0_28px_80px_rgba(0,0,0,.65)] sm:p-5 lg:p-6">
        <div ref={boardRef} className="relative min-h-[900px] overflow-hidden rounded-[1.1rem] border border-amber-950/60 bg-[#ae7041] shadow-[inset_0_0_55px_rgba(69,34,10,.35)] sm:min-h-[960px] lg:min-h-[1020px]" style={{ backgroundImage: "radial-gradient(circle at 12% 18%, rgba(80,42,15,.22) 0 1px, transparent 1.7px), radial-gradient(circle at 61% 33%, rgba(255,238,205,.18) 0 1px, transparent 1.7px), radial-gradient(circle at 77% 81%, rgba(85,47,19,.18) 0 1px, transparent 1.5px), linear-gradient(105deg, rgba(255,255,255,.035), transparent 38%, rgba(77,39,12,.05))", backgroundSize: "13px 17px, 19px 23px, 29px 31px, 100% 100%" }} aria-label={`${activeLabel} SingBoard`}>
          <div className="absolute left-1/2 top-3 z-40 w-[76%] max-w-[880px] -translate-x-1/2 sm:top-4">
            {/* Use the approved SingBOARD artwork as one asset. Do not reconstruct or overlay the wordmark in code. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://res.cloudinary.com/dy3lyejkk/image/upload/v1787617301/ChatGPT_Image_Aug_24_2026_05_19_59_PM_r1ttcs.png" alt="SingBOARD" className="h-auto w-full object-contain" draggable={false} />
          </div>

          <div className="absolute right-[4%] top-[16%] z-20 rotate-[3deg] bg-[#ffe89a] px-4 py-4 text-center text-slate-950 shadow-[0_10px_18px_rgba(63,31,10,.35)] sm:right-[6%] sm:w-[190px]">
            <span className="absolute left-1/2 top-[-9px] h-5 w-5 -translate-x-1/2 rounded-full bg-violet-700 shadow-md" />
            <p className="text-base font-black uppercase leading-6 sm:text-lg">Support local.<br />Sing loud.<br />Have fun! 💗</p>
          </div>

          <div className="absolute left-[4%] top-[19%] z-20 w-[42%] max-w-[250px] rotate-[-2deg] bg-[#fffdf7] p-4 text-slate-950 shadow-[0_14px_20px_rgba(58,30,10,.32)] sm:w-[24%]">
            <span className="absolute left-1/2 top-2 h-5 w-5 -translate-x-1/2 rounded-full border border-fuchsia-950 bg-fuchsia-500 shadow-md" />
            <h2 className="mt-3 text-sm font-black uppercase sm:text-lg">Post a flyer</h2>
            <ol className="mt-3 space-y-2 text-xs font-bold leading-5 sm:text-sm">
              <li><strong>1.</strong> Get verified for board access</li>
              <li><strong>2.</strong> Upload + confirm event date</li>
              <li><strong>3.</strong> Place your flyer</li>
              <li><strong>4.</strong> Grab a pin + publish</li>
            </ol>
            <p className="mt-3 border-t border-slate-300 pt-3 text-[0.7rem] font-bold text-slate-500 sm:text-xs">Flyers automatically leave the live board the day after the event and move to the archive.</p>
          </div>

          {visibleFlyers.length === 0 && <div className="absolute inset-x-0 top-[48%] flex justify-center p-8"><div className="rotate-[-1deg] bg-white/90 p-5 text-center text-slate-950 shadow-lg"><p className="text-xl font-black">Fresh cork.</p><p className="mt-1 text-sm font-bold">Nothing pinned here yet.</p></div></div>}

          {visibleFlyers.map((flyer) => {
            const isDraft = flyer.id === draftId;
            const oneOff = flyer.kind === "one-off";
            return <button key={flyer.id} type="button" aria-label={`${flyer.title} at ${flyer.venue}`} className={`absolute select-none text-left shadow-[0_16px_22px_rgba(40,20,5,0.34)] outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 ${oneOff ? "w-[36%] max-w-[235px] sm:w-[23%]" : "w-[42%] max-w-[270px] sm:w-[28%]"} ${isDraft && !flyer.pinned ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`} style={{ left: `${flyer.x}%`, top: `${flyer.y}%`, transform: `rotate(${flyer.rotation}deg)`, zIndex: isDraft ? 35 : 10 }} onPointerDown={(event) => startDrag(event, flyer)} onPointerMove={moveDrag} onPointerUp={endDrag} onClick={() => { if (isDraft && pinInHand && !flyer.pinned) pinDraft(); }}>
              {flyer.pinned && <span className="absolute left-1/2 top-2 z-20 h-5 w-5 -translate-x-1/2 rounded-full border border-red-950 bg-red-500 shadow-[0_3px_5px_rgba(0,0,0,.5)]" aria-hidden="true"><span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-200/70" /></span>}
              {flyer.imageUrl ? <img src={flyer.imageUrl} alt="" className="block h-auto max-h-[360px] w-full bg-white object-contain" draggable={false} /> : oneOff ? <span className="block min-h-48 bg-[#fff1a8] p-5 pt-10 text-slate-950 shadow-inner"><span className="block text-[0.65rem] font-black uppercase tracking-[0.18em] opacity-60">One night · {flyer.neighborhood}</span><span className="mt-2 block text-xl font-black leading-tight sm:text-2xl">{flyer.title}</span><span className="mt-5 block text-sm font-black sm:text-base">{flyer.venue}</span><span className="mt-1 block text-xs font-bold opacity-75">{flyer.detail}</span></span> : <span className={`block min-h-56 bg-gradient-to-br p-5 pt-10 ${toneClasses[flyer.tone]}`}><span className="block text-[0.65rem] font-black uppercase tracking-[0.22em] opacity-60">{flyer.neighborhood}</span><span className="mt-2 block text-2xl font-black leading-tight">{flyer.title}</span><span className="mt-5 block text-base font-black">{flyer.venue}</span><span className="mt-1 block text-xs font-bold opacity-70">{flyer.detail}</span></span>}
            </button>;
          })}

          <div className="absolute bottom-[5%] left-1/2 z-40 w-[90%] max-w-[900px] -translate-x-1/2 rounded-xl bg-slate-950/94 p-3 text-white shadow-xl backdrop-blur sm:p-4">
            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-fuchsia-500 px-4 text-sm font-black text-white hover:bg-fuchsia-400">Upload flyer<input className="sr-only" type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files?.[0])} /></label>
              {draft && !draft.pinned && <label className="min-w-[160px] flex-1 sm:max-w-[220px]"><span className="mb-1 block text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-400">Confirm event date</span><input type="date" value={eventDate} onChange={(event) => { setEventDate(event.target.value); setStatus(event.target.value ? `Got it. This will archive automatically on ${nextDayLabel(event.target.value)}.` : "Confirm the event date before pinning."); }} className="min-h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm font-bold text-white [color-scheme:dark]" /></label>}
              <button type="button" onClick={() => rotateDraft(-1)} disabled={!draft || draft.pinned} className="min-h-11 rounded-lg border border-white/15 px-3 font-bold disabled:opacity-40">↶</button>
              <button type="button" onClick={() => rotateDraft(1)} disabled={!draft || draft.pinned} className="min-h-11 rounded-lg border border-white/15 px-3 font-bold disabled:opacity-40">↷</button>
              <button type="button" onClick={() => { if (!draft || draft.pinned) return; if (!eventDate) { setStatus("Confirm the event date first."); return; } setPinInHand(true); setStatus("Pin in hand. Tap your flyer to stick it."); }} disabled={!draft || draft.pinned} className={`min-h-11 rounded-lg px-4 font-black disabled:opacity-40 ${pinInHand ? "bg-red-400 text-slate-950" : "bg-white text-slate-950"}`}>📌 {pinInHand ? "Pin in hand" : "Grab a pin"}</button>
              <span className="min-w-[220px] flex-[2] text-xs leading-5 text-slate-300 sm:text-sm" aria-live="polite">{status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/85 p-4 text-sm text-slate-200 sm:grid-cols-3">
        <div><span className="mr-2 text-fuchsia-300">✓</span><strong className="text-white">Verified venues &amp; KJs only</strong></div>
        <div><span className="mr-2 text-fuchsia-300">📌</span><strong className="text-white">No covering other flyers</strong></div>
        <div><span className="mr-2 text-fuchsia-300">♡</span><strong className="text-white">Auto-archive after the event</strong></div>
      </div>
    </div>
  );
}
