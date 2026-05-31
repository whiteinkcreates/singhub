import Link from "next/link";
import type { KaraokeEvent, Venue } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type VenueCardProps = {
  venue: Venue;
  event?: KaraokeEvent;
};

function getListingBadge(venue: Venue) {
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

export function VenueCard({ venue, event }: VenueCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 transition hover:border-fuchsia-400/40">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
              {venue.name}
            </h3>
          </Link>

          <p className="mt-1 text-sm text-slate-400">
            {venue.neighborhood} • {venue.address}
          </p>

          {event && (
            <p className="mt-3 text-sm font-semibold text-cyan-200">
              {event.dayOfWeek} • {event.startTime} to {event.endTime}
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

          {venue.listingStatus === "ai_scouted" && (
            <p className="mt-4 rounded-2xl border border-purple-400/20 bg-purple-400/10 p-3 text-xs leading-5 text-purple-100">
              This listing was AI-scouted and may need verification. Claim or
              update this listing to keep it accurate.
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-3 md:flex-col">
          <Button href={`/venues/${venue.slug}`}>View Profile</Button>
          <Button href="/claim-listing" variant="ghost">
            Claim/Update
          </Button>
        </div>
      </div>
    </article>
  );
}