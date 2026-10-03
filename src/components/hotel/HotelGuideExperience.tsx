"use client";
import {PositionedImage} from "@/components/media/PositionedImage";
import type {ResponsiveImagePlacement} from "@/lib/imagePlacement";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HOTEL_AT_MARK_SRC } from "@/lib/hotelAtMark";
import { SITE_WORDMARK_SRC } from "@/lib/siteWordmark";

export type HotelGuideVenue = {
  slug: string;
  name: string;
  neighborhood: string;
  address: string;
  imageUrl?: string;
  imagePlacement?: ResponsiveImagePlacement;
  imagePosition?: string;
  distanceMiles: number;
  distanceLabel: string;
  tier: "walkable" | "quick" | "standout";
  vibeTags: string[];
  venueType: "live_bar" | "private_room";
  tonightSchedule?: string;
  weekSchedule: string[];
  standoutReason?: string;
  foodSummary?: string;
  singersSay?: string;
  singersSaySource?: string;
  singersSayUpdatedAt?: string;
  whyHere?: string;
  hostName?: string;
};

type Props = {
  hotelName: string;
  hotelShortName: string;
  heroImageUrl?: string;
  hotelWordmarkImageUrl?: string;
  hotelWordmarkInvert?: boolean;
  tonightVenues: HotelGuideVenue[];
  weekVenues: HotelGuideVenue[];
};

const tierMeta = {
  walkable: {
    label: "Walkable",
    helper: "Close enough to reasonably walk from your hotel",
  },
  quick: {
    label: "Quick Trip",
    helper: "Nearby karaoke that is better reached by a short ride",
  },
  standout: {
    label: "Standout Spots",
    helper: "Special-format karaoke, not simply venues that are farther away",
  },
} as const;

function splitByTier(venues: HotelGuideVenue[]) {
  return {
    walkable: venues.filter((venue) => venue.tier === "walkable"),
    quick: venues.filter((venue) => venue.tier === "quick"),
    standout: venues.filter((venue) => venue.tier === "standout"),
  };
}

