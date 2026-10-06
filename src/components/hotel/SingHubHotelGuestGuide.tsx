"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PositionedImage } from "@/components/media/PositionedImage";
import { useListReturn } from "@/components/v2/listReturn";
import { HotelPhotoCredit } from "@/components/hotel/HotelPhotoCredit";
import type { HotelPhotoCredit as Credit } from "@/lib/hotelPhotoCredit";
import type { ResponsiveImagePlacement } from "@/lib/imagePlacement";
import { trackEvent } from "@/lib/analytics";
import { SITE_WORDMARK_SRC } from "@/lib/siteWordmark";
import type { HotelGuideVenue } from "@/components/hotel/HotelGuideExperience";
import { selectHotelStandouts } from "@/lib/v2/presentation";

type Props = {
  hotelSlug: string;
  experienceSlug: string;
  hotelName: string;
  hotelShortName: string;
  heroImageUrl?: string;
  heroPlacement?: ResponsiveImagePlacement;
  heroCredit?: Credit;
  heroAlt?: string;
  heroPosition?: string;
  fallbackHeroImageUrl?: string;
  walkableImageUrl?: string;
  walkableImageAlt?: string;
  walkableImagePlacement?: ResponsiveImagePlacement;
  quickRideImageUrl?: string;
  quickRideImageAlt?: string;
  quickRideImagePlacement?: ResponsiveImagePlacement;
  standoutImageUrl?: string;
  standoutImageAlt?: string;
  standoutImagePlacement?: ResponsiveImagePlacement;
  tonightVenues: HotelGuideVenue[];
  weekVenues: HotelGuideVenue[];
};

type Tier = "walkable" | "quick" | "standout";

const TIER_META: Record<Tier, { label: string; helper: string; side: "left" | "right" }> = {
  walkable: { label: "Walkable", helper: "Karaoke spots near the hotel.", side: "right" },
  quick: { label: "Quick Ride", helper: "A short ride to more great karaoke.", side: "left" },
  standout: { label: "Local Standouts", helper: "Top karaoke spots locals love.", side: "right" },
};

function splitByTier(venues: HotelGuideVenue[]) {
  return {
    walkable: venues.filter((venue) => venue.tier === "walkable"),
    quick: venues.filter((venue) => venue.tier === "quick"),
    standout: selectHotelStandouts(venues.filter((venue) => venue.tier === "standout")),
  };
}

function TierIcon({ tier }: { tier: Tier }) {
  const common = "h-5 w-5";
  if (tier === "walkable") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <circle cx="13" cy="4.5" r="2" fill="currentColor" />
        <path d="m11.5 8-2.2 4.1-3 2.2m5.2-6.3 3.4 2.8 3.2.7m-6.8 1.3 3 3.6 1.2 4.9m-4.2-8.5-1.6 5.2-3.6 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (tier === "quick") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
        <path d="M4.5 15.5v-3.1l1.8-3.8a2.3 2.3 0 0 1 2.1-1.4h7.2a2.3 2.3 0 0 1 2.1 1.4l1.8 3.8v3.1M5 12.4h14m-11.7 0 1.2-2.7h7l1.2 2.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7.2" cy="16.2" r="1.6" fill="currentColor" />
        <circle cx="16.8" cy="16.2" r="1.6" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
      <path d="m12 3.5 2.4 4.9 5.4.8-3.9 3.8.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.9-3.8 5.4-.8L12 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function scheduleLabel(venue: HotelGuideVenue, mode: "tonight" | "week") {
  if (mode === "tonight") return venue.tonightSchedule || "Karaoke";
  return venue.weekSchedule[0] || "Karaoke this week";
}

