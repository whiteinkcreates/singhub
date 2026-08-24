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
  { id: "hoffers-saturday", title: "Karaoke Night", venue: "Hoffer's Cigar Bar", neighborhood: "La Mesa", region: "east-county", detail: "Every Saturday · 7:00–11:00 PM", x: 12, y: 25, rotation: -3, tone: "pink", pinned: true },
  { id: "casino-duets-sept-6", title: "Karaoke Contest: Duets Night", venue: "Casino Inn Bar & Grill", neighborhood: "Alpine", region: "east-county", detail: "Sunday, Sept 6 · 6:00 PM", x: 28, y: 46, rotation: -1.5, tone: "gold", pinned: true },
  { id: "whiskey-live-band", title: "Live Band Karaoke", venue: "Whiskey Girl", neighborhood: "Gaslamp", region: "downtown", detail: "Thursdays · 9:00 PM–1:00 AM", x: 66, y: 25, rotation: 1.8, tone: "pink", pinned: true },
  { id: "rabbit-hole-live-band", title: "Live Band Karaoke", venue: "The Rabbit Hole", neighborhood: "Normal Heights", region: "central", detail: "Fridays · 9:30 PM–12:30 AM", x: 82, y: 27, rotation: 2.5, tone: "blue", pinned: true },
  { id: "kensington-sunday", title: "Karaoke Sundays", venue: "Kensington Club", neighborhood: "Kensington", region: "central", detail: "Sundays · 6:00–11:00 PM", x: 65, y: 56, rotation: 2, tone: "gold", pinned: true },
];

const toneClasses = {
  blue: "from-slate-950 via-slate-900 to-sky-950 text-white",
  gold: "from-amber-200 via-yellow-100 to-orange-200 text-slate-950",
  pink: "from-slate-950 via-fuchsia-950 to-slate-950 text-white",
};

