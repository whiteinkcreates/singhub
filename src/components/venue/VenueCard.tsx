import Link from "next/link";
import type { KaraokeEventListing, VenueListing } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EventSchedule } from "@/components/venue/EventSchedule";

type VenueCardProps = {
  venue: VenueListing;
  events?: KaraokeEventListing[];
  distanceLabel?: string;
};

function getListingBadge(venue: VenueListing) {
  if (venue.listingStatus === "verified") {
    return <Badge variant="verified">Verified</Badge>;
  }

  if (venue.listingStatus === "ai_scouted") {
    return <Badge variant="ai">AI-Scouted</Badge>;
  }

  if (venue.listingStatus === "claimed") {
    return <Badge variant="claimed">Claimed</Badge>;
  }

  return null;
}

function getTrustCopy(venue: VenueListing) {
  if (venue.listingStatus === "verified") {
    return "Verified listing. Still check the venue before heading out, especially on holidays or event nights.";
  }

  if (venue.listingStatus === "claimed") {
    return "Claimed listing. Venue or host details have been submitted, but schedules can still change.";
  }

  return "AI-scouted listing. This karaoke lead may need confirmation before you make firm plans.";
}

function hasUsableValue(value: string | undefined) {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();

  return normalizedValue.length > 0 && normalizedValue !== "tbd";
}

function getDirectionsUrl(venue: VenueListing) {
  if (!hasUsableValue(venue.address)) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.venueName} ${venue.address}`,
  )}`;
}

function getInstagramUrl(instagram: string | undefined) {
  if (!hasUsableValue(instagram)) {
    return null;
  }

  const trimmedInstagram = instagram.trim();

  if (trimmedInstagram.startsWith("http")) {
    return trimmedInstagram;
  }

  return `https://www.instagram.com/${trimmedInstagram.replace(/^@/, "")}`;
}

function ExternalActionLink({
  children,
  href,
}: {
  children: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-slate-950"
    >
      {children}
    </a>
  );
}

export function VenueCard({ venue, events = [], distanceLabel }: VenueCardProps) {
  const directionsUrl = getDirectionsUrl(venue);
  const instagramUrl = getInstagramUrl(venue.instagram);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 transition hover:border-fuchsia-400/40">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {getListingBadge(venue)}

            <Badge variant={venue.profileTier === "premium" ? "premium" : "basic"}>
              {venue.profileTier === "premium" ? "Premium" : "Basic"}
            </Badge>

            {venue.isFeatured && <Badge variant="premium">Featured</Badge>}
          </div>

          <Link href={`/venues/${venue.slug}`}>
            <h3 className="text-2xl font-black text-white hover:text-fuchsia-200">
              {venue.venueName}
            </h3>
          </Link>

          <p className="mt-1 text-sm text-slate-400">
            {venue.neighborhood} • {venue.address}
          </p>

          {distanceLabel && (
            <p className="mt-2 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
              {distanceLabel}
            </p>
          )}

          {events.length > 0 ? (
            <EventSchedule events={events} variant="compact" />
          ) : (
            <p className="mt-3 text-sm font-semibold text-cyan-200">
              {venue.karaokeDay} • {venue.startTime} to {venue.endTime}
              {venue.hostName ? ` • Host: ${venue.hostName}` : ""}
            </p>
          )}

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            {venue.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {venue.vibeTags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-xs leading-5 text-slate-200">
            {getTrustCopy(venue)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3 md:w-44 md:flex-col">
          <Button href={`/venues/${venue.slug}`}>View Profile</Button>
          {directionsUrl && (
            <ExternalActionLink href={directionsUrl}>Directions</ExternalActionLink>
          )}
          {venue.website && (
            <ExternalActionLink href={venue.website}>Website</ExternalActionLink>
          )}
          {instagramUrl && (
            <ExternalActionLink href={instagramUrl}>Instagram</ExternalActionLink>
          )}
          <Button href={`/claim-listing?venue=${venue.slug}`} variant="ghost">
            Claim/Update
          </Button>
        </div>
      </div>
    </article>
  );
}
