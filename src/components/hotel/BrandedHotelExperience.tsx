"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { SITE_WORDMARK_SRC } from "@/lib/siteWordmark";
import type { HotelGuideVenue } from "@/components/hotel/HotelGuideExperience";

type Props = {
  experienceSlug: string;
  hotelName: string;
  hotelShortName: string;
  hotelSiteUrl: string;
  brandLogoUrl: string;
  heroImageUrl?: string;
  primaryColor: string;
  accentColor: string;
  pageBackground: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  headingFontFamily: string;
  bodyFontFamily: string;
  eyebrow: string;
  headline: string;
  intro: string;
  tonightVenues: HotelGuideVenue[];
  weekVenues: HotelGuideVenue[];
};

const tierMeta = {
  walkable: {
    label: "Walkable",
    helper: "Closest options from your stay",
  },
  quick: {
    label: "Quick Ride",
    helper: "Nearby karaoke worth a short ride",
  },
  standout: {
    label: "Local Standouts",
    helper: "A little farther, still worth the trip",
  },
} as const;

function splitByTier(venues: HotelGuideVenue[]) {
  return {
    walkable: venues.filter((venue) => venue.tier === "walkable"),
    quick: venues.filter((venue) => venue.tier === "quick"),
    standout: venues.filter((venue) => venue.tier === "standout"),
  };
}

