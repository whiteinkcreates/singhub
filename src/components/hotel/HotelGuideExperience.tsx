"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type HotelGuideVenue = {
  slug: string;
  name: string;
  neighborhood: string;
  address: string;
  imageUrl?: string;
  distanceMiles: number;
  distanceLabel: string;
  tier: "walkable" | "quick" | "standout";
  vibeTags: string[];
  venueType: "live_bar" | "private_room";
  tonightSchedule?: string;
  weekSchedule: string[];
  standoutReason?: string;
};

type Props = {
  hotelName: string;
  hotelShortName: string;
  heroImageUrl?: string;
  tonightVenues: HotelGuideVenue[];
  weekVenues: HotelGuideVenue[];
};

const tierMeta = {
  walkable: {
    label: "Walkable",
    helper: "Close enough to reasonably walk from your hotel",
    icon: "↟",
  },
  quick: {
    label: "Quick Trip",
    helper: "Nearby karaoke that is better reached by a short ride",
    icon: "↗",
  },
  standout: {
    label: "Standout Spots",
    helper: "Special-format karaoke, not simply venues that are farther away",
    icon: "★",
  },
} as const;

function splitByTier(venues: HotelGuideVenue[]) {
  return {
    walkable: venues.filter((venue) => venue.tier === "walkable"),
    quick: venues.filter((venue) => venue.tier === "quick"),
    standout: venues.filter((venue) => venue.tier === "standout"),
  };
}

