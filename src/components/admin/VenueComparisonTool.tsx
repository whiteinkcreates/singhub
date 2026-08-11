"use client";

import { useMemo, useState } from "react";
import type { KaraokeEventListing, VenueListing } from "@/types";

type VenueComparisonToolProps = {
  venues: VenueListing[];
  events: KaraokeEventListing[];
};

type EnhancedField = {
  key: string;
  label: string;
  value?: string;
  emptyPrompt: string;
};

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

function getEnhancedFields(venue: VenueListing): EnhancedField[] {
  return [
    {
      key: "specials",
      label: "Weekly Specials",
      value: cleanValue(venue.specials),
      emptyPrompt: "Add karaoke-night deals, weekly specials, or recurring promotions.",
    },
    {
      key: "happy-hour",
      label: "Happy Hour",
      value: cleanValue(venue.happyHour),
      emptyPrompt: "Add happy hour times and offers that help singers plan the night.",
    },
    {
      key: "food",
      label: "Food Highlights",
      value: cleanValue(venue.foodHighlights),
      emptyPrompt: "Feature kitchen hours, late-night food, or signature items.",
    },
    {
      key: "drinks",
      label: "Drink Highlights",
      value: cleanValue(venue.drinkHighlights),
      emptyPrompt: "Feature cocktails, drink specials, beer, or other bar highlights.",
    },
    {
      key: "parking",
      label: "Parking / Arrival Tips",
      value: cleanValue(venue.parkingInfo),
      emptyPrompt: "Tell singers where to park, rideshare, or what to expect on arrival.",
    },
    {
      key: "cover",
      label: "Cover Charge",
      value: cleanValue(venue.coverCharge),
      emptyPrompt: "Clarify whether karaoke has a cover, minimum, or no charge.",
    },
    {
      key: "age-policy",
      label: "Age Policy",
      value: cleanValue(venue.agePolicy),
      emptyPrompt: "Clarify 21+, all-ages windows, or other entry policies.",
    },
    {
      key: "accessibility",
      label: "Accessibility",
      value: cleanValue(venue.accessibilityNotes),
      emptyPrompt: "Add useful accessibility details for the room and stage area.",
    },
    {
      key: "reservation",
      label: "Reservations / Event Link",
      value: cleanValue(venue.reservationLink),
      emptyPrompt: "Add a reservation, ticket, flyer, or event link when relevant.",
    },
    {
      key: "booking",
      label: "Booking / Event Contact",
      value: cleanValue(venue.bookingContact),
      emptyPrompt: "Add the best contact for private events, groups, or karaoke inquiries.",
    },
    {
      key: "instagram",
      label: "Instagram",
      value: cleanValue(venue.instagram),
      emptyPrompt: "Connect the venue's Instagram for discovery and event promotion.",
    },
    {
      key: "website",
      label: "Website",
      value: cleanValue(venue.website),
      emptyPrompt: "Connect the official venue website or landing page.",
    },
    {
      key: "hero",
      label: "Featured Image / Flyer",
      value: cleanValue(venue.bannerImageUrl),
      emptyPrompt: "Add a hero image, karaoke flyer, or current event creative.",
    },
  ];
}

function FieldCard({ field }: { field: EnhancedField }) {
  const hasValue = Boolean(field.value);

  return (
    <div
      className={`rounded-2xl border p-4 ${
        hasValue
          ? "border-cyan-300/25 bg-cyan-300/[0.06]"
          : "border-fuchsia-300/20 bg-fuchsia-300/[0.05]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
          {field.label}
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] ${
            hasValue
              ? "bg-cyan-300/15 text-cyan-100"
              : "bg-fuchsia-300/15 text-fuchsia-100"
          }`}
        >
          {hasValue ? "Ready" : "Opportunity"}
        </span>
      </div>
      <p className={`mt-3 text-sm leading-6 ${hasValue ? "text-white" : "text-slate-400"}`}>
        {field.value || field.emptyPrompt}
      </p>
    </div>
  );
}