function KaraokeMicBackdrop({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 620 1500"
      aria-hidden
      className="pointer-events-none absolute right-[-230px] top-[300px] z-0 h-[1250px] w-[620px] opacity-[0.07] sm:right-[-210px] sm:top-[340px] sm:h-[1380px] sm:w-[680px]"
      style={{ color }}
      fill="none"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <g transform="translate(345 120) rotate(-9 90 230)">
          <rect x="52" y="34" width="138" height="168" rx="68" strokeWidth="14" />
          <path d="M72 82h98M66 112h110M68 142h106" strokeWidth="7" opacity="0.7" />
          <path d="M88 202h66l-12 310H100L88 202Z" strokeWidth="14" />
          <path d="M104 265h34M102 320h38M100 375h40" strokeWidth="6" opacity="0.55" />
          <path d="M121 512v88" strokeWidth="12" />
        </g>

        <path d="M405 555c38 2 64 27 64 64v54" strokeWidth="13" />
        <path d="M469 672v430" strokeWidth="14" />
        <path d="M394 1104h150" strokeWidth="15" />
        <path d="M420 1104c8 45 27 74 49 74s42-29 50-74" strokeWidth="10" opacity="0.75" />

        <path
          d="M465 565c76 66 105 154 90 258-18 126-8 246 33 331 42 88 18 164-79 189-126 32-262 11-393 39-69 15-106 44-124 76"
          strokeWidth="12"
        />
        <path
          d="M588 1154c-88 40-175 59-261 58-111-1-194 27-255 80"
          strokeWidth="7"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}

function TierIcon({
  tier,
  color,
}: {
  tier: keyof typeof tierMeta;
  color: string;
}) {
  if (tier === "walkable") {
    return (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden style={{ color }}>
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
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden style={{ color }}>
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
    <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden style={{ color }}>
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
  experienceSlug,
  primaryColor,
  accentColor,
  surfaceColor,
  textColor,
  mutedTextColor,
}: {
  venue: HotelGuideVenue;
  mode: "tonight" | "week";
  experienceSlug: string;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
}) {
  const [imageVisible, setImageVisible] = useState(Boolean(venue.imageUrl));
  const schedule =
    mode === "tonight"
      ? venue.tonightSchedule
      : venue.weekSchedule.slice(0, 2).join(" • ");

  const href = `/venues/${venue.slug}?source=${encodeURIComponent(experienceSlug)}`;

  return (
    <Link
      href={href}
      onClick={() =>
        trackEvent("hotel_experience_venue_click", {
          hotel_experience: experienceSlug,
          venue_slug: venue.slug,
          tier: venue.tier,
          mode,
        })
      }
      className="group block rounded-2xl border border-slate-200/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ backgroundColor: surfaceColor }}
    >
      <div className="flex gap-3">
        {venue.imageUrl && imageVisible ? (
          <img
            src={venue.imageUrl}
            alt=""
            className="h-[84px] w-[104px] shrink-0 rounded-xl object-cover"
            loading="lazy"
            onError={() => setImageVisible(false)}
          />
        ) : (
          <div
            className="flex h-[84px] w-[104px] shrink-0 items-center justify-center rounded-xl text-xs font-black uppercase tracking-[0.12em]"
            style={{
              backgroundColor: `${primaryColor}0D`,
              color: primaryColor,
            }}
          >
            Karaoke
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-black" style={{ color: textColor }}>
                {venue.name}
              </h3>
              <p
                className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{ color: primaryColor }}
              >
                {venue.distanceLabel}
              </p>
            </div>
            <span className="pt-0.5 text-xl leading-none" style={{ color: primaryColor }} aria-hidden>
              ›
            </span>
          </div>

          {venue.standoutReason ? (
            <p className="mt-1.5 text-xs font-bold" style={{ color: accentColor }}>
              {venue.standoutReason}
            </p>
          ) : schedule ? (
            <p className="mt-1.5 line-clamp-2 text-xs leading-5" style={{ color: mutedTextColor }}>
              {schedule}
            </p>
          ) : null}

          {venue.vibeTags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {venue.vibeTags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em]"
                  style={{
                    backgroundColor: `${primaryColor}0D`,
                    color: primaryColor,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function TierSection({
  tier,
  venues,
  mode,
  experienceSlug,
  primaryColor,
  accentColor,
  surfaceColor,
  textColor,
  mutedTextColor,
}: {
  tier: keyof typeof tierMeta;
  venues: HotelGuideVenue[];
  mode: "tonight" | "week";
  experienceSlug: string;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
}) {
  if (venues.length === 0) return null;
  const meta = tierMeta[tier];

  return (
    <section className="py-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-[0.14em]" style={{ color: textColor }}>
            <TierIcon tier={tier} color={primaryColor} />
            {meta.label}
          </h2>
          <p className="mt-1 text-xs font-medium" style={{ color: mutedTextColor }}>
            {meta.helper}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {venues.slice(0, tier === "walkable" ? 4 : 3).map((venue) => (
          <VenueCard
            key={venue.slug}
            venue={venue}
            mode={mode}
            experienceSlug={experienceSlug}
            primaryColor={primaryColor}
            accentColor={accentColor}
            surfaceColor={surfaceColor}
            textColor={textColor}
            mutedTextColor={mutedTextColor}
          />
        ))}
      </div>
    </section>
  );
}

export function BrandedHotelExperience({
  experienceSlug,
  hotelName,
  hotelShortName,
  hotelSiteUrl,
  brandLogoUrl,
  heroImageUrl,
  primaryColor,
  accentColor,
  pageBackground,
  surfaceColor,
  textColor,
  mutedTextColor,
  headingFontFamily,
  bodyFontFamily,
  eyebrow,
  headline,
  intro,
  tonightVenues,
  weekVenues,
}: Props) {
  const [mode, setMode] = useState<"tonight" | "week">("tonight");
  const [heroVisible, setHeroVisible] = useState(Boolean(heroImageUrl));
  const [logoVisible, setLogoVisible] = useState(Boolean(brandLogoUrl));

  const activeVenues = mode === "tonight" ? tonightVenues : weekVenues;
  const grouped = useMemo(() => splitByTier(activeVenues), [activeVenues]);

  useEffect(() => {
    trackEvent("hotel_experience_view", {
      hotel_experience: experienceSlug,
      hotel_name: hotelName,
    });
  }, [experienceSlug, hotelName]);

  function setExperienceMode(nextMode: "tonight" | "week") {
    setMode(nextMode);
    trackEvent("hotel_experience_toggle", {
      hotel_experience: experienceSlug,
      mode: nextMode,
    });
  }

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: pageBackground,
        color: textColor,
        fontFamily: bodyFontFamily,
      }}
    >
      <div className="relative isolate mx-auto min-h-screen max-w-3xl overflow-hidden bg-white shadow-[0_24px_80px_rgba(15,23,42,.12)]">
        <KaraokeMicBackdrop color={primaryColor} />
        <header className="relative z-10 flex items-center justify-between gap-4 bg-white/95 px-5 py-4 backdrop-blur-[1px] sm:px-8">
          <a
            href={hotelSiteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-14 items-center"
            aria-label={`Visit ${hotelName} website`}
          >
            {logoVisible ? (
              <img
                src={brandLogoUrl}
                alt={hotelName}
                className="max-h-14 max-w-[220px] object-contain"
                onError={() => setLogoVisible(false)}
              />
            ) : (
              <span className="text-lg font-black" style={{ color: primaryColor }}>
                {hotelShortName}
              </span>
            )}
          </a>
          <span
            className="rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em]"
            style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
          >
            Local guest guide
          </span>
        </header>

        {heroImageUrl && heroVisible ? (
          <div className="relative z-10 h-48 overflow-hidden sm:h-60">
            <img
              src={heroImageUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setHeroVisible(false)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div
              className="pointer-events-none absolute -bottom-[58px] left-1/2 h-[86px] w-[132%] -translate-x-1/2 bg-white"
              style={{ borderRadius: "50%" }}
            />
          </div>
        ) : null}

        <section className="relative z-10 bg-white/88 px-5 pb-3 pt-7 backdrop-blur-[1px] sm:px-8 sm:pt-9">
          <p
            className="text-xs font-black uppercase tracking-[0.24em]"
            style={{ color: primaryColor }}
          >
            {eyebrow}
          </p>
          <h1
            className="mt-2 max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-5xl"
            style={{ color: textColor, fontFamily: headingFontFamily }}
          >
            {headline}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7" style={{ color: mutedTextColor }}>
            {intro}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setExperienceMode("tonight")}
              className="rounded-xl px-4 py-3 text-sm font-black transition"
              style={
                mode === "tonight"
                  ? { backgroundColor: primaryColor, color: "#FFFFFF" }
                  : { color: mutedTextColor }
              }
            >
              Tonight
            </button>
            <button
              type="button"
              onClick={() => setExperienceMode("week")}
              className="rounded-xl px-4 py-3 text-sm font-black transition"
              style={
                mode === "week"
                  ? { backgroundColor: primaryColor, color: "#FFFFFF" }
                  : { color: mutedTextColor }
              }
            >
              This Week
            </button>
          </div>
        </section>

        <div className="relative z-10 px-5 sm:px-8">
          {activeVenues.length === 0 ? (
            <div className="my-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-lg font-black" style={{ color: textColor }}>
                No verified karaoke is listed {mode === "tonight" ? "tonight" : "this week"} close enough to recommend right now.
              </p>
              <p className="mt-2 text-sm leading-6" style={{ color: mutedTextColor }}>
                SingHUB only shows current listings we can stand behind.
              </p>
              {mode === "tonight" && weekVenues.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setExperienceMode("week")}
                  className="mt-5 rounded-full px-5 py-2.5 text-sm font-black text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  See this week
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <TierSection
                tier="walkable"
                venues={grouped.walkable}
                mode={mode}
                experienceSlug={experienceSlug}
                primaryColor={primaryColor}
                accentColor={accentColor}
                surfaceColor={surfaceColor}
                textColor={textColor}
                mutedTextColor={mutedTextColor}
              />
              <TierSection
                tier="quick"
                venues={grouped.quick}
                mode={mode}
                experienceSlug={experienceSlug}
                primaryColor={primaryColor}
                accentColor={accentColor}
                surfaceColor={surfaceColor}
                textColor={textColor}
                mutedTextColor={mutedTextColor}
              />
              <TierSection
                tier="standout"
                venues={grouped.standout}
                mode={mode}
                experienceSlug={experienceSlug}
                primaryColor={primaryColor}
                accentColor={accentColor}
                surfaceColor={surfaceColor}
                textColor={textColor}
                mutedTextColor={mutedTextColor}
              />
            </>
          )}
        </div>

        <footer className="relative z-10 mt-5 border-t border-slate-200 bg-white/92 px-5 py-7 backdrop-blur-[1px] sm:px-8">
          <Link
            href={`/find-karaoke?source=${encodeURIComponent(experienceSlug)}`}
            onClick={() =>
              trackEvent("hotel_experience_full_singhub_click", {
                hotel_experience: experienceSlug,
                mode,
              })
            }
            className="flex w-full items-center justify-center rounded-2xl border border-white/20 px-5 py-3.5 text-center text-sm font-black transition hover:brightness-105"
            style={{
              background: "linear-gradient(135deg, #003B70 0%, #0067B9 100%)",
              color: "#FFFFFF",
              boxShadow: "0 12px 28px rgba(0, 59, 112, 0.24)",
            }}
          >
            Explore more local karaoke on SingHUB
          </Link>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="max-w-md text-center text-[11px] leading-5 sm:text-left" style={{ color: mutedTextColor }}>
              Karaoke listings are maintained by SingHUB. Schedules can change, especially on holidays and private-event nights.
            </p>
            <div className="flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: mutedTextColor }}>
              <span>Powered by</span>
              <img src={SITE_WORDMARK_SRC} alt="SingHUB" className="h-auto w-[92px]" />
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
