"use client";

import { useMemo, useState } from "react";
import { VenueCard } from "@/components/venue/VenueCard";
import { VenueProfile } from "@/components/venue/VenueProfile";
import type { KaraokeEventListing, VenueListing } from "@/types";

const DEMO_IMAGE_URL =
  "https://res.cloudinary.com/dy3lyejkk/image/upload/v1781683694/ChatGPT_Image_Jun_17_2026_01_05_26_AM_sjmyq4.png";

const DEMO_ENRICHMENTS: Record<string, Partial<VenueListing>> = {
  "cheers-bar-san-diego": {
    description:
      "A long-running University Heights neighborhood bar open to all, with pool, jukebox, daily drink specials, and karaoke Mondays and Wednesdays with Ed and Katie.",
    specials:
      "Daily drink specials on premiums, wells, and beer. Karaoke nights include drink specials all night.",
    foodHighlights:
      "Free burgers and hot dogs Sundays from 1-5 PM with a drink purchase.",
    drinkHighlights:
      "Daily specials on premium pours, wells, and beer.",
    reservationLink: "https://cheerssandiego.com/events",
  },
  "redwing-bar-grill": {
    description:
      "North Park bar and grill with a laid-back dive-bar feel, a large patio, 15 TVs, recurring karaoke, Thursday trivia followed by karaoke, and a full food menu.",
    specials:
      "Rotating daily food and drink specials, including Industry Monday and weekday happy-hour offers.",
    happyHour:
      "Weekday happy hour with rotating food and drink specials.",
    foodHighlights:
      "Burgers, wings, fried pickles, tots, nachos, dogs, sandwiches, and other bar-grill favorites.",
    drinkHighlights:
      "Domestic drafts, well drinks, craft beer, and rotating happy-hour specials.",
  },
};

function cleanValue(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || /^(tbd|unknown|-|n\/a)$/i.test(trimmed)) return undefined;
  return trimmed;
}

function getVenueEvents(events: KaraokeEventListing[], venueSlug: string) {
  return events.filter((event) => event.venueSlug === venueSlug);
}

function buildEnhancedDemoVenue(venue: VenueListing) {
  const enrichment = DEMO_ENRICHMENTS[venue.slug] || {};
  return {
    ...venue,
    ...enrichment,
    profileTier: "premium" as const,
    isFeatured: true,
    bannerImageUrl: cleanValue(venue.bannerImageUrl) || DEMO_IMAGE_URL,
    bannerImageAlt:
      cleanValue(venue.bannerImageAlt) || `${venue.venueName} enhanced SingHUB demo`,
  };
}

