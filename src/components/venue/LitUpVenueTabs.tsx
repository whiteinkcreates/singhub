"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { EventSchedule } from "@/components/venue/EventSchedule";
import type { KaraokeEventListing } from "@/types";
import type { SingersSaySummary } from "@/lib/singersSay.server";
import type { VenueEnhancement, VenueSpecial } from "@/lib/venueEnhancements";

const FACT_GLYPHS: Record<string, string> = {
  "Food available": "🍴",
  "Full bar": "🍸",
  "Beer & wine": "🍺",
  "Outdoor seating": "☀",
  "Good for groups": "◉",
  "21+": "21+",
  "All ages": "AA",
  "Free parking": "P",
  "Street parking": "P",
  "Reservations available": "✓",
  "Private rooms": "▣",
  "Pool tables": "●",
  "Bar games": "◆",
  "Dance floor": "♪",
  "Patio": "☀",
  "Game night": "★",
  "Late night food": "☾",
};

function groupSpecials(specials: VenueSpecial[]) {
  const groups = new Map<string, VenueSpecial[]>();
  for (const special of specials) groups.set(special.day, [...(groups.get(special.day) || []), special]);
  return Array.from(groups.entries());
}

export function LitUpVenueTabs({ venueName, enhancement, events, singersSay, activeDay }: { venueName: string; enhancement: VenueEnhancement; events: KaraokeEventListing[]; singersSay?: SingersSaySummary; activeDay: string }) {
  const [tab, setTab] = useState<"specials" | "about" | "photos" | "events" | "singers">("specials");
  const specialGroups = groupSpecials(enhancement.weeklySpecials);
  const showSingers = Boolean(singersSay && singersSay.totalResponses >= 3 && singersSay.tags.length > 0);
  const tabs = [
    { id: "specials" as const, label: "Specials", show: specialGroups.length > 0 || enhancement.dailyDeals.length > 0 },
    { id: "about" as const, label: "About", show: true },
    { id: "photos" as const, label: "Photos", show: enhancement.gallery.length > 0 },
    { id: "events" as const, label: "Events", show: events.length > 0 },
    { id: "singers" as const, label: "Singers Say", show: showSingers },
  ].filter((item) => item.show);

  return (
    <section className="mt-7">
      <div className="flex gap-1 overflow-x-auto border-b border-white/10">
        {tabs.map((item) => <button key={item.id} type="button" aria-pressed={tab === item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-black transition ${tab === item.id ? "border-[#ff2aa3] text-fuchsia-300" : "border-transparent text-slate-500 hover:text-white"}`}>{item.label}</button>)}
      </div>

      <div className="pt-5">
        {tab === "specials" && (
          <div className="space-y-6">
            {specialGroups.length > 0 && <div><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">Weekly specials</p><h2 className="mt-1 text-2xl font-black text-white">Worth showing up hungry</h2></div></div><div className="mt-4 border-y border-white/10">{specialGroups.map(([day, specials]) => { const isActive = day.toLowerCase() === activeDay.toLowerCase(); return <div key={day} className={`grid gap-3 border-b border-white/10 px-1 py-4 last:border-b-0 sm:grid-cols-[8rem_1fr] sm:px-3 ${isActive ? "bg-fuchsia-300/[0.055]" : ""}`}><div><p className={`text-xs font-black uppercase tracking-[0.16em] ${isActive ? "text-fuchsia-200" : "text-cyan-200"}`}>{day}</p>{isActive ? <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-fuchsia-400">Tonight</p> : null}</div><div className="grid gap-x-8 gap-y-3 md:grid-cols-2">{specials.map((special) => <div key={`${day}-${special.title}`}><p className="font-black text-white">{special.price ? `${special.price} ` : ""}{special.title}</p>{special.detail ? <p className="mt-1 text-xs leading-5 text-slate-400">{special.detail}</p> : null}</div>)}</div></div>; })}</div></div>}
            {enhancement.dailyDeals.length > 0 && <div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Every day</p><h2 className="mt-1 text-xl font-black text-white">Any-day deals</h2><div className="mt-4 grid border-y border-white/10 md:grid-cols-2">{enhancement.dailyDeals.map((deal, index) => <div key={deal.title} className={`grid grid-cols-[auto_1fr] gap-4 border-b border-white/10 px-1 py-4 md:px-3 ${index % 2 === 0 ? "md:border-r" : ""}`}><p className="min-w-12 text-lg font-black text-white">{deal.price || "Deal"}</p><div><p className="font-bold text-fuchsia-100">{deal.title}</p>{deal.detail ? <p className="mt-1 text-sm text-slate-400">{deal.detail}</p> : null}</div></div>)}</div></div>}
          </div>
        )}

        {tab === "about" && (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">About {venueName}</p><p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{enhancement.about || enhancement.tagline}</p></div>
            {enhancement.amenities.length > 0 && <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Good to know</p><div className="mt-4 flex flex-wrap gap-2">{enhancement.amenities.map((fact) => { const glyph = FACT_GLYPHS[fact]; return <span key={fact} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-slate-200">{glyph ? <span className="text-cyan-200" aria-hidden>{glyph}</span> : null}{fact}</span>; })}</div></div>}
          </div>
        )}

        {tab === "photos" && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{enhancement.gallery.map((photo) => <figure key={photo.url} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"><img src={photo.url} alt={photo.alt} className="aspect-[4/3] h-full w-full object-cover" loading="lazy" />{photo.caption && <figcaption className="p-3 text-xs text-slate-400">{photo.caption}</figcaption>}</figure>)}</div>}

        {tab === "events" && <EventSchedule events={events} />}

        {tab === "singers" && singersSay && showSingers && <div className="rounded-2xl border border-fuchsia-300/15 bg-[linear-gradient(135deg,rgba(88,28,135,.12),rgba(8,16,24,.98)_55%,rgba(8,145,178,.08))] p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-300">Singers Say</p><h2 className="mt-1 text-2xl font-black text-white">What karaoke feels like here</h2></div><p className="text-xs text-slate-500">{singersSay.totalResponses} recent responses</p></div><div className="mt-5 flex flex-wrap gap-2">{singersSay.tags.slice(0, 8).map((tag) => <div key={tag.slug} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200"><span className="font-bold text-white">{tag.label}</span><span className="ml-2 text-xs text-cyan-200">{tag.percentage}%</span></div>)}</div></div>}
      </div>
    </section>
  );
}
