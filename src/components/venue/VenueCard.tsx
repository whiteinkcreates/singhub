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

type VenueActionUrls = {
  directionsUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
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

function getUsableValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.toLowerCase();

  if (!trimmedValue || normalizedValue === "tbd") {
    return null;
  }

  return trimmedValue;
}

function getDirectionsUrl(venue: VenueListing) {
  const address = getUsableValue(venue.address);

  if (!address) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.venueName} ${address}`,
  )}`;
}

function getInstagramUrl(instagram: string | undefined) {
  const trimmedInstagram = getUsableValue(instagram);

  if (!trimmedInstagram) {
    return null;
  }

  if (trimmedInstagram.startsWith("http")) {
    return trimmedInstagram;
  }

  return `https://www.instagram.com/${trimmedInstagram.replace(/^@/, "")}`;
}

function getPremiumHighlights(venue: VenueListing) {
  return [
    { label: "Specials", value: getUsableValue(venue.specials) },
    { label: "Happy hour", value: getUsableValue(venue.happyHour) },
    { label: "Food", value: getUsableValue(venue.foodHighlights) },
    { label: "Drinks", value: getUsableValue(venue.drinkHighlights) },
    { label: "Parking", value: getUsableValue(venue.parkingInfo) },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));
}

function ExternalActionLink({
  children,
  href,
  featured = false,
}: {
  children: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
        featured
          ? "border-fuchsia-300/70 bg-fuchsia-300/15 text-fuchsia-50 hover:bg-fuchsia-300/25"
          : "border-cyan-400/50 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"
      }`}
    >
      {children}
    </a>
  );
}

function VenueActions({
  venue,
  directionsUrl,
  instagramUrl,
  websiteUrl,
  premium = false,
}: VenueActionUrls & {
  venue: VenueListing;
  premium?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-wrap gap-3 md:w-44 md:flex-col">
      <Button href={`/venues/${venue.slug}`}>{premium ? "Open Premium Profile" : "View Profile"}</Button>
      {directionsUrl && (
        <ExternalActionLink href={directionsUrl} featured={premium}>
          Directions
        </ExternalActionLink>
      )}
      {websiteUrl && (
        <ExternalActionLink href={websiteUrl} featured={premium}>
          Website
        </ExternalActionLink>
      )}
      {instagramUrl && (
        <ExternalActionLink href={instagramUrl} featured={premium}>
          Instagram
        </ExternalActionLink>
      )}
      <Button href={`/claim-listing?venue=${venue.slug}`} variant="ghost">
        Claim/Update
      </Button>
    </div>
  );
}

function PremiumVenueCard({ venue, events = [], distanceLabel }: VenueCardProps) {
  const directionsUrl = getDirectionsUrl(venue);
  const instagramUrl = getInstagramUrl(venue.instagram);
  const websiteUrl = getUsableValue(venue.website);
  const premiumHighlights = getPremiumHighlights(venue);

  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/40 bg-gradient-to-br from-fuchsia-500/15 via-white/[0.06] to-cyan-400/10 p-5 shadow-2xl shadow-fuchsia-950/30 transition hover:border-fuchsia-200/70">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-400" />
      <div className="absolute -right-20 -top-24 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="premium">Premium Profile</Badge>
            {getListingBadge(venue)}
            {venue.isFeatured && <Badge variant="premium">Featured</Badge>}
          </div>

          <p className="mb-3 inline-flex rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-100">
            Enhanced karaoke listing
          </p>

          <Link href={`/venues/${venue.slug}`}>
            <h3 className="text-3xl font-black text-white hover:text-fuchsia-100 md:text-4xl">
              {venue.venueName}
            </h3>
          </Link>

          <p className="mt-2 text-sm font-semibold text-cyan-100">
            {venue.neighborhood} • {venue.address}
          </p>

          {distanceLabel && (
            <p className="mt-3 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
              {distanceLabel}
            </p>
          )}

          <div className="mt-4 rounded-2xl border border-fuchsia-300/20 bg-slate-950/45 p-4">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-200">
              Karaoke schedule
            </p>
            {events.length > 0 ? (
              <EventSchedule events={events} variant="compact" />
            ) : (
              <p className="text-sm font-semibold text-cyan-200">
                {venue.karaokeDay} • {venue.startTime} to {venue.endTime}
                {venue.hostName ? ` • Host: ${venue.hostName}` : ""}
              </p>
            )}
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200">
            {venue.description}
          </p>

          {premiumHighlights.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {premiumHighlights.slice(0, 4).map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-200">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-100">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {venue.vibeTags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          <p className="mt-4 rounded-2xl border border-fuchsia-300/20 bg-slate-950/50 p-3 text-xs leading-5 text-fuchsia-50">
            {getTrustCopy(venue)}
          </p>
        </div>

        <VenueActions
          venue={venue}
          directionsUrl={directionsUrl}
          instagramUrl={instagramUrl}
          websiteUrl={websiteUrl}
          premium
        />
      </div>
    </article>
  );
}

function BasicVenueCard({ venue, events = [], distanceLabel }: VenueCardProps) {
  const directionsUrl = getDirectionsUrl(venue);
  const instagramUrl = getInstagramUrl(venue.instagram);
  const websiteUrl = getUsableValue(venue.website);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 transition hover:border-fuchsia-400/40">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {getListingBadge(venue)}

            <Badge variant="basic">Basic</Badge>

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

        <VenueActions
          venue={venue}
          directionsUrl={directionsUrl}
          instagramUrl={instagramUrl}
          websiteUrl={websiteUrl}
        />
      </div>
    </article>
  );
}

export function VenueCard({ venue, events = [], distanceLabel }: VenueCardProps) {
  if (venue.profileTier === "premium") {
    return <PremiumVenueCard venue={venue} events={events} distanceLabel={distanceLabel} />;
  }

  return <BasicVenueCard venue={venue} events={events} distanceLabel={distanceLabel} />;
}