function DemoStateHeader({
  eyebrow,
  title,
  copy,
  enhanced = false,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  enhanced?: boolean;
}) {
  return (
    <div
      className={`mb-4 rounded-2xl border p-5 ${
        enhanced
          ? "border-fuchsia-300/35 bg-fuchsia-300/[0.08]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <p
        className={`text-xs font-black uppercase tracking-[0.2em] ${
          enhanced ? "text-fuchsia-200" : "text-slate-400"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">{title}</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300 md:text-base">
        {copy}
      </p>
    </div>
  );
}

export function VenuePartnerDemo({
  venues,
  events,
  initialSlug,
}: {
  venues: VenueListing[];
  events: KaraokeEventListing[];
  initialSlug?: string;
}) {
  const fallbackSlug =
    venues.find((venue) => venue.slug === "cheers-bar-san-diego")?.slug ||
    venues[0]?.slug ||
    "";
  const [selectedSlug, setSelectedSlug] = useState(
    venues.some((venue) => venue.slug === initialSlug)
      ? initialSlug || fallbackSlug
      : fallbackSlug,
  );

  const selectedVenue = useMemo(
    () => venues.find((venue) => venue.slug === selectedSlug) || venues[0],
    [selectedSlug, venues],
  );

  const venueEvents = useMemo(
    () => (selectedVenue ? getVenueEvents(events, selectedVenue.slug) : []),
    [events, selectedVenue],
  );

  const enhancedVenue = useMemo(
    () => (selectedVenue ? buildEnhancedDemoVenue(selectedVenue) : undefined),
    [selectedVenue],
  );

  if (!selectedVenue || !enhancedVenue) return null;

  const usesDemoImage = !cleanValue(selectedVenue.bannerImageUrl);
  const hasVenueSpecificEnrichment = Boolean(DEMO_ENRICHMENTS[selectedVenue.slug]);

  function handleVenueChange(slug: string) {
    setSelectedSlug(slug);
    const url = new URL(window.location.href);
    url.searchParams.set("venue", slug);
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <div className="space-y-12">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/30 md:p-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              Demo this venue
            </span>
            <select
              value={selectedVenue.slug}
              onChange={(event) => handleVenueChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-base font-bold text-white outline-none focus:border-cyan-300"
            >
              {venues.map((venue) => (
                <option key={venue.id} value={venue.slug}>
                  {venue.venueName} - {venue.neighborhood}
                </option>
              ))}
            </select>
          </label>

          <a
            href={`/venues/${selectedVenue.slug}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-black text-white transition hover:border-cyan-300/60 hover:text-cyan-100"
          >
            Open current live listing
          </a>
        </div>
      </section>

      <section>
        <DemoStateHeader
          eyebrow="Live today"
          title="Current SingHUB listing"
          copy="This is the same standard venue profile singers can see now. Core karaoke information stays free and useful."
        />
        <VenueProfile
          venue={{ ...selectedVenue, profileTier: "basic", isFeatured: false }}
          events={venueEvents}
        />
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/30 bg-gradient-to-r from-fuchsia-300/[0.08] via-slate-950 to-cyan-300/[0.08] p-6 text-center md:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-violet-400" />
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
          Now add the partnership
        </p>
        <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
          Same venue. More reasons to choose it.
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
          The enhanced experience uses the same karaoke schedule and venue identity, then adds stronger presentation, richer decision-making information, and more ways to move a singer from browsing to showing up.
        </p>
      </section>

      <section>
        <DemoStateHeader
          eyebrow="Founding Venue demo"
          title="Enhanced SingHUB presence"
          copy="This is the real premium profile component already built into SingHUB, rendered as if this venue joined the Founding Venue Pilot."
          enhanced
        />

        {(usesDemoImage || hasVenueSpecificEnrichment) && (
          <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold text-amber-100">
            {usesDemoImage && (
              <span className="rounded-full border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2">
                Demo hero image until venue photography is approved
              </span>
            )}
            {hasVenueSpecificEnrichment && (
              <span className="rounded-full border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2">
                Demo-only venue enrichment shown for discussion
              </span>
            )}
          </div>
        )}

        <VenueProfile venue={enhancedVenue} events={venueEvents} />
      </section>

      <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.05] p-5 md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
          The upgrade also changes discovery
        </p>
        <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
          The profile is only half the story.
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300 md:text-base">
          Founding Venue treatment also changes how the venue can appear while singers browse. These are the actual SingHUB finder-card components, not separate sales artwork.
        </p>

        <div className="mt-8 space-y-8">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Standard finder card
            </p>
            <VenueCard
              venue={{ ...selectedVenue, profileTier: "basic", isFeatured: false }}
              events={venueEvents}
            />
          </div>

          <div className="rounded-[2rem] border border-fuchsia-300/20 bg-fuchsia-300/[0.04] p-4 md:p-6">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-200">
              Enhanced finder card
            </p>
            <VenueCard venue={enhancedVenue} events={venueEvents} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          [
            "Stronger presentation",
            "Premium profile and finder-card treatment built to make the venue feel worth the trip.",
          ],
          [
            "More decision info",
            "Room vibe, specials, food, drinks, parking, access details, and event links when supplied.",
          ],
          [
            "Promotional support",
            "Eligibility for SingHUB roundups, spotlights, and relevant discovery placements during the pilot.",
          ],
          [
            "Priority updates",
            "Direct support when schedules, KJs, specials, or event details change.",
          ],
          [
            "Pilot reporting",
            "Available profile-view, outbound-click, and engagement signals packaged into a useful venue conversation.",
          ],
        ].map(([title, body]) => (
          <article
            key={title}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
          >
            <h3 className="text-base font-black text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-fuchsia-300/35 bg-slate-950 p-6 text-center shadow-2xl shadow-fuchsia-950/25 md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-200">
          Founding Venue Pilot
        </p>
        <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
          Build the version that actually represents {selectedVenue.venueName}.
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300">
          The demo shows the product structure. The partnership is where SingHUB fills it with the venue&apos;s real photography, offers, personality, updates, and promotional priorities.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-black uppercase tracking-[0.14em]">
          <span className="rounded-full border border-white/15 px-4 py-2 text-white">
            90 days
          </span>
          <span className="rounded-full border border-fuchsia-300/35 bg-fuchsia-300/10 px-4 py-2 text-fuchsia-100">
            $149 founding pilot
          </span>
          <span className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-cyan-100">
            Hands-on setup
          </span>
        </div>
      </section>
    </div>
  );
}
