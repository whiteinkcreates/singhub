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
  { id: "casino-duets-sept-6", title: "Karaoke Contest: Duets Night", venue: "Casino Inn Bar & Grill", neighborhood: "Alpine", region: "east-county", detail: "Sunday, Sept 6 · 6:00 PM", x: 8, y: 28, rotation: -2.4, tone: "blue", pinned: true },
  { id: "hoffers-saturday", title: "Karaoke Night", venue: "Hoffer's Cigar Bar", neighborhood: "La Mesa", region: "east-county", detail: "Every Saturday · 7:00–11:00 PM", x: 57, y: 25, rotation: 2.8, tone: "gold", pinned: true },
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
  const [status, setStatus] = useState("Try the pinning interaction below. Posting access is invite-only.");

  const draft = useMemo(() => flyers.find((flyer) => flyer.id === draftId), [draftId, flyers]);
  const visibleFlyers = useMemo(() => flyers.filter((flyer) => activeRegion === "all" || flyer.region === activeRegion), [activeRegion, flyers]);
  const activeLabel = boardRegions.find((region) => region.id === activeRegion)?.label ?? "All San Diego";

  function handleUpload(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) { setStatus("Choose an image file for the flyer."); return; }
    if (draft?.imageUrl?.startsWith("blob:")) URL.revokeObjectURL(draft.imageUrl);
    const id = `draft-${Date.now()}`;
    const region = activeRegion === "all" ? "central" : activeRegion;
    const flyer: BoardFlyer = { id, title: file.name.replace(/\.[^.]+$/, "") || "New karaoke flyer", venue: "Your venue", neighborhood: "Your neighborhood", region, detail: "Drag me into place", x: 35, y: 56, rotation: -1, tone: "pink", imageUrl: URL.createObjectURL(file), pinned: false };
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
    const y = Math.max(20, Math.min(69, ((event.clientY - rect.top - dragOffset.y) / rect.height) * 100));
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
    setPinInHand(false); setStatus("Pinned. In production, verified posters will publish from here.");
  }

  function rotateDraft(delta: number) {
    if (!draftId) return;
    setFlyers((current) => current.map((item) => item.id === draftId && !item.pinned ? { ...item, rotation: Math.max(-6, Math.min(6, item.rotation + delta)) } : item));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300">Want to post here?</p>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">SingBoard posting is for verified San Diego venues and KJs. Ask for access and we will get you set up.</p>
        </div>
        <a href="mailto:hello@singhub.app?subject=SingBoard%20posting%20access&body=Hi%20SingHUB%2C%0A%0AI%27d%20like%20posting%20access%20to%20SingBoard.%0A%0AName%3A%0AVenue%20or%20KJ%3A%0A" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-black text-white transition hover:bg-fuchsia-400">Ask for posting access</a>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {boardRegions.map((region) => <button key={region.id} type="button" onClick={() => setActiveRegion(region.id)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black transition ${activeRegion === region.id ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"}`}>{region.label}</button>)}
      </div>

      <div className="rounded-[1.8rem] bg-[linear-gradient(135deg,#4b2d16,#8a5529_20%,#5a3519_52%,#9d6937_78%,#432512)] p-3 shadow-[0_28px_70px_rgba(0,0,0,.55)] sm:p-5">
        <div ref={boardRef} className="relative min-h-[720px] overflow-hidden rounded-[1rem] border border-amber-950/60 bg-[#b77b48] shadow-inner" style={{ backgroundImage: "radial-gradient(circle at 12% 18%, rgba(80,42,15,.22) 0 1px, transparent 1.7px), radial-gradient(circle at 61% 33%, rgba(255,238,205,.18) 0 1px, transparent 1.7px), radial-gradient(circle at 77% 81%, rgba(85,47,19,.18) 0 1px, transparent 1.5px), linear-gradient(105deg, rgba(255,255,255,.035), transparent 38%, rgba(77,39,12,.05))", backgroundSize: "13px 17px, 19px 23px, 29px 31px, 100% 100%" }} aria-label={`${activeLabel} SingBoard`}>
          <div className="absolute left-1/2 top-5 z-30 -translate-x-1/2 rotate-[-0.4deg] whitespace-nowrap rounded-sm bg-[#f6f1e8] px-5 py-2 shadow-[0_8px_14px_rgba(65,35,12,.35)] sm:px-8">
            <span className="text-3xl font-bold italic leading-none text-fuchsia-600 sm:text-5xl" style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive' }}>Sing</span><span className="ml-1 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">BOARD</span>
            <span className="ml-3 hidden text-xs font-black uppercase tracking-[0.16em] text-slate-500 sm:inline">{activeLabel}</span>
          </div>

          <div className="absolute left-[5%] top-[14%] z-20 w-[40%] max-w-[255px] rotate-[-2deg] bg-[#fffdf5] p-4 text-slate-900 shadow-[0_12px_18px_rgba(68,37,13,.32)] sm:w-[27%] sm:p-5">
            <span className="absolute left-1/2 top-2 h-5 w-5 -translate-x-1/2 rounded-full border border-red-950 bg-red-500 shadow-md" />
            <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-700">How to get on the board</p>
            <ol className="mt-3 space-y-2 text-sm font-bold leading-5">
              <li>1. Get verified by SingHUB.</li>
              <li>2. Upload your karaoke flyer.</li>
              <li>3. Put it where you want it.</li>
              <li>4. Grab a pin.</li>
              <li>5. Stick it. You are live.</li>
            </ol>
            <p className="mt-4 border-t border-slate-300 pt-3 text-xs font-bold text-slate-500">Venue or KJ? Ask for posting access.</p>
          </div>

          {visibleFlyers.length === 0 && <div className="absolute inset-0 flex items-center justify-center p-8"><div className="rotate-[-1deg] bg-white/90 p-5 text-center text-slate-950 shadow-lg"><p className="text-xl font-black">Fresh cork.</p><p className="mt-1 text-sm font-bold">Nothing pinned here yet.</p></div></div>}

          {visibleFlyers.map((flyer) => {
            const isDraft = flyer.id === draftId;
            return <button key={flyer.id} type="button" aria-label={`${flyer.title} at ${flyer.venue}`} className={`absolute w-[42%] max-w-[260px] select-none text-left shadow-[0_16px_22px_rgba(40,20,5,0.34)] outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 sm:w-[30%] ${isDraft && !flyer.pinned ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`} style={{ left: `${flyer.x}%`, top: `${flyer.y}%`, transform: `rotate(${flyer.rotation}deg)`, zIndex: isDraft ? 25 : 10 }} onPointerDown={(event) => startDrag(event, flyer)} onPointerMove={moveDrag} onPointerUp={endDrag} onClick={() => { if (isDraft && pinInHand && !flyer.pinned) pinDraft(); }}>
              {flyer.pinned && <span className="absolute left-1/2 top-2 z-20 h-5 w-5 -translate-x-1/2 rounded-full border border-red-950 bg-red-500 shadow-[0_3px_5px_rgba(0,0,0,.5)]" aria-hidden="true"><span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-200/70" /></span>}
              {flyer.imageUrl ? <img src={flyer.imageUrl} alt="" className="block h-auto w-full bg-white object-cover" draggable={false} /> : <span className={`block min-h-56 bg-gradient-to-br p-5 pt-10 ${toneClasses[flyer.tone]}`}><span className="block text-[0.65rem] font-black uppercase tracking-[0.22em] opacity-60">{flyer.neighborhood}</span><span className="mt-2 block text-2xl font-black leading-tight">{flyer.title}</span><span className="mt-5 block text-base font-black">{flyer.venue}</span><span className="mt-1 block text-xs font-bold opacity-70">{flyer.detail}</span></span>}
            </button>;
          })}

          <div className="absolute bottom-3 left-3 right-3 z-40 rounded-xl bg-slate-950/92 p-3 text-white shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-fuchsia-500 px-4 text-sm font-black text-white hover:bg-fuchsia-400">Try your flyer<input className="sr-only" type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files?.[0])} /></label>
              <button type="button" onClick={() => rotateDraft(-1)} disabled={!draft || draft.pinned} className="min-h-11 rounded-lg border border-white/15 px-3 font-bold disabled:opacity-40">↶</button>
              <button type="button" onClick={() => rotateDraft(1)} disabled={!draft || draft.pinned} className="min-h-11 rounded-lg border border-white/15 px-3 font-bold disabled:opacity-40">↷</button>
              <button type="button" onClick={() => { if (!draft || draft.pinned) return; setPinInHand(true); setStatus("Pin in hand. Tap your flyer to stick it."); }} disabled={!draft || draft.pinned} className={`min-h-11 rounded-lg px-4 font-black disabled:opacity-40 ${pinInHand ? "bg-red-400 text-slate-950" : "bg-white text-slate-950"}`}>📌 {pinInHand ? "Pin in hand" : "Grab a pin"}</button>
              <span className="min-w-0 flex-1 text-sm text-slate-300" aria-live="polite">{status}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs leading-5 text-slate-500">The upload control above is a local interaction preview only. Public posting will remain gated to verified venue and KJ contributors.</p>
    </div>
  );
}
