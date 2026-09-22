import Link from "next/link";
import type { KaraokeEventListing, VenueListing } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { EventSchedule } from "@/components/venue/EventSchedule";
import { LitUpVenueCard } from "@/components/venue/LitUpVenueCard";
import { isLitUpVenue } from "@/lib/venueEnhancements";

type VenueCardProps = {
  venue: VenueListing;
  events?: KaraokeEventListing[];
  distanceLabel?: string;
};


function getListingBadge(venue: VenueListing) {
  if (venue.listingStatus === "verified") {
    return <Badge variant="verified">Verified Karaoke</Badge>;
  }

  if (venue.listingStatus === "claimed") {
    return <Badge variant="claimed">Recently Updated</Badge>;
  }

  return <Badge variant="basic">On the Radar</Badge>;
}

function getTrustCopy(venue: VenueListing) {
  if (venue.listingStatus === "verified") {
    return "Verified karaoke details. Still check the venue before heading out, especially on holidays or event nights.";
  }

  if (venue.listingStatus === "claimed") {
    return "Recently updated listing. Venue or host details have been submitted, but schedules can still change.";
  }

  return "Check before you go. Karaoke schedules can shift for private events, holidays, host changes, or one-off programming.";
}

function getUsableValue(value: string | undefined) {
  if (!value) return null;

  const trimmedValue = value.trim();
  if (!trimmedValue || /^(tbd|unknown|-|n\/a)$/i.test(trimmedValue)) return null;

  return trimmedValue;
}

function getDirectionsUrl(venue: VenueListing) {
  const address = getUsableValue(venue.address);
  if (!address) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.venueName} ${address}`,
  )}`;
}

function getLegacyScheduleSummary(venue: VenueListing) {
  const day = getUsableValue(venue.karaokeDay);
  const start = getUsableValue(venue.startTime);
  const end = getUsableValue(venue.endTime);

  if (!day && !start && !end) return null;

  const time = start && end ? `${start} to ${end}` : start || end;
  return [day, time].filter(Boolean).join(" • ");
}

function BasicVenueActions({
  venue,
  directionsUrl,
}: {
  venue: VenueListing;
  directionsUrl: string | null;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-cyan-400/45 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/20 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Directions
        </a>
      )}
      <Link
        href={`/claim-listing?venue=${venue.slug}`}
        className="text-sm font-semibold text-slate-400 underline-offset-4 transition hover:text-fuchsia-200 hover:underline"
      >
        Claim/Update
      </Link>
    </div>
  );
}

function SchedulePreview({ venue, events }: { venue: VenueListing; events: KaraokeEventListing[] }) {
  if (events.length > 0) return <EventSchedule events={events} variant="compact" />;

  const legacySummary = getLegacyScheduleSummary(venue);
  return (
    <p className="text-sm font-semibold text-cyan-100 md:text-base">
      {legacySummary || "Schedule details are being confirmed."}
    </p>
  );
}

function BasicVenueCard({ venue, events = [], distanceLabel }: VenueCardProps) {
  const directionsUrl = getDirectionsUrl(venue);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 transition hover:border-fuchsia-400/40">
      <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            {getListingBadge(venue)}
            {venue.isFeatured && <Badge variant="premium">Featured</Badge>}
          </div>

          <Link href={`/venues/${venue.slug}`}>
            <h3 className="text-2xl font-black text-white hover:text-fuchsia-200">{venue.venueName}</h3>
          </Link>

          <p className="mt-1 text-sm text-slate-400">{venue.neighborhood} • {venue.address}</p>

          {distanceLabel && (
            <p className="mt-2 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
              {distanceLabel}
            </p>
          )}

          <div className="mt-3"><SchedulePreview venue={venue} events={events} /></div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{venue.description}</p>

        <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-xs leading-5 text-slate-200">
          {getTrustCopy(venue)}
        </p>

        <BasicVenueActions venue={venue} directionsUrl={directionsUrl} />
      </div>
    </article>
  );
}

export function VenueCard({ venue, events = [], distanceLabel }: VenueCardProps) {
  if (venue.profileTier === "premium" || isLitUpVenue(venue.slug)) {
    return <LitUpVenueCard venue={venue} events={events} distanceLabel={distanceLabel} />;
  }

  return <BasicVenueCard venue={venue} events={events} distanceLabel={distanceLabel} />;
}
