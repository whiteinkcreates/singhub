"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { EventSchedule } from "@/components/venue/EventSchedule";
import { VenueTag } from "@/components/venue/VenueTag";
import type { KaraokeEventListing } from "@/types";
import type { VenueEnhancement, VenueSpecial } from "@/lib/venueEnhancements";

type TabKey = "specials" | "about" | "photos" | "events";

function groupSpecials(specials: VenueSpecial[]) {
  const groups = new Map<string, VenueSpecial[]>();
  for (const special of specials) groups.set(special.day, [...(groups.get(special.day) || []), special]);
  return Array.from(groups.entries());
}

export function VenueProfileTabs({ venueName, enhancement, events }: { venueName: string; enhancement: VenueEnhancement; events: KaraokeEventListing[] }) {
  const specialGroups = useMemo(() => groupSpecials(enhancement.weeklySpecials), [enhancement.weeklySpecials]);
  const tabs = useMemo(() => {
    const values: Array<{ key: TabKey; label: string }> = [];
    if (specialGroups.length || enhancement.dailyDeals.length) values.push({ key: "specials", label: "Specials" });
    values.push({ key: "about", label: "About" });
    if (enhancement.gallery.length) values.push({ key: "photos", label: "Photos" });
    if (events.length) values.push({ key: "events", label: "Events" });
    return values;
  }, [enhancement.dailyDeals.length, enhancement.gallery.length, events.length, specialGroups.length]);
  const [active, setActive] = useState<TabKey>(tabs[0]?.key || "about");

  return (
    <section className="mt-6">
      <div className="flex gap-1 overflow-x-auto border-b border-white/10">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" onClick={() => setActive(tab.key)} className={`min-w-max border-b-2 px-4 py-3 text-sm font-black transition ${active === tab.key ? "border-[#ff2aa3] text-fuchsia-200" : "border-transparent text-slate-500 hover:text-white"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {active === "specials" && (
        <div className="mt-5">
          {specialGroups.length > 0 && (
            <div>
              <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">This week</p><h2 className="mt-1 text-2xl font-black text-white">Weekly Specials</h2></div></div>
              <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
                {specialGroups.map(([day, specials]) => (
                  <article key={day} className="min-w-[145px] max-w-[180px] snap-start rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-cyan-200">{day.slice(0, 3)}</p>
                    <div className="mt-3 space-y-3">
                      {specials.map((special) => (
                        <div key={`${day}-${special.title}`}>
                          {special.price ? <p className="text-xl font-black text-white">{special.price}</p> : null}
                          <p className="mt-0.5 text-sm font-black leading-5 text-white">{special.title}</p>
                          {special.detail ? <p className="mt-1 text-xs leading-5 text-slate-400">{special.detail}</p> : null}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {enhancement.dailyDeals.length > 0 && (
            <div className="mt-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Every day</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {enhancement.dailyDeals.map((deal) => (
                  <article key={deal.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="flex items-start justify-between gap-3"><VenueTag label={deal.title} />{deal.price ? <span className="text-lg font-black text-white">{deal.price}</span> : null}</div>
                    {deal.detail ? <p className="mt-3 text-sm leading-6 text-slate-400">{deal.detail}</p> : null}
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {active === "about" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">About {venueName}</p><p className="mt-3 text-base leading-7 text-slate-300">{enhancement.about || enhancement.tagline || "More venue details coming soon."}</p></div>
          {enhancement.amenities.length > 0 ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Good to Know</p><div className="mt-4 flex flex-wrap gap-2">{enhancement.amenities.map((item) => <VenueTag key={item} label={item} />)}</div></div> : null}
        </div>
      )}

      {active === "photos" && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {enhancement.gallery.map((photo) => <figure key={photo.url} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"><img src={photo.url} alt={photo.alt} className="aspect-[4/3] w-full object-cover" loading="lazy" />{photo.caption ? <figcaption className="p-3 text-xs text-slate-400">{photo.caption}</figcaption> : null}</figure>)}
        </div>
      )}

      {active === "events" && <EventSchedule events={events} />}
    </section>
  );
}
