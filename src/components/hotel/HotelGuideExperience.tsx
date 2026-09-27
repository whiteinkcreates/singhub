"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HOTEL_AT_MARK_SRC } from "@/lib/hotelAtMark";
import { SITE_WORDMARK_SRC } from "@/lib/siteWordmark";
import { HotelGuideMap } from "@/components/hotel/HotelGuideMap";

export type HotelGuideVenue = {
  slug: string;
  name: string;
  neighborhood: string;
  address: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
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
  hotelAddress: string;
  hotelLatitude: number;
  hotelLongitude: number;
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
    <article className="group relative snap-start overflow-hidden rounded-[22px] border border-white/[0.09] bg-gradient-to-b from-[#0d1826] to-[#08111d] shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_22px_60px_rgba(0,0,0,0.36)]">
      <div className="absolute inset-x-10 top-0 z-20 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent opacity-60" />

      {venue.imageUrl && imageVisible ? (
        <div className="relative h-44 overflow-hidden bg-[#0d1724]">
          <img
            src={venue.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            loading="lazy"
            onError={() => setImageVisible(false)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09131f] via-[#09131f]/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cyan-950/20 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {venue.venueType === "private_room" ? (
              <span className="rounded-full border border-cyan-200/30 bg-[#06111c]/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-cyan-100 backdrop-blur-md">
                Private rooms
              </span>
            ) : null}
            {venue.standoutReason ? (
              <span className="rounded-full border border-violet-300/30 bg-[#100d25]/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-violet-100 backdrop-blur-md">
                Standout
              </span>
            ) : null}
          </div>

          <div className="absolute bottom-3 left-3 rounded-full border border-cyan-200/20 bg-black/55 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 backdrop-blur-md">
            {venue.distanceLabel}
          </div>
        </div>
      ) : (
        <div className="relative h-24 overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.12),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(236,72,153,.08),transparent_28%),#0b1623]">
          <div className="absolute inset-y-0 right-0 w-32 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,.025),transparent)]" />
          <div className="absolute bottom-3 left-4 text-[10px] font-black uppercase tracking-[0.15em] text-cyan-200">
            {venue.distanceLabel}
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href={`/venues/${venue.slug}`} className="group/title">
              <h3 className="text-lg font-black leading-tight text-white transition group-hover/title:text-cyan-100 sm:text-xl">
                {venue.name}
              </h3>
            </Link>
            <p className="mt-1 text-xs font-bold text-slate-500">{venue.neighborhood}</p>
          </div>
          <span className="mt-0.5 text-xl text-cyan-300/50 transition group-hover:text-cyan-200" aria-hidden>
            →
          </span>
        </div>

        {venue.standoutReason ? (
          <div className="mt-4 border-l-2 border-violet-300/60 pl-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-300">
              Why it stands out
            </p>
            <p className="mt-1 text-sm font-bold text-violet-50">{venue.standoutReason}</p>
          </div>
        ) : null}

        {venue.venueType === "private_room" ? (
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Private-room karaoke. Check room availability before heading over.
          </p>
        ) : schedule ? (
          <div className="mt-4 flex items-start gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,.8)]" />
            <p className="line-clamp-2 text-sm font-medium leading-6 text-slate-300">{schedule}</p>
          </div>
        ) : null}

        {venue.vibeTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {venue.vibeTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-fuchsia-300/15 bg-fuchsia-300/[0.045] px-2.5 py-1 text-[10px] font-bold text-fuchsia-100/85"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <Link
          href={`/venues/${venue.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-black text-cyan-200 transition hover:text-cyan-100"
        >
          View venue
          <span aria-hidden>→</span>
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
  const visibleVenues = venues.slice(0, tier === "walkable" ? 6 : 3);

  return (
    <section className="py-8 sm:py-10">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.055] shadow-[inset_0_0_18px_rgba(34,211,238,.035)]">
            <TierIcon tier={tier} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-white">{meta.label}</h2>
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                {visibleVenues.length} {visibleVenues.length === 1 ? "spot" : "spots"}
              </span>
            </div>
            <p className="mt-1 max-w-lg text-sm leading-5 text-slate-500">{meta.helper}</p>
          </div>
        </div>
      </div>

      <div className="-mx-5 grid snap-x snap-mandatory grid-flow-col auto-cols-[84%] gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {visibleVenues.map((venue) => (
          <VenueCard key={venue.slug} venue={venue} mode={mode} />
        ))}
      </div>
    </section>
  );
}

export function HotelGuideExperience({
  hotelName,
  hotelShortName,
  hotelAddress,
  hotelLatitude,
  hotelLongitude,
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
    <main className="min-h-screen overflow-hidden bg-[#050d17] text-white">
      <section className="relative isolate overflow-hidden border-b border-cyan-200/[0.08]">
        {heroImageUrl && heroVisible ? (
          <img
            src={heroImageUrl}
            alt=""
            className="absolute inset-0 -z-30 h-full w-full object-cover opacity-50"
            onError={() => setHeroVisible(false)}
          />
        ) : null}

        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_16%_10%,rgba(236,72,153,.16),transparent_28%),radial-gradient(circle_at_84%_5%,rgba(34,211,238,.18),transparent_30%),#07111e]" />
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#020713]/25 via-[#06101e]/72 to-[#050d17]" />
        <div className="absolute -left-16 top-28 -z-10 h-56 w-56 rounded-full bg-fuchsia-500/[0.055] blur-3xl" />
        <div className="absolute -right-20 top-16 -z-10 h-64 w-64 rounded-full bg-cyan-400/[0.065] blur-3xl" />

        <div className="mx-auto max-w-5xl px-5 pb-9 pt-6 text-center sm:pb-12 sm:pt-8">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <img
              src={SITE_WORDMARK_SRC}
              alt="SingHUB"
              className="h-auto w-[220px] drop-shadow-[0_0_18px_rgba(34,211,238,0.16)] sm:w-[280px]"
            />
            <div className="relative -mt-1">
              <div className="pointer-events-none absolute -left-5 -top-3 h-16 w-16 rounded-full bg-fuchsia-500/25 blur-2xl" />
              <div className="pointer-events-none absolute bottom-[-18px] left-1/2 h-12 w-24 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-2xl" />
              <img
                src={HOTEL_AT_MARK_SRC}
                alt=""
                aria-hidden
                className="relative h-auto w-[100px] drop-shadow-[0_0_14px_rgba(34,211,238,.45)] sm:w-[116px]"
              />
            </div>

            {hotelWordmarkImageUrl && hotelWordmarkVisible ? (
              <div className="-mt-3 flex min-h-[66px] w-full items-center justify-center px-5">
                <img
                  src={hotelWordmarkImageUrl}
                  alt={hotelName}
                  className="max-h-[62px] max-w-[285px] object-contain sm:max-h-[70px] sm:max-w-[360px]"
                  style={{
                    filter: `${hotelWordmarkInvert ? "invert(1) grayscale(1) brightness(1.6) " : ""}drop-shadow(0 -5px 10px rgba(34,211,238,.68)) drop-shadow(0 0 18px rgba(34,211,238,.22))`,
                    mixBlendMode: hotelWordmarkInvert ? "screen" : "normal",
                  }}
                  onError={() => setHotelWordmarkVisible(false)}
                />
              </div>
            ) : (
              <div className="-mt-1 flex w-full max-w-xl items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-300/50" />
                <span className="text-sm font-black uppercase tracking-[0.14em] text-white drop-shadow-[0_-4px_8px_rgba(34,211,238,.55)] sm:text-base">
                  {hotelName}
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-300/50" />
              </div>
            )}

            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/75">
              Hotel Guest Guide
            </p>
          </div>

          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-black tracking-[-0.035em] text-white sm:text-5xl">
            {mode === "tonight" ? "Karaoke tonight" : "Karaoke this week"} near {hotelShortName}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Current SingHUB listings, sorted by what is easiest to reach from your stay.
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-[22px] border border-cyan-200/15 bg-[#06111d]/75 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.28)] backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setMode("tonight")}
                className={`rounded-[17px] px-5 py-3 text-sm font-black transition ${mode === "tonight" ? "bg-gradient-to-r from-cyan-300 to-sky-400 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,.22)]" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}
              >
                Tonight
              </button>
              <button
                onClick={() => setMode("week")}
                className={`rounded-[17px] px-5 py-3 text-sm font-black transition ${mode === "week" ? "bg-gradient-to-r from-cyan-300 to-sky-400 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,.22)]" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}
              >
                This Week
              </button>
            </div>
          </div>

          {activeVenues.length > 0 ? (
            <div className="mx-auto mt-5 flex max-w-lg flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.11em] text-slate-500">
              <span><strong className="text-cyan-200">{activeVenues.length}</strong> current options</span>
              {grouped.walkable.length > 0 ? <span><strong className="text-cyan-200">{grouped.walkable.length}</strong> walkable</span> : null}
              {grouped.quick.length > 0 ? <span><strong className="text-cyan-200">{grouped.quick.length}</strong> quick trip</span> : null}
            </div>
          ) : null}
        </div>
      </section>

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.045),transparent_28%)]" />
        <div className="relative mx-auto max-w-5xl px-5 pb-16">
          {activeVenues.length > 0 ? (
            <div className="pt-7 sm:pt-9">
              <HotelGuideMap
                hotelName={hotelName}
                hotelAddress={hotelAddress}
                hotelLatitude={hotelLatitude}
                hotelLongitude={hotelLongitude}
                venues={activeVenues.map((venue) => ({
                  slug: venue.slug,
                  name: venue.name,
                  neighborhood: venue.neighborhood,
                  latitude: venue.latitude,
                  longitude: venue.longitude,
                  distanceLabel: venue.distanceLabel,
                  tier: venue.tier,
                }))}
              />
            </div>
          ) : null}

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

          <div className="mt-6 border-t border-white/[0.07] pt-7 text-center">
            <p className="mx-auto max-w-xl text-xs leading-5 text-slate-500">
              Curated by SingHUB from current karaoke listings. Schedules can change, especially on holidays and private-event nights.
            </p>
            <Link href="/find-karaoke" className="mt-3 inline-flex items-center gap-2 text-sm font-black text-cyan-200 hover:text-cyan-100">
              See all San Diego karaoke <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
