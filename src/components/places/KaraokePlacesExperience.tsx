"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { KaraokePlacesMap } from "@/components/places/KaraokePlacesMap";
import { VenueSignalBadges } from "@/components/venue/VenueSignals";
import type { VenueListing } from "@/types";
import {
  hasRecentSingHUBVisit,
  hasSingHUBSalute,
  isRadarVenue,
  isVerifiedKaraokeVenue,
} from "@/lib/venueSignals";

type PlaceFilter = "all" | "verified" | "radar" | "visited" | "salute";

const filters: { value: PlaceFilter; label: string; icon: string }[] = [
  { value: "all", label: "All Places", icon: "✦" },
  { value: "verified", label: "Verified", icon: "✅" },
  { value: "radar", label: "On the Radar", icon: "📡" },
  { value: "visited", label: "Been Here", icon: "📍" },
  { value: "salute", label: "Salutes", icon: "🫡" },
];

function matchesFilter(venue: VenueListing, filter: PlaceFilter) {
  if (filter === "verified") return isVerifiedKaraokeVenue(venue);
  if (filter === "radar") return isRadarVenue(venue);
  if (filter === "visited") return hasRecentSingHUBVisit(venue);
  if (filter === "salute") return hasSingHUBSalute(venue);
  return true;
}

function matchesSearch(venue: VenueListing, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [
    venue.venueName,
    venue.city,
    venue.neighborhood,
    venue.address,
    venue.description,
    ...venue.vibeTags,
  ].some((value) => value?.toLowerCase().includes(normalizedQuery));
}

function getPlaceContext(venue: VenueListing) {
  if (isRadarVenue(venue)) {
    return "Saved as a karaoke-related place. This pin does not claim karaoke is happening tonight.";
  }

  if (isVerifiedKaraokeVenue(venue)) {
    return "Current karaoke evidence has been verified. Open the profile for the event schedule and source details.";
  }

  return "A karaoke-related place in the SingHUB Venue Index. Open the profile for what is currently known.";
}

export function KaraokePlacesExperience({ venues }: { venues: VenueListing[] }) {
  const [filter, setFilter] = useState<PlaceFilter>("all");
  const [query, setQuery] = useState("");

  const visibleVenues = useMemo(() => {
    return venues
      .filter((venue) => matchesFilter(venue, filter) && matchesSearch(venue, query))
      .sort((first, second) => {
        const cityComparison = first.city.localeCompare(second.city);
        return cityComparison || first.venueName.localeCompare(second.venueName);
      });
  }, [filter, query, venues]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 md:p-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
              Search the scrapbook
            </p>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              Find karaoke places without confusing them with tonight&apos;s schedule
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Search a venue, city, neighborhood, or address. Then use the layers to explore verified karaoke, scout discoveries, recent visits, and SingHUB Salutes.
            </p>
          </div>

          <label className="block">
            <span className="sr-only">Search karaoke places</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Boston, North Park, Wild Rover…"
              className="w-full rounded-2xl border border-cyan-300/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((item) => {
            const active = filter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                  active
                    ? "border-fuchsia-300/70 bg-fuchsia-300/15 text-fuchsia-100 shadow-[0_0_18px_rgba(217,70,239,.16)]"
                    : "border-white/10 bg-slate-950/70 text-slate-300 hover:border-cyan-300/40 hover:text-white"
                }`}
              >
                <span aria-hidden="true" className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-400">
          Showing {visibleVenues.length} place{visibleVenues.length === 1 ? "" : "s"}.
        </p>
      </section>

      <KaraokePlacesMap venues={visibleVenues} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleVenues.map((venue) => (
          <article
            key={venue.id}
            className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-xl shadow-black/20"
          >
            <VenueSignalBadges venue={venue} />
            <h3 className="mt-5 text-2xl font-black text-white">{venue.venueName}</h3>
            <p className="mt-2 text-sm font-bold text-cyan-200">
              {venue.neighborhood || venue.city} • {venue.city}
            </p>
            <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">
              {getPlaceContext(venue)}
            </p>
            <Link
              href={`/venues/${venue.slug}`}
              className="mt-5 inline-flex items-center font-black text-fuchsia-200 transition hover:text-cyan-200"
            >
              Open venue profile →
            </Link>
          </article>
        ))}
      </section>

      {visibleVenues.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-slate-300">
          No places match that search and layer combination.
        </div>
      )}
    </div>
  );
}