function VenueCard({
  venue,
  mode,
}: {
  venue: HotelGuideVenue;
  mode: "tonight" | "week";
}) {
  const schedule =
    mode === "tonight"
      ? venue.tonightSchedule
      : venue.weekSchedule.slice(0, 3).join("  •  ");

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0a131f] shadow-[0_18px_50px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-amber-300/30">
      {venue.imageUrl ? (
        <div className="relative h-36 overflow-hidden bg-[#0d1724]">
          <img
            src={venue.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a131f]/90 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {venue.venueType === "private_room" ? (
              <span className="rounded-full border border-cyan-200/30 bg-[#07151d]/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 backdrop-blur">
                Private rooms
              </span>
            ) : null}
            {venue.standoutReason ? (
              <span className="rounded-full border border-amber-200/30 bg-[#1a1407]/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-100 backdrop-blur">
                {venue.standoutReason}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="p-4">
        {!venue.imageUrl ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {venue.venueType === "private_room" ? (
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100">
                Private rooms
              </span>
            ) : null}
            {venue.standoutReason ? (
              <span className="rounded-full border border-amber-200/20 bg-amber-200/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-100">
                {venue.standoutReason}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/venues/${venue.slug}`} className="group/title">
              <h3 className="text-lg font-black leading-tight text-white transition group-hover/title:text-fuchsia-100">
                {venue.name}
              </h3>
            </Link>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-amber-200">
              {venue.distanceLabel}
            </p>
          </div>
          <span className="text-lg text-slate-600" aria-hidden>
            ›
          </span>
        </div>

        {venue.venueType === "private_room" ? (
          <p className="mt-3 text-sm leading-5 text-slate-300">
            Private-room karaoke. This is a book-a-room experience, not a hosted bar rotation.
          </p>
        ) : schedule ? (
          <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-300">{schedule}</p>
        ) : null}

        {venue.vibeTags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {venue.vibeTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-fuchsia-300/15 bg-fuchsia-300/[0.05] px-2.5 py-1 text-[10px] font-bold text-fuchsia-100/90"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <Link
          href={`/venues/${venue.slug}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-amber-300/35 bg-amber-300/[0.08] px-4 py-2 text-sm font-black text-amber-100 transition hover:bg-amber-300 hover:text-slate-950"
        >
          View venue
        </Link>
      </div>
    </article>
  );
}

function TierSection({
  tier,
  venues,
  mode,
}: {
  tier: keyof typeof tierMeta;
  venues: HotelGuideVenue[];
  mode: "tonight" | "week";
}) {
  if (venues.length === 0) return null;

  const meta = tierMeta[tier];

  return (
    <section className="py-7">
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-white/10 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-white">
            <span className="text-amber-300" aria-hidden>
              {meta.icon}
            </span>
            {meta.label}
          </h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            {meta.helper}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {venues.slice(0, tier === "walkable" ? 6 : 3).map((venue) => (
          <VenueCard key={venue.slug} venue={venue} mode={mode} />
        ))}
      </div>
    </section>
  );
}

export function HotelGuideExperience({
  hotelName,
  hotelShortName,
  heroImageUrl,
  tonightVenues,
  weekVenues,
}: Props) {
  const [mode, setMode] = useState<"tonight" | "week">("tonight");
  const [heroVisible, setHeroVisible] = useState(Boolean(heroImageUrl));
  const activeVenues = mode === "tonight" ? tonightVenues : weekVenues;
  const grouped = useMemo(() => splitByTier(activeVenues), [activeVenues]);

  return (
    <main className="min-h-screen bg-[#050d17] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        {heroImageUrl && heroVisible ? (
          <img
            src={heroImageUrl}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-55"
            onError={() => setHeroVisible(false)}
          />
        ) : null}
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(236,72,153,.14),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,.12),transparent_30%),#07111e]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#020713]/15 via-[#06101e]/65 to-[#050d17]" />

        <div className="mx-auto max-w-5xl px-5 pb-7 pt-6 text-center sm:pb-8 sm:pt-8">
          <img
            src="/images/header-singhub-logo.png"
            alt="SingHUB"
            className="mx-auto h-auto w-[190px] max-w-[56vw] object-contain sm:w-[230px]"
          />

          <div className="mx-auto mt-3 flex max-w-xl items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300/60" />
            <span className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-200">
              {hotelName}
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300/60" />
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            {mode === "tonight" ? "Karaoke tonight" : "Karaoke this week"} near {hotelShortName}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Real SingHUB listings organized by what is easiest to reach from your stay.
          </p>

          <div className="mx-auto mt-5 grid max-w-md grid-cols-2 rounded-full border border-white/15 bg-black/35 p-1 shadow-lg shadow-black/20 backdrop-blur">
            <button
              onClick={() => setMode("tonight")}
              className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                mode === "tonight"
                  ? "bg-amber-300 text-slate-950 shadow-md shadow-amber-950/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Tonight
            </button>
            <button
              onClick={() => setMode("week")}
              className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                mode === "week"
                  ? "bg-amber-300 text-slate-950 shadow-md shadow-amber-950/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 pb-16">
        {activeVenues.length === 0 ? (
          <div className="mx-auto max-w-xl py-16 text-center">
            <p className="text-xl font-black text-white">
              No verified karaoke is listed {mode === "tonight" ? "tonight" : "this week"} close enough to recommend from this hotel.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              We would rather show nothing than invent a nearby option or send a guest somewhere stale.
            </p>
            {mode === "tonight" && weekVenues.length > 0 ? (
              <button
                onClick={() => setMode("week")}
                className="mt-6 rounded-full bg-amber-300 px-5 py-2.5 text-sm font-black text-slate-950"
              >
                See what is on this week
              </button>
            ) : (
              <Link
                href="/find-karaoke"
                className="mt-6 inline-flex rounded-full border border-fuchsia-400/40 bg-fuchsia-400/10 px-5 py-2.5 text-sm font-black text-fuchsia-100"
              >
                Browse all San Diego karaoke
              </Link>
            )}
          </div>
        ) : (
          <>
            <TierSection tier="walkable" venues={grouped.walkable} mode={mode} />
            <TierSection tier="quick" venues={grouped.quick} mode={mode} />
            <TierSection tier="standout" venues={grouped.standout} mode={mode} />
          </>
        )}

        <div className="mt-4 border-t border-white/10 pt-6 text-center">
          <p className="text-xs leading-5 text-slate-500">
            Curated by SingHUB from current karaoke listings. Schedules can change, especially on holidays and private-event nights.
          </p>
          <Link href="/find-karaoke" className="mt-3 inline-block text-sm font-bold text-cyan-200 hover:text-cyan-100">
            See all San Diego karaoke →
          </Link>
        </div>
      </div>
    </main>
  );
}
