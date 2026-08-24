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
  { id: "casino-duets-sept-6", title: "Karaoke Contest: Duets Night", venue: "Casino Inn Bar & Grill", neighborhood: "Alpine", region: "east-county", detail: "Sunday, Sept 6 · 6:00 PM", x: 8, y: 30, rotation: -2.4, tone: "blue", pinned: true },
  { id: "hoffers-saturday", title: "Karaoke Night", venue: "Hoffer's Cigar Bar", neighborhood: "La Mesa", region: "east-county", detail: "Every Saturday · 7:00–11:00 PM", x: 61, y: 28, rotation: 2.8, tone: "gold", pinned: true },
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
  const [status, setStatus] = useState("Upload a flyer, drag it into place, then grab a pin.");

  const draft = useMemo(() => flyers.find((flyer) => flyer.id === draftId), [draftId, flyers]);
  const visibleFlyers = useMemo(() => flyers.filter((flyer) => activeRegion === "all" || flyer.region === activeRegion), [activeRegion, flyers]);
  const activeLabel = boardRegions.find((region) => region.id === activeRegion)?.label ?? "All San Diego";

  function handleUpload(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) { setStatus("Choose an image file for the flyer."); return; }
    if (draft?.imageUrl?.startsWith("blob:")) URL.revokeObjectURL(draft.imageUrl);
    const id = `draft-${Date.now()}`;
    const region = activeRegion === "all" ? "central" : activeRegion;
    const flyer: BoardFlyer = { id, title: file.name.replace(/\.[^.]+$/, "") || "New karaoke flyer", venue: "Your venue", neighborhood: "Your neighborhood", region, detail: "Drag me into place", x: 35, y: 58, rotation: -1, tone: "pink", imageUrl: URL.createObjectURL(file), pinned: false };
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
    const y = Math.max(20, Math.min(70, ((event.clientY - rect.top - dragOffset.y) / rect.height) * 100));
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
    setPinInHand(false); setStatus("Pinned. Verified contributors will publish from here once persistent posting is connected.");
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

      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#3d2412,#8b5529_20%,#5c361a_48%,#9f6733_78%,#3e2413)] p-3 shadow-[0_28px_80px_rgba(0,0,0,.65)] sm:p-5 lg:p-6">
        <div ref={boardRef} className="relative min-h-[860px] overflow-hidden rounded-[1.1rem] border border-amber-950/60 bg-[#ae7041] shadow-[inset_0_0_55px_rgba(69,34,10,.35)] sm:min-h-[920px] lg:min-h-[980px]" style={{ backgroundImage: "radial-gradient(circle at 12% 18%, rgba(80,42,15,.22) 0 1px, transparent 1.7px), radial-gradient(circle at 61% 33%, rgba(255,238,205,.18) 0 1px, transparent 1.7px), radial-gradient(circle at 77% 81%, rgba(85,47,19,.18) 0 1px, transparent 1.5px), linear-gradient(105deg, rgba(255,255,255,.035), transparent 38%, rgba(77,39,12,.05))", backgroundSize: "13px 17px, 19px 23px, 29px 31px, 100% 100%" }} aria-label={`${activeLabel} SingBoard`}>
          <div className="absolute left-1/2 top-3 z-40 w-[72%] max-w-[760px] -translate-x-1/2 sm:top-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/singboard-wordmark.svg" alt="SingBOARD" className="h-auto w-full" />
          </div>

          <div className="absolute right-[4%] top-[15%] z-20 rotate-[3deg] bg-[#ffe89a] px-4 py-4 text-center text-slate-950 shadow-[0_10px_18px_rgba(63,31,10,.35)] sm:right-[6%] sm:w-[190px]">
            <span className="absolute left-1/2 top-[-9px] h-5 w-5 -translate-x-1/2 rounded-full bg-violet-700 shadow-md" />
            <p className="text-base font-black uppercase leading-6 sm:text-lg">Support local.<br />Sing loud.<br />Have fun! 💗</p>
          </div>

          <div className="absolute left-1/2 top-[18%] z-30 w-[46%] max-w-[420px] -translate-x-1/2 rotate-[-1deg] bg-[#fffdf7] p-4 text-slate-950 shadow-[0_16px_22px_rgba(58,30,10,.35)] sm:w-[38%] sm:p-6 lg:w-[34%]">
            <span className="absolute left-1/2 top-2 h-5 w-5 -translate-x-1/2 rounded-full border border-fuchsia-950 bg-fuchsia-500 shadow-md" />
            <h2 className="mt-3 text-center text-lg font-black uppercase sm:text-2xl">Want to post your flyer?</h2>
            <p className="mt-1 text-center text-xs font-black uppercase tracking-[0.14em] text-fuchsia-700">Here&apos;s how it works:</p>
            <ol className="mt-4 space-y-3 text-sm font-bold leading-5 sm:text-base">
              <li><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-600 text-white">1</span>Get posting access</li>
              <li><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-600 text-white">2</span>Get verified</li>
              <li><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-600 text-white">3</span>Upload your flyer</li>
              <li><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-600 text-white">4</span>Pin it to the board</li>
              <li><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-600 text-white">5</span>Publish &amp; let&apos;s sing</li>
            </ol>
            <p className="mt-5 border-t border-slate-300 pt-4 text-center text-xs font-bold text-slate-500 sm:text-sm">Verified venues and KJs only.</p>
          </div>

          {visibleFlyers.length === 0 && <div className="absolute inset-x-0 top-[48%] flex justify-center p-8"><div className="rotate-[-1deg] bg-white/90 p-5 text-center text-slate-950 shadow-lg"><p className="text-xl font-black">Fresh cork.</p><p className="mt-1 text-sm font-bold">Nothing pinned here yet.</p></div></div>}

          {visibleFlyers.map((flyer) => {
            const isDraft = flyer.id === draftId;
            return <button key={flyer.id} type="button" aria-label={`${flyer.title} at ${flyer.venue}`} className={`absolute w-[42%] max-w-[260px] select-none text-left shadow-[0_16px_22px_rgba(40,20,5,0.34)] outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 sm:w-[30%] ${isDraft && !flyer.pinned ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`} style={{ left: `${flyer.x}%`, top: `${flyer.y}%`, transform: `rotate(${flyer.rotation}deg)`, zIndex: isDraft ? 35 : 10 }} onPointerDown={(event) => startDrag(event, flyer)} onPointerMove={moveDrag} onPointerUp={endDrag} onClick={() => { if (isDraft && pinInHand && !flyer.pinned) pinDraft(); }}>
              {flyer.pinned && <span className="absolute left-1/2 top-2 z-20 h-5 w-5 -translate-x-1/2 rounded-full border border-red-950 bg-red-500 shadow-[0_3px_5px_rgba(0,0,0,.5)]" aria-hidden="true"><span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-200/70" /></span>}
              {flyer.imageUrl ? <img src={flyer.imageUrl} alt="" className="block h-auto w-full bg-white object-cover" draggable={false} /> : <span className={`block min-h-56 bg-gradient-to-br p-5 pt-10 ${toneClasses[flyer.tone]}`}><span className="block text-[0.65rem] font-black uppercase tracking-[0.22em] opacity-60">{flyer.neighborhood}</span><span className="mt-2 block text-2xl font-black leading-tight">{flyer.title}</span><span className="mt-5 block text-base font-black">{flyer.venue}</span><span className="mt-1 block text-xs font-bold opacity-70">{flyer.detail}</span></span>}
            </button>;
          })}

          <div className="absolute bottom-[10%] left-1/2 z-30 w-[78%] max-w-[720px] -translate-x-1/2 rotate-[-0.4deg] bg-[#f4eee3] p-4 text-slate-950 shadow-[0_14px_20px_rgba(60,31,10,.35)] sm:p-5">
            <span className="absolute left-4 top-[-9px] h-5 w-5 rounded-full bg-sky-500 shadow-md" />
            <span className="absolute right-4 top-[-9px] h-5 w-5 rounded-full bg-sky-500 shadow-md" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-lg font-black uppercase sm:text-2xl">Want to pin your flyer here?</p><p className="mt-1 text-xs font-bold text-slate-600 sm:text-sm">Posting is invite-only for verified venues and KJs.</p></div>
              <a href="mailto:hello@singhub.app?subject=SingBoard%20posting%20access&body=Hi%20SingHUB%2C%0A%0AI%27d%20like%20posting%20access%20to%20SingBoard.%0A%0AName%3A%0AVenue%20or%20KJ%3A%0A" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border-2 border-fuchsia-500 px-4 py-2 text-sm font-black text-fuchsia-700 transition hover:bg-fuchsia-100">✉ Email us</a>
            </div>
          </div>

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

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/85 p-4 text-sm text-slate-200 sm:grid-cols-3">
        <div><span className="mr-2 text-fuchsia-300">✓</span><strong className="text-white">Verified venues &amp; KJs only</strong></div>
        <div><span className="mr-2 text-fuchsia-300">📌</span><strong className="text-white">Real events. Real people.</strong></div>
        <div><span className="mr-2 text-fuchsia-300">♡</span><strong className="text-white">Powered by the community</strong></div>
      </div>
    </div>
  );
}