export function SingBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [activeRegion, setActiveRegion] = useState<BoardRegion>("all");
  const visibleFlyers = useMemo(
    () => seededFlyers.filter((flyer) => activeRegion === "all" || flyer.region === activeRegion),
    [activeRegion],
  );
  const activeLabel = boardRegions.find((region) => region.id === activeRegion)?.label ?? "All San Diego";

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {boardRegions.map((region) => (
          <button
            key={region.id}
            type="button"
            onClick={() => setActiveRegion(region.id)}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black transition ${
              activeRegion === region.id
                ? "border-fuchsia-300 bg-fuchsia-400 text-slate-950"
                : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            {region.label}
          </button>
        ))}
      </div>

      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#3d2412,#8b5529_20%,#5c361a_48%,#9f6733_78%,#3e2413)] p-3 shadow-[0_28px_80px_rgba(0,0,0,.65)] sm:p-5 lg:p-6">
        <div
          ref={boardRef}
          className="relative min-h-[880px] overflow-hidden rounded-[1.1rem] border border-amber-950/60 bg-[#a96535] shadow-[inset_0_0_55px_rgba(69,34,10,.4)] sm:min-h-[930px] lg:min-h-[980px]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 18%, rgba(65,31,9,.28) 0 1px, transparent 1.7px), radial-gradient(circle at 61% 33%, rgba(255,238,205,.17) 0 1px, transparent 1.7px), radial-gradient(circle at 77% 81%, rgba(85,47,19,.22) 0 1px, transparent 1.5px), linear-gradient(105deg, rgba(255,255,255,.025), transparent 38%, rgba(77,39,12,.08))",
            backgroundSize: "13px 17px, 19px 23px, 29px 31px, 100% 100%",
          }}
          aria-label={`${activeLabel} SingBoard`}
        >
          <div className="absolute left-1/2 top-4 z-40 flex -translate-x-1/2 items-end sm:top-5">
            <div className="relative h-[68px] w-[150px] overflow-hidden sm:h-[96px] sm:w-[230px] lg:h-[112px] lg:w-[275px]">
              {/* Reuse the exact Sing portion of the approved SingHUB wordmark. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/header-singhub-logo.png"
                alt="Sing"
                className="absolute left-0 top-0 h-full w-auto max-w-none object-contain object-left"
                style={{ width: "auto" }}
              />
            </div>
            <span
              className="-ml-4 mb-2 text-[2.35rem] font-black leading-none tracking-[-0.08em] text-white sm:-ml-7 sm:mb-3 sm:text-[4rem] lg:text-[4.8rem]"
              style={{
                WebkitTextStroke: "2px #47c7ff",
                textShadow: "0 0 5px #47c7ff, 0 0 12px #1d4ed8, 0 0 24px #1d4ed8",
              }}
            >
              BOARD
            </span>
          </div>

          <div className="absolute right-[4%] top-[14%] z-20 rotate-[3deg] bg-[#ffe89a] px-4 py-4 text-center text-slate-950 shadow-[0_10px_18px_rgba(63,31,10,.35)] sm:right-[6%] sm:w-[190px]">
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

          {visibleFlyers.length === 0 ? (
            <div className="absolute inset-x-0 top-[48%] flex justify-center p-8">
              <div className="rotate-[-1deg] bg-white/90 p-5 text-center text-slate-950 shadow-lg">
                <p className="text-xl font-black">Fresh cork.</p>
                <p className="mt-1 text-sm font-bold">Nothing pinned here yet.</p>
              </div>
            </div>
          ) : (
            visibleFlyers.map((flyer) => (
              <article
                key={flyer.id}
                className="absolute w-[26%] max-w-[250px] select-none shadow-[0_16px_22px_rgba(40,20,5,0.34)] sm:w-[22%] lg:w-[18%]"
                style={{ left: `${flyer.x}%`, top: `${flyer.y}%`, transform: `rotate(${flyer.rotation}deg)`, zIndex: 10 }}
              >
                <span className="absolute left-1/2 top-2 z-20 h-5 w-5 -translate-x-1/2 rounded-full border border-slate-950/50 bg-violet-600 shadow-[0_3px_5px_rgba(0,0,0,.5)]" aria-hidden="true" />
                <div className={`min-h-48 bg-gradient-to-br p-4 pt-9 ${toneClasses[flyer.tone]} sm:min-h-56`}>
                  <span className="block text-[0.62rem] font-black uppercase tracking-[0.2em] opacity-65">{flyer.neighborhood}</span>
                  <span className="mt-2 block text-lg font-black leading-tight sm:text-xl">{flyer.title}</span>
                  <span className="mt-5 block text-sm font-black sm:text-base">{flyer.venue}</span>
                  <span className="mt-1 block text-[0.7rem] font-bold opacity-75 sm:text-xs">{flyer.detail}</span>
                </div>
              </article>
            ))
          )}

          <div className="absolute bottom-[8%] left-1/2 z-30 w-[78%] max-w-[720px] -translate-x-1/2 rotate-[-0.4deg] bg-[#f4eee3] p-4 text-slate-950 shadow-[0_14px_20px_rgba(60,31,10,.35)] sm:p-5">
            <span className="absolute left-4 top-[-9px] h-5 w-5 rounded-full bg-sky-500 shadow-md" />
            <span className="absolute right-4 top-[-9px] h-5 w-5 rounded-full bg-sky-500 shadow-md" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-black uppercase sm:text-2xl">Want to pin your flyer here?</p>
                <p className="mt-1 text-xs font-bold text-slate-600 sm:text-sm">Posting is invite-only for verified venues and KJs.</p>
              </div>
              <a
                href="mailto:hello@singhub.app?subject=SingBoard%20posting%20access&body=Hi%20SingHUB%2C%0A%0AI%27d%20like%20posting%20access%20to%20SingBoard.%0A%0AName%3A%0AVenue%20or%20KJ%3A%0A"
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border-2 border-fuchsia-500 px-4 py-2 text-sm font-black text-fuchsia-700 transition hover:bg-fuchsia-100"
              >
                ✉ Email us
              </a>
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