function VenueRow({ venue, mode, experienceSlug }: { venue: HotelGuideVenue; mode: "tonight" | "week"; experienceSlug: string }) {
  const [imageVisible, setImageVisible] = useState(Boolean(venue.imageUrl));
  return (
    <Link
      href={"/venues/" + venue.slug + "?source=" + encodeURIComponent(experienceSlug)}
      onClick={() => trackEvent("hotel_guest_guide_venue_click", { hotel_experience: experienceSlug, venue_slug: venue.slug, tier: venue.tier, mode })}
      className="group flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] p-2.5 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.045]"
    >
      {venue.imageUrl && imageVisible ? (
        <PositionedImage
          placement={venue.imagePlacement}
          position={venue.imagePosition}
          src={venue.imageUrl}
          alt=""
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
          loading="lazy"
          onError={() => setImageVisible(false)}
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-300/[0.07] text-[9px] font-black uppercase tracking-[0.1em] text-cyan-200">Sing</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-white">{venue.name}</span>
        <span className="mt-0.5 block truncate text-[10px] text-slate-400">{venue.distanceLabel} · {scheduleLabel(venue, mode)}</span>
      </span>
      <span className="text-lg text-cyan-300/75 transition group-hover:translate-x-0.5" aria-hidden>›</span>
    </Link>
  );
}

function TierSection({
  tier,
  venues,
  mode,
  experienceSlug,
  imageUrl,
  imageAlt,
  imagePlacement,
}: {
  tier: Tier;
  venues: HotelGuideVenue[];
  mode: "tonight" | "week";
  experienceSlug: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePlacement?: ResponsiveImagePlacement;
}) {
  if (!venues.length) return null;
  const meta = TIER_META[tier];
  const fallbackImage = venues.find((venue) => Boolean(venue.imageUrl));
  const resolvedImage = imageUrl || fallbackImage?.imageUrl;
  const resolvedPlacement = imageUrl ? imagePlacement : fallbackImage?.imagePlacement;
  const resolvedPosition = imageUrl ? undefined : fallbackImage?.imagePosition;
  const imageFirst = meta.side === "left";

  const content = (
    <div className="relative z-10 min-w-0 bg-[#05090d] px-4 py-5 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/45 bg-cyan-300/[0.06] text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.12)]">
              <TierIcon tier={tier} />
            </span>
            <h2 className="font-serif text-[1.65rem] font-bold leading-none text-white">{meta.label}</h2>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">{meta.helper}</p>
        </div>
        <Link
          href={"/find-karaoke?source=" + encodeURIComponent(experienceSlug)}
          onClick={() => trackEvent("hotel_guest_guide_see_all", { hotel_experience: experienceSlug, tier, mode })}
          className="mt-1 shrink-0 text-xs font-black text-cyan-300"
        >
          See all <span aria-hidden>›</span>
        </Link>
      </div>
      <div className="mt-4 grid gap-2">
        {venues.slice(0, 2).map((venue) => <VenueRow key={venue.slug} venue={venue} mode={mode} experienceSlug={experienceSlug} />)}
      </div>
    </div>
  );

  const visual = (
    <div className="relative min-h-[228px] overflow-hidden bg-[#09111a] sm:min-h-[250px]">
      {resolvedImage ? (
        <PositionedImage
          placement={resolvedPlacement}
          position={resolvedPosition}
          src={resolvedImage}
          alt={imageAlt || ""}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,.13),transparent_45%),linear-gradient(135deg,#08131d,#03070b)]" />
      )}
      <div className={"absolute inset-y-0 " + (imageFirst ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r") + " w-2/5 from-[#05090d] to-transparent"} />
      <span
        aria-hidden
        className={"absolute inset-y-0 w-px " + (imageFirst ? "right-0" : "left-0")}
        style={{ background: "linear-gradient(180deg,transparent,#21d4fd 20%,#ff2aa3 72%,transparent)", boxShadow: "0 0 14px rgba(34,211,238,.6),0 0 20px rgba(255,42,163,.24)" }}
      />
    </div>
  );

  return (
    <section className="border-t border-cyan-300/10">
      <div className="grid grid-cols-[minmax(0,62%)_minmax(0,38%)] sm:grid-cols-2">
        {imageFirst ? <>{visual}{content}</> : <>{content}{visual}</>}
      </div>
    </section>
  );
}

export function SingHubHotelGuestGuide({
  hotelSlug,
  experienceSlug,
  hotelName,
  hotelShortName,
  heroImageUrl,
  heroPlacement,
  heroCredit,
  heroAlt,
  heroPosition,
  fallbackHeroImageUrl,
  walkableImageUrl,
  walkableImageAlt,
  walkableImagePlacement,
  quickRideImageUrl,
  quickRideImageAlt,
  quickRideImagePlacement,
  standoutImageUrl,
  standoutImageAlt,
  standoutImagePlacement,
  tonightVenues,
  weekVenues,
}: Props) {
  const [mode, setMode] = useState<"tonight" | "week">("tonight");
  const [heroSource, setHeroSource] = useState(heroImageUrl || fallbackHeroImageUrl || "");
  const [heroVisible, setHeroVisible] = useState(Boolean(heroImageUrl || fallbackHeroImageUrl));

  useListReturn({ mode }, (saved) => {
    if (saved?.mode === "tonight" || saved?.mode === "week") setMode(saved.mode);
  });

  const active = mode === "tonight" ? tonightVenues : weekVenues;
  const grouped = useMemo(() => splitByTier(active), [active]);

  useEffect(() => {
    trackEvent("hotel_guest_guide_view", { hotel_experience: experienceSlug, hotel_slug: hotelSlug, hotel_name: hotelName, version: "2.0" });
  }, [experienceSlug, hotelName, hotelSlug]);

  const setExperienceMode = (next: "tonight" | "week") => {
    setMode(next);
    trackEvent("hotel_guest_guide_toggle", { hotel_experience: experienceSlug, mode: next });
  };

  return (
    <main className="min-h-screen bg-[#020508] text-white" data-hotel-guest-guide="" data-hotel-slug={hotelSlug}>
      <div className="mx-auto min-h-screen w-full max-w-[760px] overflow-hidden bg-[#020508] shadow-[0_24px_90px_rgba(0,0,0,.6)]">
        <section className="relative isolate min-h-[52svh] overflow-hidden bg-[#07111c] sm:min-h-[580px]">
          {heroSource && heroVisible ? (
            <PositionedImage
              placement={heroPlacement}
              position={heroPosition}
              src={heroSource}
              alt={heroAlt || hotelName + " exterior"}
              className="absolute inset-0 -z-20 h-full w-full object-cover"
              onError={() => {
                if (fallbackHeroImageUrl && heroSource !== fallbackHeroImageUrl) setHeroSource(fallbackHeroImageUrl);
                else setHeroVisible(false);
              }}
            />
          ) : null}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,6,14,.12)_0%,rgba(0,6,14,.08)_35%,rgba(2,5,8,.42)_68%,#020508_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_5%,rgba(255,42,163,.15),transparent_32%),radial-gradient(circle_at_90%_12%,rgba(34,211,238,.14),transparent_28%)]" />

          <div className="flex min-h-[52svh] flex-col justify-between px-5 pb-8 pt-5 sm:min-h-[580px] sm:px-7 sm:pb-10 sm:pt-7">
            <div className="flex items-start justify-between gap-4">
              <Link href="/" aria-label="SingHUB home">
                <img src={SITE_WORDMARK_SRC} alt="SingHUB" className="h-auto w-[178px] drop-shadow-[0_0_15px_rgba(34,211,238,.25)] sm:w-[205px]" />
              </Link>
              <details className="relative">
                <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-white/15 bg-black/30 backdrop-blur" aria-label="Open navigation">
                  <span className="grid gap-1.5"><i className="block h-px w-5 bg-white" /><i className="block h-px w-5 bg-white" /><i className="block h-px w-5 bg-white" /></span>
                </summary>
                <nav className="absolute right-0 top-13 z-30 w-44 rounded-2xl border border-white/10 bg-[#07111a]/95 p-2 text-sm shadow-2xl backdrop-blur-xl">
                  <Link href="/" className="block rounded-xl px-3 py-2 hover:bg-white/5">Discover</Link>
                  <Link href="/find-karaoke" className="block rounded-xl px-3 py-2 hover:bg-white/5">Venue Index</Link>
                  <Link href="/account" className="block rounded-xl px-3 py-2 hover:bg-white/5">My SingHUB</Link>
                </nav>
              </details>
            </div>

            <div className="max-w-[88%] pb-2">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/80">For guests of</p>
              <h1 className="mt-2 font-serif text-[2.55rem] font-semibold leading-[0.92] tracking-[-0.035em] text-white drop-shadow-lg sm:text-[3.5rem]">{hotelShortName}</h1>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-100/90">San Diego, California</p>
            </div>
          </div>
          {heroSource === heroImageUrl ? <HotelPhotoCredit credit={heroCredit} /> : null}
        </section>

        <section className="relative border-y border-cyan-300/10 bg-[#020508] px-5 py-7 text-center sm:px-7 sm:py-9">
          <span aria-hidden className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent shadow-[0_0_14px_rgba(34,211,238,.35)]" />
          <h2 className="mx-auto max-w-xl font-serif text-[1.8rem] font-semibold leading-[1.08] tracking-[-0.02em] text-white sm:text-[2.25rem]">
            Now that you’re all checked in,<br />let’s check out <span className="text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,.35)]">a mic.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">Find karaoke, nightlife and local favorites nearby tonight.</p>
          <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 rounded-full border border-white/15 bg-white/[0.035] p-1">
            <button
              type="button"
              aria-pressed={mode === "tonight"}
              onClick={() => setExperienceMode("tonight")}
              className={"rounded-full px-4 py-2.5 text-sm font-black transition " + (mode === "tonight" ? "bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,.35)]" : "text-slate-400")}
            >
              Tonight
            </button>
            <button
              type="button"
              aria-pressed={mode === "week"}
              onClick={() => setExperienceMode("week")}
              className={"rounded-full px-4 py-2.5 text-sm font-black transition " + (mode === "week" ? "bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,.35)]" : "text-slate-400")}
            >
              This Week
            </button>
          </div>
        </section>

        {active.length ? (
          <>
            <TierSection tier="walkable" venues={grouped.walkable} mode={mode} experienceSlug={experienceSlug} imageUrl={walkableImageUrl} imageAlt={walkableImageAlt} imagePlacement={walkableImagePlacement} />
            <TierSection tier="quick" venues={grouped.quick} mode={mode} experienceSlug={experienceSlug} imageUrl={quickRideImageUrl} imageAlt={quickRideImageAlt} imagePlacement={quickRideImagePlacement} />
            <TierSection tier="standout" venues={grouped.standout} mode={mode} experienceSlug={experienceSlug} imageUrl={standoutImageUrl} imageAlt={standoutImageAlt} imagePlacement={standoutImagePlacement} />
          </>
        ) : (
          <section className="px-6 py-12 text-center">
            <h2 className="font-serif text-2xl font-bold">Nothing verified nearby for this view yet.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">We would rather show less than send a guest somewhere with stale karaoke information.</p>
          </section>
        )}

        <footer className="relative overflow-hidden border-t border-cyan-300/15 bg-[#03080d] px-5 py-8 sm:px-7">
          <span aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <span aria-hidden className="pointer-events-none absolute -bottom-20 -right-16 h-40 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <Link
            href={"/find-karaoke?source=" + encodeURIComponent(experienceSlug)}
            onClick={() => trackEvent("hotel_guest_guide_bottom_cta", { hotel_experience: experienceSlug, mode })}
            className="relative z-10 flex w-full items-center justify-center rounded-full border border-cyan-300/65 bg-cyan-300/[0.08] px-5 py-3.5 text-base font-black text-white shadow-[0_0_24px_rgba(34,211,238,.18)] transition hover:bg-cyan-300 hover:text-slate-950"
          >
            See all nearby spots <span className="ml-2" aria-hidden>›</span>
          </Link>
          <div className="relative z-10 mt-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            <span>Powered by</span><img src={SITE_WORDMARK_SRC} alt="SingHUB" className="h-auto w-[88px]" />
          </div>
        </footer>
      </div>
    </main>
  );
}