function StandardPreview({
  venue,
  venueEvents,
}: {
  venue: VenueListing;
  venueEvents: KaraokeEventListing[];
}) {
  const scheduleLines = getScheduleLines(venueEvents);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
          Current Free Profile
        </p>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-300">
          Standard listing
        </span>
      </div>

      <h2 className="mt-5 text-3xl font-black text-white">{venue.venueName}</h2>
      <p className="mt-2 text-sm font-semibold text-cyan-200">
        {venue.neighborhood} • {venue.address}
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
          Karaoke Schedule
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-200">
          {scheduleLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-slate-300">
        {cleanValue(venue.description) || "Basic venue description is still being confirmed."}
      </p>

      {venue.vibeTags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {venue.vibeTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-400">
        Free listings keep the core discovery information accurate and useful. The Founding Venue preview shows the additional presentation and promotional surface area available through a venue partnership.
      </div>
    </section>
  );
}

function FoundingPreview({
  venue,
  venueEvents,
}: {
  venue: VenueListing;
  venueEvents: KaraokeEventListing[];
}) {
  const fields = getEnhancedFields(venue);
  const readyCount = fields.filter((field) => field.value).length;
  const opportunityCount = fields.length - readyCount;
  const scheduleLines = getScheduleLines(venueEvents);
  const bannerImage = cleanValue(venue.bannerImageUrl);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-fuchsia-300/40 bg-slate-950 shadow-2xl shadow-fuchsia-950/25">
      <div
        className="relative min-h-72 overflow-hidden border-b border-white/10 p-5 md:p-7"
        style={
          bannerImage
            ? {
                backgroundImage: `linear-gradient(to top, rgba(2,6,23,0.98), rgba(2,6,23,0.36)), url('${bannerImage}')`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }
            : {
                background:
                  "radial-gradient(circle at 85% 10%, rgba(34,211,238,0.22), transparent 18rem), radial-gradient(circle at 15% 25%, rgba(217,70,239,0.24), transparent 20rem), #020617",
              }
        }
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-red-400" />
        <div className="relative flex min-h-60 flex-col justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-100">
              Founding Venue Preview
            </span>
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
              Enhanced presence
            </span>
          </div>

          <div>
            <h2 className="text-4xl font-black text-white md:text-5xl">{venue.venueName}</h2>
            <p className="mt-3 text-sm font-semibold text-cyan-100 md:text-base">
              {venue.neighborhood} • {venue.address}
            </p>
            <div className="mt-4 space-y-1 text-sm font-semibold text-white/90">
              {scheduleLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-7">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Ready now</p>
            <p className="mt-2 text-3xl font-black text-white">{readyCount}</p>
            <p className="mt-1 text-xs text-slate-400">enhanced fields already populated</p>
          </div>
          <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.06] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-200">Opportunities</p>
            <p className="mt-2 text-3xl font-black text-white">{opportunityCount}</p>
            <p className="mt-1 text-xs text-slate-400">fields we can build out together</p>
          </div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">Pilot</p>
            <p className="mt-2 text-3xl font-black text-white">90 days</p>
            <p className="mt-1 text-xs text-slate-400">hands-on Founding Venue partnership</p>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-300">
                Enhanced profile fields
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                Everything we can add or improve
              </h3>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-400">
              Empty fields are intentionally shown in this admin preview so they can be discussed during the sales call.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {fields.map((field) => (
              <FieldCard key={field.key} field={field} />
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Stronger presentation", "Premium card and profile treatment that helps the venue look worth the trip."],
            ["Event promotion", "More room to feature recurring specials, flyers, and one-off karaoke events."],
            ["Priority updates", "Direct support when schedules, KJs, specials, or event details change."],
            ["Preferred visibility", "Eligibility for Featured and preferred discovery placements as pilot inventory rolls out."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-black text-white">{title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.05] p-4 text-sm leading-6 text-cyan-50">
          Preferred visibility is presented here as pilot eligibility, not a guaranteed top ranking. The organic venue index remains available to all valid karaoke venues.
        </div>
      </div>
    </section>
  );
}

export function VenueComparisonTool({ venues, events }: VenueComparisonToolProps) {
  const initialSlug =
    venues.find((venue) => venue.slug === "the-cordova")?.slug || venues[0]?.slug || "";
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
        <div className="mt-6 grid gap-6 xl:grid-cols-2 xl:items-start">
          <StandardPreview venue={selectedVenue} venueEvents={venueEvents} />
          <FoundingPreview venue={selectedVenue} venueEvents={venueEvents} />
        </div>
      )}
    </div>
  );
}
