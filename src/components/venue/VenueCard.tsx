/* eslint-disable @next/next/no-img-element */
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

const DEFAULT_BANNER_IMAGE_URL = "/images/venues/default-singhub-banner.svg";

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

function getBannerImageUrl(venue: VenueListing) {
  return getUsableValue(venue.bannerImageUrl) ?? DEFAULT_BANNER_IMAGE_URL;
}

function getBannerImageAlt(venue: VenueListing) {
  return (
    getUsableValue(venue.bannerImageAlt) ??
    `SingHUB premium karaoke listing banner for ${venue.venueName}`
  );
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
  const bannerImageUrl = getBannerImageUrl(venue);
  const bannerImageAlt = getBannerImageAlt(venue);

  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/50 bg-slate-950 shadow-2xl shadow-fuchsia-950/40 transition hover:border-fuchsia-200/80">
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-400/35 via-transparent to-fuchsia-400/35 opacity-80" />
      <div className="absolute inset-[1px] rounded-[1.95rem] bg-slate-950" />

      <div className="relative overflow-hidden rounded-[1.95rem]">
        <div className="relative min-h-[26rem] overflow-hidden md:min-h-[30rem]">
          <img
            src={bannerImageUrl}
            alt={bannerImageAlt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/45 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/30 to-slate-950/70" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-400" />

          <div className="relative flex min-h-[26rem] flex-col justify-between p-5 md:min-h-[30rem] md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {distanceLabel && (
                  <span className="inline-flex rounded-full border border-cyan-300/50 bg-slate-950/60 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 backdrop-blur">
                    {distanceLabel}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="premium">Premium Profile</Badge>
                {getListingBadge(venue)}
                {venue.isFeatured && <Badge variant="premium">Featured</Badge>}
              </div>
            </div>

            <div className="max-w-4xl">
              <p className="mb-3 inline-flex rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-100 backdrop-blur">
                Enhanced karaoke listing
              </p>
              <Link href={`/venues/${venue.slug}`}>
                <h3 className="text-4xl font-black leading-tight text-white drop-shadow-2xl hover:text-fuchsia-100 md:text-6xl">
                  {venue.venueName}
                </h3>
              </Link>
              <p className="mt-3 text-base font-semibold text-cyan-100 md:text-lg">
                {venue.neighborhood} • {venue.address}
              </p>

              <div className="mt-5 max-w-2xl rounded-2xl border border-cyan-300/30 bg-slate-950/65 p-4 backdrop-blur">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                  Karaoke schedule
                </p>
                {events.length > 0 ? (
                  <EventSchedule events={events} variant="compact" />
                ) : (
                  <p className="text-sm font-semibold text-cyan-100 md:text-base">
                    {venue.karaokeDay} • {venue.startTime} to {venue.endTime}
                    {venue.hostName ? ` • Host: ${venue.hostName}` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative space-y-5 border-t border-white/10 bg-slate-950 p-5 md:p-8">
          <p className="max-w-3xl text-base leading-7 text-slate-200">
            {venue.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {venue.vibeTags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          {premiumHighlights.length > 0 && (
            <div className="grid gap-3 md:grid-cols-4">
              {premiumHighlights.slice(0, 4).map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-200">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-slate-100">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          <VenueActions
            venue={venue}
            directionsUrl={directionsUrl}
            instagramUrl={instagramUrl}
            websiteUrl={websiteUrl}
            premium
          />

          <p className="rounded-2xl border border-fuchsia-300/20 bg-slate-950/80 p-3 text-xs leading-5 text-fuchsia-50">
            {getTrustCopy(venue)}
          </p>
        </div>
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

        <div className="flex shrink-0 flex-wrap gap-3 md:w-44 md:flex-col">
          <Button href={`/venues/${venue.slug}`}>View Profile</Button>
          {directionsUrl && <ExternalActionLink href={directionsUrl}>Directions</ExternalActionLink>}
          {websiteUrl && <ExternalActionLink href={websiteUrl}>Website</ExternalActionLink>}
          {instagramUrl && <ExternalActionLink href={instagramUrl}>Instagram</ExternalActionLink>}
          <Button href={`/claim-listing?venue=${venue.slug}`} variant="ghost">
            Claim/Update
          </Button>
        </div>
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