function TierIcon({ tier }: { tier: keyof typeof tierMeta }) {
  const common =
    "h-7 w-7 text-cyan-300 drop-shadow-[0_0_9px_rgba(34,211,238,0.5)]";

  if (tier === "walkable") {
    return (
      <svg viewBox="0 0 32 32" className={common} fill="none" aria-hidden>
        <circle cx="17" cy="6.5" r="2.6" fill="currentColor" />
        <path
          d="M15.7 10.2 13 15.1l-3.7 2.6m6.4-7.5 4.2 3.5 4 .8m-8.2.4 3.8 4.6 1.6 6.3m-5.4-10.9-2 6.6-4.4 4.4"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (tier === "quick") {
    return (
      <svg viewBox="0 0 32 32" className={common} fill="none" aria-hidden>
        <path
          d="M7.2 20.5v-4.1l2.4-5.2c.45-.98 1.42-1.62 2.5-1.62h7.8c1.08 0 2.05.64 2.5 1.62l2.4 5.2v4.1"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 16.4h16m-13.9 0 1.6-3.7h8.6l1.6 3.7"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10.4" cy="21.3" r="2.1" fill="currentColor" />
        <circle cx="21.6" cy="21.3" r="2.1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" className={common} fill="none" aria-hidden>
      <path
        d="m16 4.8 3.3 6.7 7.4 1.08-5.35 5.2 1.26 7.35L16 21.65l-6.61 3.48 1.26-7.35-5.35-5.2 7.4-1.08L16 4.8Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VenueCard({
  venue,
  mode,
}: {
  venue: HotelGuideVenue;
  mode: "tonight" | "week";
}) {
  const [imageVisible, setImageVisible] = useState(Boolean(venue.imageUrl));
  const schedule =
    mode === "tonight"
      ? venue.tonightSchedule
      : venue.weekSchedule.slice(0, 3).join("  •  ");

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0a131f] shadow-[0_18px_50px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-fuchsia-300/35">
      {venue.imageUrl && imageVisible ? (
        <div className="relative h-36 overflow-hidden bg-[#0d1724]">
          <PositionedImage placement={venue.imagePlacement} position={venue.imagePosition}
            src={venue.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            onError={() => setImageVisible(false)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a131f]/90 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {venue.venueType === "private_room" ? (
              <span className="rounded-full border border-cyan-200/30 bg-[#07151d]/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 backdrop-blur">
                Private rooms
              </span>
            ) : null}
            {venue.standoutReason ? (
              <span className="rounded-full border border-violet-300/35 bg-violet-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-violet-100 backdrop-blur">
                Standout
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="p-4">
        {!venue.imageUrl || !imageVisible ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {venue.venueType === "private_room" ? (
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100">
                Private rooms
              </span>
            ) : null}
            {venue.standoutReason ? (
              <span className="rounded-full border border-violet-300/25 bg-violet-400/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-violet-100">
                Standout
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
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-cyan-200">
              {venue.distanceLabel}
            </p>
          </div>
          <span className="text-lg text-slate-600" aria-hidden>
            ›
          </span>
        </div>

        {venue.standoutReason ? (
          <div className="mt-3 rounded-xl border border-violet-300/20 bg-violet-400/[0.07] px-3 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-300">
              Why it stands out
            </p>
            <p className="mt-1 text-sm font-bold text-violet-50">{venue.standoutReason}</p>
          </div>
        ) : null}

        {venue.venueType === "private_room" ? (
          <p className="mt-3 text-sm leading-5 text-slate-300">
            Private-room karaoke. Check room availability before heading over.
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
          className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/[0.08] px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
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
          <h2 className="flex items-center gap-3 text-2xl font-black text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06]">
              <TierIcon tier={tier} />
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
  hotelWordmarkImageUrl,
  hotelWordmarkInvert = false,
  tonightVenues,
  weekVenues,
}: Props) {
  const [mode, setMode] = useState<"tonight" | "week">("tonight");
  const [heroVisible, setHeroVisible] = useState(Boolean(heroImageUrl));
  const [hotelWordmarkVisible, setHotelWordmarkVisible] = useState(
    Boolean(hotelWordmarkImageUrl),
  );
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

        <div className="mx-auto max-w-5xl px-5 pb-8 pt-6 text-center sm:pb-10 sm:pt-8">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <img
              src={SITE_WORDMARK_SRC}
              alt="SingHUB"
              className="h-auto w-[225px] drop-shadow-[0_0_18px_rgba(34,211,238,0.16)] sm:w-[285px]"
            />
            <img
              src={HOTEL_AT_MARK_SRC}
              alt=""
              aria-hidden
              className="-mt-1 h-auto w-[96px] sm:w-[112px]"
            />
            {hotelWordmarkImageUrl && hotelWordmarkVisible ? (
              <div className="-mt-3 flex min-h-[68px] w-full items-center justify-center px-5">
                <img
                  src={hotelWordmarkImageUrl}
                  alt={hotelName}
                  className="max-h-[64px] max-w-[290px] object-contain sm:max-h-[72px] sm:max-w-[360px]"
                  style={{
                    filter: `${hotelWordmarkInvert ? "invert(1) brightness(1.75) " : ""}drop-shadow(0 -5px 10px rgba(34,211,238,.65)) drop-shadow(0 0 16px rgba(34,211,238,.2))`,
                  }}
                  onError={() => setHotelWordmarkVisible(false)}
                />
              </div>
            ) : (
              <div className="-mt-1 flex w-full max-w-xl items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-300/55" />
                <span className="text-sm font-black uppercase tracking-[0.14em] text-white drop-shadow-[0_-4px_8px_rgba(34,211,238,.55)] sm:text-base">
                  {hotelName}
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-300/55" />
              </div>
            )}
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200/75">
              Hotel Guest Guide
            </p>
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
                  ? "bg-gradient-to-r from-cyan-300 to-sky-400 text-slate-950 shadow-md shadow-cyan-950/30"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Tonight
            </button>
            <button
              onClick={() => setMode("week")}
              className={`rounded-full px-5 py-2.5 text-sm font-black transition ${
                mode === "week"
                  ? "bg-gradient-to-r from-cyan-300 to-sky-400 text-slate-950 shadow-md shadow-cyan-950/30"
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
                className="mt-6 rounded-full bg-gradient-to-r from-cyan-300 to-sky-400 px-5 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-cyan-950/25"
              >
                See what is on this week
              </button>
            ) : (
              <Link
                href="/find-karaoke"
                className="mt-6 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-2.5 text-sm font-black text-cyan-100"
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
