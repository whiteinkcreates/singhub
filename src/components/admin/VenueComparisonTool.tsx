"use client";

import { useMemo, useState } from "react";
import { VenueProfile } from "@/components/venue/VenueProfile";
import type { KaraokeEventListing, VenueListing } from "@/types";

type VenueComparisonToolProps = {
  venues: VenueListing[];
  events: KaraokeEventListing[];
};

type SalesField = {
  key: string;
  label: string;
  actual?: string;
  prompt: string;
};

const ENHANCED_DEMO_IMAGE_URL =
  "https://res.cloudinary.com/dy3lyejkk/image/upload/v1781683694/ChatGPT_Image_Jun_17_2026_01_05_26_AM_sjmyq4.png";

function cleanValue(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || /^(tbd|unknown|-|n\/a)$/i.test(trimmed)) return undefined;
  return trimmed;
}

function getVenueEvents(events: KaraokeEventListing[], venueSlug: string) {
  return events.filter((event) => event.venueSlug === venueSlug);
}

function getScheduleLines(events: KaraokeEventListing[]) {
  if (events.length === 0) return ["Schedule details are being confirmed."];

  return events.map((event) => {
    const time = [cleanValue(event.startTime), cleanValue(event.endTime)]
      .filter(Boolean)
      .join(" to ");
    const host = cleanValue(event.hostName);

    return [event.karaokeDay, time, host ? `KJ: ${host}` : undefined]
      .filter(Boolean)
      .join(" • ");
  });
}

function getBasicProfileFields(
  venue: VenueListing,
  venueEvents: KaraokeEventListing[],
): SalesField[] {
  const scheduleComplete =
    venueEvents.length > 0 &&
    venueEvents.every(
      (event) => cleanValue(event.karaokeDay) && cleanValue(event.startTime),
    );
  const scheduleValue = scheduleComplete
    ? getScheduleLines(venueEvents).join(" | ")
    : undefined;

  const hosts = Array.from(
    new Set(
      venueEvents
        .map((event) => cleanValue(event.hostName))
        .filter((host): host is string => Boolean(host)),
    ),
  );

  return [
    {
      key: "schedule",
      label: "Karaoke Schedule",
      actual: scheduleValue,
      prompt: "Confirm current karaoke day(s) and start time(s).",
    },
    {
      key: "host",
      label: "KJ / Host",
      actual: hosts.length > 0 ? hosts.join(", ") : undefined,
      prompt: "Confirm the current KJ or rotating host setup.",
    },
    {
      key: "address",
      label: "Address",
      actual: cleanValue(venue.address),
      prompt: "Confirm the venue address.",
    },
    {
      key: "description",
      label: "Venue Description",
      actual: cleanValue(venue.description),
      prompt: "Add a simple accurate description of the karaoke night.",
    },
    {
      key: "vibe",
      label: "Vibe Tags",
      actual: venue.vibeTags.length > 0 ? venue.vibeTags.join(", ") : undefined,
      prompt: "Add a few useful vibe tags for the room and crowd.",
    },
    {
      key: "cover",
      label: "Cover Charge",
      actual: cleanValue(venue.coverCharge),
      prompt: "Confirm whether there is a cover or no cover.",
    },
    {
      key: "age-policy",
      label: "Age Policy",
      actual: cleanValue(venue.agePolicy),
      prompt: "Confirm 21+, all ages, or any time-based age policy.",
    },
    {
      key: "website",
      label: "Website",
      actual: cleanValue(venue.website),
      prompt: "Confirm the official venue website.",
    },
    {
      key: "instagram",
      label: "Instagram",
      actual: cleanValue(venue.instagram),
      prompt: "Confirm the venue Instagram account.",
    },
  ];
}

function getEnhancedFields(venue: VenueListing): SalesField[] {
  return [
    {
      key: "hero",
      label: "Hero Image / Flyer",
      actual: cleanValue(venue.bannerImageUrl),
      prompt: "Add a strong venue image or current karaoke-event creative.",
    },
    {
      key: "specials",
      label: "Weekly Specials",
      actual: cleanValue(venue.specials),
      prompt: "Feature karaoke-night deals and recurring weekly offers.",
    },
    {
      key: "happy-hour",
      label: "Happy Hour",
      actual: cleanValue(venue.happyHour),
      prompt: "Feature happy hour times and offers.",
    },
    {
      key: "food",
      label: "Food Highlights",
      actual: cleanValue(venue.foodHighlights),
      prompt: "Feature late-night bites, kitchen hours, or signature items.",
    },
    {
      key: "drinks",
      label: "Drink Highlights",
      actual: cleanValue(venue.drinkHighlights),
      prompt: "Feature cocktails, local drafts, or karaoke-night drink specials.",
    },
    {
      key: "parking",
      label: "Parking / Arrival",
      actual: cleanValue(venue.parkingInfo),
      prompt: "Add street parking, nearby lots, or rideshare arrival tips.",
    },
    {
      key: "accessibility",
      label: "Accessibility",
      actual: cleanValue(venue.accessibilityNotes),
      prompt: "Add useful entry, seating, and stage-area accessibility details.",
    },
    {
      key: "reservation",
      label: "Reservations / Event Link",
      actual: cleanValue(venue.reservationLink),
      prompt: "Add a direct reservation, ticket, event, or flyer link.",
    },
    {
      key: "booking",
      label: "Booking / Event Contact",
      actual: cleanValue(venue.bookingContact),
      prompt: "Add the best private-event, group, or karaoke booking contact.",
    },
  ];
}

