/* eslint-disable @next/next/no-img-element */
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EventSchedule } from "@/components/venue/EventSchedule";
import type { KaraokeEventListing, VenueListing } from "@/types";

type VenueProfileProps = {
  venue: VenueListing;
  events?: KaraokeEventListing[];
};

const DEFAULT_BANNER_IMAGE_URL = "/images/venues/default-singhub-banner.svg";

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

function isUsableUrl(value: string | undefined) {
  const usableValue = getUsableValue(value);

  if (!usableValue) {
    return false;
  }

  return usableValue.startsWith("http://") || usableValue.startsWith("https://");
}

function getBannerImageUrl(venue: VenueListing) {
  return getUsableValue(venue.bannerImageUrl) ?? DEFAULT_BANNER_IMAGE_URL;
}

function getBannerImageAlt(venue: VenueListing) {
  return (
    getUsableValue(venue.bannerImageAlt) ??
    `SingHUB enhanced karaoke listing banner for ${venue.venueName}`
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <dt className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm leading-6 text-slate-200">{value}</dd>
    </div>
  );
}

function getProfileStatusBadge(venue: VenueListing) {
  if (venue.listingStatus === "claimed") {
    return <Badge variant="claimed">Recently Updated</Badge>;
  }

  if (venue.listingStatus === "verified") {
    return <Badge variant="verified">Verified</Badge>;
  }

  return <Badge variant="basic">Details Pending</Badge>;
}

function PremiumProfile({ venue, events = [] }: VenueProfileProps) {
  const bannerImageUrl = getBannerImageUrl(venue);
  const bannerImageAlt = getBannerImageAlt(venue);
  const hasBannerImageUrl = isUsableUrl(venue.bannerImageUrl);
  const hasReservationUrl = isUsableUrl(venue.reservationLink);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="overflow-hidden rounded-[2rem] border border-fuchsia-400/30 bg-slate-950 shadow-2xl shadow-fuchsia-950/30">
        <div className="relative min-h-[28rem] overflow-hidden">
          <img
            src={bannerImageUrl}
            alt={bannerImageAlt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/45 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/35 to-slate-950/70" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-400" />

          <div className="relative flex min-h-[28rem] flex-col justify-end p-6 md:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge variant="premium">Enhanced Profile</Badge>
              {getProfileStatusBadge(venue)}
              {venue.isFeatured && <Badge variant="premium">Featured</Badge>}
            </div>

            <h1 className="mt-5 text-4xl font-black text-white drop-shadow-2xl md:text-6xl">
              {venue.venueName}
            </h1>
            <p className="mt-3 text-lg font-semibold text-cyan-200">
              {venue.neighborhood} • {venue.karaokeDay} • {venue.startTime} to{" "}
              {venue.endTime}
            </p>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-100">
              {venue.description}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            {venue.vibeTags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          <EventSchedule events={events} />

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <DetailRow label="Specials" value={venue.specials} />
            <DetailRow label="Happy Hour" value={venue.happyHour} />
            <DetailRow label="Food" value={venue.foodHighlights} />
            <DetailRow label="Drinks" value={venue.drinkHighlights} />
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black text-white">Plan your night</h2>
          <dl className="mt-4 space-y-3 text-sm text-slate-300">
            <DetailLine label="Address" value={venue.address} />
            <DetailLine label="Host" value={venue.hostName} />
            <DetailLine label="Cover" value={venue.coverCharge} />
            <DetailLine label="Age policy" value={venue.agePolicy} />
            <DetailLine label="Parking" value={venue.parkingInfo} />
            <DetailLine label="Accessibility" value={venue.accessibilityNotes} />
            {!hasReservationUrl && (
              <DetailLine label="Reservations" value={venue.reservationLink} />
            )}
          </dl>
          <div className="mt-6 flex flex-col gap-3">
            {hasReservationUrl && venue.reservationLink && (
              <Button href={venue.reservationLink}>Reserve / Learn More</Button>
            )}
            {hasBannerImageUrl && venue.bannerImageUrl && (
              <Button href={venue.bannerImageUrl} variant="secondary">
                View event flyer
              </Button>
            )}
            <Button href={`/claim-listing?venue=${venue.slug}`} variant="ghost">
              Claim or update this listing
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function BasicProfile({ venue, events = [] }: VenueProfileProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge variant="basic">Basic Profile</Badge>
          {getProfileStatusBadge(venue)}
        </div>
        <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
          {venue.venueName}
        </h1>
        <p className="mt-3 text-lg font-semibold text-cyan-200">
          {venue.neighborhood} • {venue.karaokeDay} • {venue.startTime} to{" "}
          {venue.endTime}
        </p>
        <p className="mt-5 max-w-3xl leading-8 text-slate-300">
          {venue.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {venue.vibeTags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <EventSchedule events={events} />
      </section>

      <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-black text-white">Listing details</h2>
        <dl className="mt-4 space-y-3 text-sm text-slate-300">
          <DetailLine label="Address" value={venue.address} />
          <DetailLine label="Host" value={venue.hostName} />
          <DetailLine label="Cover" value={venue.coverCharge} />
          <DetailLine label="Age policy" value={venue.agePolicy} />
        </dl>
        <div className="mt-6 flex flex-col gap-3">
          <Button href="/venues/premium" variant="secondary">
            Upgrade to Enhanced
          </Button>
          <Button href={`/claim-listing?venue=${venue.slug}`} variant="ghost">
            Claim this listing
          </Button>
        </div>
      </aside>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value?: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-200">{value}</dd>
    </div>
  );
}

export function VenueProfile({ venue, events = [] }: VenueProfileProps) {
  if (venue.profileTier === "premium") {
    return <PremiumProfile venue={venue} events={events} />;
  }

  return <BasicProfile venue={venue} events={events} />;
}
