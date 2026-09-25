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
};

type Props = {
  hotelName: string;
  hotelShortName: string;
  heroImageUrl?: string;
  wordmarkImageUrl?: string;
  wordmarkInvert?: boolean;
  heroFallback: "downtown" | "coast";
  tonightVenues: HotelGuideVenue[];
  weekVenues: HotelGuideVenue[];
};

const tierMeta = {
  walkable: {
    label: "Walkable",
    helper: "Easy to reach on foot",
    icon: "🚶",
  },
  quick: {
    label: "Quick Trip",
    helper: "A short ride from your hotel",
    icon: "🚕",
  },
  standout: {
    label: "Standout Spots",
    helper: "Distinctive karaoke worth going farther for",
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

function VenueRow({
  venue,
  mode,
}: {
  venue: HotelGuideVenue;
  mode: "tonight" | "week";
}) {
  const schedule =
    mode === "tonight"
      ? venue.tonightSchedule || (venue.venueType === "private_room" ? "Private rooms available" : "")
      : venue.weekSchedule.slice(0, 3).join("  •  ");

  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)_auto] gap-3 border-b border-white/10 py-4 last:border-b-0">
      <div className="h-[72px] overflow-hidden rounded-xl bg-slate-900">
        {venue.imageUrl ? (
          <img
            src={venue.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-fuchsia-300">🎤</div>
        )}
      </div>

      <div className="min-w-0">
        <Link href={`/venues/${venue.slug}`} className="group">
          <h3 className="truncate text-base font-black text-white transition group-hover:text-fuchsia-200">
            {venue.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs font-semibold text-cyan-100">
          {venue.distanceLabel}
        </p>
        {schedule && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300">{schedule}</p>
        )}
        {venue.vibeTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {venue.vibeTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Link
        href={`/venues/${venue.slug}`}
        aria-label={`View ${venue.name}`}
        className="self-center text-xl font-black text-amber-300 transition hover:translate-x-0.5"
      >
        ›
      </Link>
    </div>
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
    <section className="border-t border-white/10 py-5">
      <div className="mb-1 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white">
            <span className="mr-2" aria-hidden>{meta.icon}</span>
            {meta.label}
          </h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {meta.helper}
          </p>
        </div>
      </div>
      <div>
        {venues.slice(0, tier === "walkable" ? 5 : 4).map((venue) => (
          <VenueRow key={venue.slug} venue={venue} mode={mode} />
        ))}
      </div>
    </section>
  );
}

export function HotelGuideExperience({
  hotelName,
  hotelShortName,
  heroImageUrl,
  wordmarkImageUrl,
  wordmarkInvert,
  heroFallback,
  tonightVenues,
  weekVenues,
}: Props) {
  const [mode, setMode] = useState<"tonight" | "week">("tonight");
  const activeVenues = mode === "tonight" ? tonightVenues : weekVenues;
  const grouped = useMemo(() => splitByTier(activeVenues), [activeVenues]);

  const fallbackHero =
    heroFallback === "coast"
      ? "/images/hero/san-diego-skyline-vector.svg"
      : "/images/hero/san-diego-skyline-hero.svg";

  return (
    <main className="min-h-screen bg-[#06101e] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <img
          src={heroImageUrl || fallbackHero}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-65"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#03101d]/20 via-[#06101e]/50 to-[#06101e]/95" />

        <div className="mx-auto max-w-3xl px-5 pb-6 pt-5 text-center sm:pb-7 sm:pt-6">
          <div className="mx-auto flex max-w-md flex-col items-center">
            <img
              src="/images/header-singhub-logo.png"
              alt="SingHUB"
              className="h-auto w-[190px] max-w-[54vw] object-contain sm:w-[220px]"
            />

            <div className="my-1 text-2xl font-black leading-none text-fuchsia-300 drop-shadow-[0_0_12px_rgba(232,121,249,0.8)]">@</div>

            {wordmarkImageUrl ? (
              <img
                src={wordmarkImageUrl}
                alt={hotelName}
                className={`max-h-14 max-w-[180px] object-contain sm:max-h-16 sm:max-w-[220px] ${wordmarkInvert ? "brightness-0 invert" : ""}`}
              />
            ) : (
              <div className="max-w-sm text-base font-bold tracking-[0.12em] text-white/90 sm:text-lg">
                {hotelName}
              </div>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
            Karaoke near your stay
          </h1>
          <p className="mx-auto mt-1.5 max-w-lg text-sm leading-6 text-slate-200">
            See what&apos;s happening tonight or this week near {hotelShortName}.
          </p>

          <div className="mx-auto mt-4 grid max-w-sm grid-cols-2 rounded-full border border-white/15 bg-black/35 p-1 backdrop-blur">
            <button
              onClick={() => setMode("tonight")}
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                mode === "tonight"
                  ? "bg-amber-300 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Tonight
            </button>
            <button
              onClick={() => setMode("week")}
              className={`rounded-full px-4 py-2 text-sm font-black transition ${
                mode === "week"
                  ? "bg-amber-300 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 pb-14">
        {activeVenues.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-lg font-bold text-white">
              No karaoke is confirmed {mode === "tonight" ? "tonight" : "this week"} nearby yet.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              SingHUB is actively verifying San Diego karaoke schedules.
            </p>
            <Link
              href="/find-karaoke"
              className="mt-5 inline-flex rounded-full border border-fuchsia-400/40 bg-fuchsia-400/10 px-5 py-2.5 text-sm font-black text-fuchsia-100"
            >
              Browse all San Diego karaoke
            </Link>
          </div>
        ) : (
          <>
            <TierSection tier="walkable" venues={grouped.walkable} mode={mode} />
            <TierSection tier="quick" venues={grouped.quick} mode={mode} />
            <TierSection tier="standout" venues={grouped.standout} mode={mode} />
          </>
        )}

        <div className="mt-6 border-t border-white/10 pt-6 text-center">
          <p className="text-xs leading-5 text-slate-500">
            Curated by SingHUB using current karaoke listings. Schedules can change, especially on holidays and private-event nights.
          </p>
          <Link href="/find-karaoke" className="mt-3 inline-block text-sm font-bold text-cyan-200 hover:text-cyan-100">
            See all San Diego karaoke →
          </Link>
        </div>
      </div>
    </main>
  );
}
