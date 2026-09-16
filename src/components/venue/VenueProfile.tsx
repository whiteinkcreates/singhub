import { Button } from "@/components/ui/Button";
import { EventSchedule } from "@/components/venue/EventSchedule";
import { VibeCheckLauncher } from "@/components/venue/VibeCheckLauncher";
import { VenueSignalBadges, VenueSignalDetails } from "@/components/venue/VenueSignals";
import { LitUpVenueProfile } from "@/components/venue/LitUpVenueProfile";
import { SingersSay } from "@/components/venue/SingersSay";
import { isLitUpVenue, type VenueEnhancement } from "@/lib/venueEnhancements";
import type { SingersSaySummary } from "@/lib/singersSay.server";
import type { KaraokeEventListing, VenueListing } from "@/types";

type VenueProfileProps = {
  venue: VenueListing;
  events?: KaraokeEventListing[];
  enhancement?: VenueEnhancement;
  singersSay?: SingersSaySummary;
};

function getUsableValue(value: string | undefined) {
  if (!value) return null;
  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.toLowerCase();
  if (!trimmedValue || /^(tbd|unknown|-|n\/a)$/i.test(normalizedValue)) return null;
  return trimmedValue;
}

function DetailLine({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return <div><dt className="font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-slate-200">{value}</dd></div>;
}

function getScheduleHeadline(venue: VenueListing, events: KaraokeEventListing[]) {
  if (events.length > 0) {
    const days = Array.from(new Set(events.map((event) => getUsableValue(event.karaokeDay)).filter(Boolean))) as string[];
    const startTimes = Array.from(new Set(events.map((event) => getUsableValue(event.startTime)).filter(Boolean))) as string[];
    const parts = [venue.neighborhood, days.join(", ")];
    if (startTimes.length === 1) parts.push(startTimes[0]);
    return parts.filter(Boolean).join(" • ");
  }
  if (venue.listingStatus === "ai_scouted") return `${venue.neighborhood} • Karaoke place profile`;
  const day = getUsableValue(venue.karaokeDay);
  const start = getUsableValue(venue.startTime);
  const end = getUsableValue(venue.endTime);
  if (!day || !start) return venue.neighborhood;
  if (!end) return `${venue.neighborhood} • ${day} • ${start}`;
  return `${venue.neighborhood} • ${day} • ${start} to ${end}`;
}

function getHostSummary(venue: VenueListing, events: KaraokeEventListing[]) {
  if (events.length > 0) {
    const hosts = Array.from(new Set(events.map((event) => getUsableValue(event.hostName)).filter(Boolean))) as string[];
    return hosts.length ? hosts.join(" • ") : null;
  }
  return getUsableValue(venue.hostName);
}

function RadarContext({ venue, events }: VenueProfileProps) {
  if (venue.listingStatus !== "ai_scouted" || (events?.length ?? 0) > 0) return null;
  return <div className="mt-5 rounded-2xl border border-violet-300/25 bg-violet-300/[0.07] p-4 text-sm leading-6 text-violet-100">This place is saved in the SingHUB Venue Index. Its profile can appear on the map and in nearby searches without claiming karaoke is happening tonight.</div>;
}

function BasicProfile({ venue, events = [] }: VenueProfileProps) {
  const hostSummary = getHostSummary(venue, events);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <VenueSignalBadges venue={venue} />
        <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">{venue.venueName}</h1>
        <p className="mt-3 text-lg font-semibold text-cyan-200">{getScheduleHeadline(venue, events)}</p>
        <p className="mt-5 max-w-3xl leading-8 text-slate-300">{venue.description}</p>
        <RadarContext venue={venue} events={events} />
        <EventSchedule events={events} />
        <VenueSignalDetails venue={venue} />
      </section>
      <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-black text-white">Listing details</h2>
        <dl className="mt-4 space-y-3 text-sm text-slate-300">
          <DetailLine label="Address" value={venue.address} />
          <DetailLine label="KJ / Host" value={hostSummary} />
          <DetailLine label="Cover" value={venue.coverCharge} />
          <DetailLine label="Age policy" value={venue.agePolicy} />
        </dl>
        <div className="mt-6"><Button href={`/claim-listing?venue=${venue.slug}`} variant="ghost">Claim or update this listing</Button></div>
      </aside>
    </div>
  );
}

export function VenueProfile({ venue, events = [], enhancement, singersSay }: VenueProfileProps) {
  const vibeCheckEvents = events.map((event) => ({ eventId: event.eventId, karaokeDay: event.karaokeDay, startTime: event.startTime, hostName: event.hostName }));
  const enhanced = Boolean(enhancement?.enabled) || venue.profileTier === "premium" || isLitUpVenue(venue.slug);

  return (
    <>
      {enhanced ? (
        <LitUpVenueProfile venue={venue} events={events} enhancement={enhancement} singersSay={singersSay} />
      ) : (
        <>
          <BasicProfile venue={venue} events={events} />
          {singersSay ? <SingersSay summary={singersSay} /> : null}
        </>
      )}
      <VibeCheckLauncher venue={{ id: venue.id, slug: venue.slug, name: venue.venueName }} events={vibeCheckEvents} />
    </>
  );
}
