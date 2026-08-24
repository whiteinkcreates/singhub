"use client";

import { useMemo, useRef, useState } from "react";

type BoardRegion = "all" | "east-county" | "central" | "beach" | "downtown" | "south-bay" | "north-county";

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
  imageUrl?: string;
  pinned?: boolean;
};

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
  { id: "casino-duets-sept-6", title: "Karaoke Contest: Duets Night", venue: "Casino Inn Bar & Grill", neighborhood: "Alpine", region: "east-county", detail: "Sunday, Sept 6 · 6:00 PM", x: 8, y: 11, rotation: -2.4, tone: "blue", pinned: true },
  { id: "hoffers-saturday", title: "Karaoke Night", venue: "Hoffer's Cigar Bar", neighborhood: "La Mesa", region: "east-county", detail: "Every Saturday · 7:00–11:00 PM", x: 55, y: 20, rotation: 2.8, tone: "gold", pinned: true },
];

const toneClasses = {
  blue: "from-sky-100 via-white to-blue-100 text-slate-950",
  gold: "from-amber-100 via-yellow-50 to-orange-100 text-slate-950",
  pink: "from-fuchsia-100 via-white to-rose-100 text-slate-950",
};

export function SingBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [flyers, setFlyers] = useState<BoardFlyer[]>(seededFlyers);
  const [activeRegion, setActiveRegion] = useState<BoardRegion>("all");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [pinInHand, setPinInHand] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState("Upload a flyer, place it, then grab a pin.");

  const draft = useMemo(() => flyers.find((flyer) => flyer.id === draftId), [draftId, flyers]);
  const visibleFlyers = useMemo(() => flyers.filter((flyer) => activeRegion === "all" || flyer.region === activeRegion), [activeRegion, flyers]);
  const activeLabel = boardRegions.find((region) => region.id === activeRegion)?.label ?? "All San Diego";

  function handleUpload(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) { setStatus("Choose an image file for the flyer."); return; }
    if (draft?.imageUrl?.startsWith("blob:")) URL.revokeObjectURL(draft.imageUrl);
    const id = `draft-${Date.now()}`;
    const region = activeRegion === "all" ? "central" : activeRegion;
    const flyer: BoardFlyer = { id, title: file.name.replace(/\.[^.]+$/, "") || "New karaoke flyer", venue: "Your venue", neighborhood: "Choose neighborhood", region, detail: "Drag me into place", x: 34, y: 54, rotation: -1, tone: "pink", imageUrl: URL.createObjectURL(file), pinned: false };
    setFlyers((current) => [...current.filter((item) => item.id !== draftId), flyer]);
    setDraftId(id); setPinInHand(false); setStatus("Flyer is on the board. Drag it where you want it.");
  }

  function startDrag(event: React.PointerEvent<HTMLButtonElement>, flyer: BoardFlyer) {
    if (flyer.id !== draftId || flyer.pinned || pinInHand) return;
    const board = boardRef.current; if (!board) return;
    const rect = board.getBoundingClientRect();
    setDragOffset({ x: event.clientX - (rect.left + (flyer.x / 100) * rect.width), y: event.clientY - (rect.top + (flyer.y / 100) * rect.height) });
    setDraggingId(flyer.id); event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!draggingId) return; const board = boardRef.current; if (!board) return; const rect = board.getBoundingClientRect();
    const x = Math.max(2, Math.min(72, ((event.clientX - rect.left - dragOffset.x) / rect.width) * 100));
    const y = Math.max(4, Math.min(64, ((event.clientY - rect.top - dragOffset.y) / rect.height) * 100));
    setFlyers((current) => current.map((item) => item.id === draggingId ? { ...item, x, y } : item));
  }

  function endDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!draggingId) return; setDraggingId(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setStatus("Nice. Now grab a pin and stick it.");
  }

  function pinDraft() {
    if (!draftId) { setStatus("Upload your flyer first."); return; }
    if (!pinInHand) { setStatus("Grab a pin first."); return; }
    setFlyers((current) => current.map((item) => item.id === draftId ? { ...item, pinned: true } : item));
    setPinInHand(false); setStatus("Pinned. One event can surface here, on its local board, and on venue or host profiles once storage is connected.");
  }

  function rotateDraft(delta: number) {
    if (!draftId) return;
    setFlyers((current) => current.map((item) => item.id === draftId && !item.pinned ? { ...item, rotation: Math.max(-6, Math.min(6, item.rotation + delta)) } : item));
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300">Pin your flyer</p><p className="mt-1 text-sm text-slate-300">Post once. SingHUB puts it on the right local board.</p></div>
          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-black text-white transition hover:bg-fuchsia-400">Upload flyer<input className="sr-only" type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files?.[0])} /></label>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {boardRegions.map((region) => <button key={region.id} type="button" onClick={() => setActiveRegion(region.id)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black transition ${activeRegion === region.id ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}>{region.label}</button>)}
        </div>
      </div>

      <div ref={boardRef} className="relative min-h-[620px] overflow-hidden rounded-[1.5rem] border-[10px] border-amber-950/90 bg-[#b87943] shadow-2xl shadow-black/40" style={{ backgroundImage: "radial-gradient(circle at 20% 25%, rgba(255,255,255,.08) 0 1px, transparent 2px), radial-gradient(circle at 70% 65%, rgba(67,35,15,.17) 0 1px, transparent 2px)", backgroundSize: "17px 19px, 23px 29px" }} aria-label={`${activeLabel} SingBoard`}>
        <div className="absolute left-4 top-4 z-30 rotate-[-1deg] bg-white px-4 py-2 font-black text-slate-950 shadow-lg">SINGBOARD · {activeLabel.toUpperCase()}</div>
        {visibleFlyers.length === 0 && <div className="absolute inset-0 flex items-center justify-center p-8"><div className="rotate-[-1deg] bg-white/90 p-5 text-center text-slate-950 shadow-lg"><p className="text-xl font-black">Fresh cork.</p><p className="mt-1 text-sm font-bold">Nothing pinned here yet.</p></div></div>}
        {visibleFlyers.map((flyer) => {
          const isDraft = flyer.id === draftId;
          return <button key={flyer.id} type="button" aria-label={`${flyer.title} at ${flyer.venue}`} className={`absolute w-[42%] max-w-[260px] select-none text-left shadow-[0_16px_22px_rgba(40,20,5,0.34)] outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 sm:w-[34%] ${isDraft && !flyer.pinned ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`} style={{ left: `${flyer.x}%`, top: `${flyer.y}%`, transform: `rotate(${flyer.rotation}deg)`, zIndex: isDraft ? 25 : 10 }} onPointerDown={(event) => startDrag(event, flyer)} onPointerMove={moveDrag} onPointerUp={endDrag} onClick={() => { if (isDraft && pinInHand && !flyer.pinned) pinDraft(); }}>
            {flyer.pinned && <span className="absolute left-1/2 top-2 z-20 h-5 w-5 -translate-x-1/2 rounded-full border border-red-950 bg-red-500 shadow-[0_3px_5px_rgba(0,0,0,.5)]" aria-hidden="true"><span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-200/70" /></span>}
            {flyer.imageUrl ? <img src={flyer.imageUrl} alt="" className="block h-auto w-full bg-white object-cover" draggable={false} /> : <span className={`block min-h-56 bg-gradient-to-br p-5 pt-10 ${toneClasses[flyer.tone]}`}><span className="block text-[0.65rem] font-black uppercase tracking-[0.22em] opacity-60">{flyer.neighborhood}</span><span className="mt-2 block text-2xl font-black leading-tight">{flyer.title}</span><span className="mt-5 block text-base font-black">{flyer.venue}</span><span className="mt-1 block text-xs font-bold opacity-70">{flyer.detail}</span></span>}
          </button>;
        })}
        <div className="absolute bottom-3 left-3 right-3 z-40 flex flex-wrap items-center gap-2 rounded-xl bg-slate-950/90 p-3 text-white shadow-xl backdrop-blur">
          <button type="button" onClick={() => rotateDraft(-1)} disabled={!draft || draft.pinned} className="min-h-11 rounded-lg border border-white/15 px-3 font-bold disabled:opacity-40">↶ Rotate</button>
          <button type="button" onClick={() => rotateDraft(1)} disabled={!draft || draft.pinned} className="min-h-11 rounded-lg border border-white/15 px-3 font-bold disabled:opacity-40">Rotate ↷</button>
          <button type="button" onClick={() => { if (!draft || draft.pinned) return; setPinInHand(true); setStatus("Pin in hand. Tap your flyer to stick it to the board."); }} disabled={!draft || draft.pinned} className={`min-h-11 rounded-lg px-4 font-black disabled:opacity-40 ${pinInHand ? "bg-red-400 text-slate-950" : "bg-white text-slate-950"}`}>📌 {pinInHand ? "Pin in hand" : "Grab a pin"}</button>
          <span className="min-w-0 flex-1 text-sm text-slate-300" aria-live="polite">{status}</span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="font-black text-white">Verified venues + hosts</p><p className="mt-1 text-sm text-slate-400">Basic publishing should stay open to trusted contributors who improve SingHUB's event data.</p></div><div className="rounded-xl border border-fuchsia-300/20 bg-fuchsia-300/5 p-4"><p className="font-black text-fuchsia-200">Enhanced profiles</p><p className="mt-1 text-sm text-slate-400">More active flyers, priority placement, scheduling and performance insights become the upgrade.</p></div></div>
      <p className="text-xs leading-5 text-slate-400">This prototype now treats SingBoard as one location-aware event surface. Persistent event storage, verification and profile distribution are the next data-layer step.</p>
    </div>
  );
}