function PreviewLabel({
  eyebrow,
  title,
  copy,
  tone,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  tone: "standard" | "enhanced";
}) {
  return (
    <div
      className={`mb-4 rounded-2xl border p-4 ${
        tone === "enhanced"
          ? "border-fuchsia-300/35 bg-fuchsia-300/[0.08]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <p
        className={`text-xs font-black uppercase tracking-[0.22em] ${
          tone === "enhanced" ? "text-fuchsia-200" : "text-slate-400"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p>
    </div>
  );
}

function EnhancedProfileMockup({
  venue,
  venueEvents,
}: {
  venue: VenueListing;
  venueEvents: KaraokeEventListing[];
}) {
  const scheduleLines = getScheduleLines(venueEvents);
  const fields = getEnhancedFields(venue);
  const imageUrl = cleanValue(venue.bannerImageUrl) || ENHANCED_DEMO_IMAGE_URL;

  return (
    <article className="overflow-hidden rounded-[2rem] border border-fuchsia-300/45 bg-slate-950 shadow-2xl shadow-fuchsia-950/30">
      <div
        className="relative min-h-[25rem] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/50 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/60" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-400" />

        <div className="relative flex min-h-[25rem] flex-col justify-between p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full border border-fuchsia-200/60 bg-slate-950/65 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-100 backdrop-blur">
              Enhanced Profile
            </span>
            <span className="rounded-full border border-amber-200/50 bg-slate-950/70 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.16em] text-amber-100 backdrop-blur">
              Visual example
            </span>
          </div>

          <div>
            <h3 className="text-4xl font-black leading-tight text-white drop-shadow-2xl md:text-6xl">
              {venue.venueName}
            </h3>
            <p className="mt-3 text-sm font-semibold text-cyan-100 md:text-base">
              {venue.neighborhood} • {venue.address}
            </p>

            <div className="mt-5 max-w-2xl rounded-2xl border border-cyan-300/30 bg-slate-950/65 p-4 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                Karaoke schedule
              </p>
              <div className="mt-3 space-y-1 text-sm font-semibold text-white/90">
                {scheduleLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 md:p-7">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">
            Why sing here
          </p>
          <p className="mt-3 text-base leading-7 text-slate-100">
            {cleanValue(venue.description) ||
              `A richer venue story for ${venue.venueName} can explain the room, crowd, karaoke experience, and what makes the night worth choosing.`}
          </p>
        </div>

        {venue.vibeTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {venue.vibeTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/[0.08] px-3 py-1.5 text-xs font-bold text-fuchsia-50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {fields
            .filter((field) => field.key !== "hero")
            .map((field) => (
              <div
                key={field.key}
                className={`rounded-2xl border p-4 ${
                  field.actual
                    ? "border-cyan-300/20 bg-cyan-300/[0.06]"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-200">
                  {field.label}
                </p>
                <p
                  className={`mt-2 text-sm leading-6 ${
                    field.actual ? "text-white" : "text-slate-300 italic"
                  }`}
                >
                  {field.actual || field.prompt}
                </p>
                {!field.actual && (
                  <p className="mt-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-amber-200">
                    Example content area
                  </p>
                )}
              </div>
            ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-full border border-fuchsia-300/35 bg-fuchsia-300/10 px-4 py-3 text-center text-sm font-black text-fuchsia-50">
            Directions
          </div>
          <div className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-center text-sm font-black text-cyan-50">
            Website / Event
          </div>
          <div className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-3 text-center text-sm font-black text-white">
            Instagram
          </div>
        </div>
      </div>
    </article>
  );
}

function FieldStatusGrid({
  fields,
  readyLabel,
  missingLabel,
}: {
  fields: SalesField[];
  readyLabel: string;
  missingLabel: string;
}) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {fields.map((field) => (
        <div
          key={field.key}
          className={`rounded-2xl border p-3 ${
            field.actual
              ? "border-cyan-300/15 bg-cyan-300/[0.04]"
              : "border-amber-300/20 bg-amber-300/[0.05]"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black text-slate-200">{field.label}</p>
            <span
              className={`text-[0.6rem] font-black uppercase tracking-[0.12em] ${
                field.actual ? "text-cyan-200" : "text-amber-200"
              }`}
            >
              {field.actual ? readyLabel : missingLabel}
            </span>
          </div>
          <p className={`mt-2 text-xs leading-5 ${field.actual ? "text-slate-400" : "text-slate-300"}`}>
            {field.actual || field.prompt}
          </p>
        </div>
      ))}
    </div>
  );
}

function SalesExplainer({
  venue,
  venueEvents,
}: {
  venue: VenueListing;
  venueEvents: KaraokeEventListing[];
}) {
  const basicFields = getBasicProfileFields(venue, venueEvents);
  const enhancedFields = getEnhancedFields(venue);
  const missingBasic = basicFields.filter((field) => !field.actual).length;
  const enhancedOpportunities = enhancedFields.filter((field) => !field.actual).length;

  return (
    <section className="mt-8 rounded-[2rem] border border-amber-300/25 bg-amber-300/[0.04] p-5 md:p-7">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">
            Sales call notes • not part of the venue UI
          </p>
          <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
            Venue conversation guide
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.14em]">
          <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-amber-100">
            {missingBasic} basic items to verify
          </span>
          <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-2 text-fuchsia-100">
            {enhancedOpportunities} enhanced opportunities
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-cyan-300/15 bg-slate-950/55 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
            Free listing
          </p>
          <h3 className="mt-2 text-lg font-black text-white">
            Confirm or complete the basic profile
          </h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            These are accuracy and completeness questions for the free SingHUB listing, not paid upgrades.
          </p>
          <FieldStatusGrid
            fields={basicFields}
            readyLabel="Have it"
            missingLabel="Ask"
          />
        </div>

        <div className="rounded-3xl border border-fuchsia-300/15 bg-slate-950/55 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">
            Founding Venue Pilot
          </p>
          <h3 className="mt-2 text-lg font-black text-white">
            Enhanced profile buildout
          </h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            These are the richer profile and promotional elements available through the venue partnership.
          </p>
          <FieldStatusGrid
            fields={enhancedFields}
            readyLabel="Ready"
            missingLabel="Can add"
          />
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/55 p-5">
        <h3 className="text-lg font-black text-white">Partnership value</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            [
              "Stronger presentation",
              "A richer visual profile that gives singers more reasons to choose the venue.",
            ],
            [
              "Special-event promotion",
              "More room to surface flyers, contests, themed nights, and recurring promotions.",
            ],
            [
              "Priority updates",
              "Direct support when karaoke schedules, KJs, specials, or event details change.",
            ],
            [
              "Additional SingHUB promotion",
              "Eligibility for roundups, spotlights, and other promotional support during the pilot.",
            ],
            [
              "Preferred visibility eligibility",
              "Access to Featured and preferred discovery inventory as those placements roll out. No guaranteed top ranking.",
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="text-sm font-black text-white">{title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VenueComparisonTool({ venues, events }: VenueComparisonToolProps) {
  const initialSlug =
    venues.find((venue) => venue.slug === "cordova-bar")?.slug ||
    venues[0]?.slug ||
    "";
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);

  const selectedVenue = useMemo(
    () => venues.find((venue) => venue.slug === selectedSlug),
    [selectedSlug, venues],
  );

  const venueEvents = useMemo(
    () => (selectedVenue ? getVenueEvents(events, selectedVenue.slug) : []),
    [events, selectedVenue],
  );

  if (venues.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-slate-300">
        No venue listings are available for comparison.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              Select venue
            </span>
            <select
              value={selectedSlug}
              onChange={(event) => setSelectedSlug(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-base font-bold text-white outline-none focus:border-cyan-300"
            >
              {venues.map((venue) => (
                <option key={venue.id} value={venue.slug}>
                  {venue.venueName} - {venue.neighborhood}
                </option>
              ))}
            </select>
          </label>

          {selectedVenue && (
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.14em]">
              <span className="rounded-full border border-white/10 px-3 py-2 text-slate-300">
                Public tier: {selectedVenue.profileTier}
              </span>
              {selectedVenue.isFeatured && (
                <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-2 text-fuchsia-100">
                  Currently Featured
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {selectedVenue && (
        <>
          <div className="mt-6 grid gap-6 xl:grid-cols-2 xl:items-start">
            <div>
              <PreviewLabel
                eyebrow="Actual SingHUB UI"
                title="Current Free Profile"
                copy="This side renders the standard public venue profile using the venue's real stored information."
                tone="standard"
              />
              <VenueProfile
                venue={{
                  ...selectedVenue,
                  profileTier: "basic",
                  isFeatured: false,
                }}
                events={venueEvents}
              />
            </div>

            <div>
              <PreviewLabel
                eyebrow="Visual sales mockup"
                title="Founding Venue / Enhanced Example"
                copy="This side is only the example profile. It uses real venue data where available and realistic sample content where the enhanced profile has not been built out yet."
                tone="enhanced"
              />
              <EnhancedProfileMockup
                venue={selectedVenue}
                venueEvents={venueEvents}
              />
            </div>
          </div>

          <SalesExplainer venue={selectedVenue} venueEvents={venueEvents} />
        </>
      )}
    </div>
  );
}
