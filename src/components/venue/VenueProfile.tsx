import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { VenueListing } from "@/types";

type VenueProfileProps = {
  venue: VenueListing;
};

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

function PremiumProfile({ venue }: VenueProfileProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="rounded-[2rem] border border-fuchsia-400/30 bg-fuchsia-400/10 p-6 shadow-2xl shadow-fuchsia-950/30 md:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge variant="premium">Premium Profile</Badge>
          <Badge variant={venue.listingStatus === "claimed" ? "claimed" : "verified"}>
            {venue.listingStatus === "claimed" ? "Claimed" : "Verified"}
          </Badge>
          {venue.isFeatured && <Badge variant="premium">Featured</Badge>}
        </div>

        <h1 className="mt-5 text-4xl font-black text-white md:text-6xl">
          {venue.venueName}
        </h1>
        <p className="mt-3 text-lg font-semibold text-cyan-200">
          {venue.neighborhood} • {venue.karaokeDay} • {venue.startTime} to{" "}
          {venue.endTime}
        </p>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">
          {venue.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {venue.vibeTags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <DetailRow label="Specials" value={venue.specials} />
          <DetailRow label="Happy Hour" value={venue.happyHour} />
          <DetailRow label="Food" value={venue.foodHighlights} />
          <DetailRow label="Drinks" value={venue.drinkHighlights} />
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
          </dl>
          <div className="mt-6 flex flex-col gap-3">
            {venue.reservationLink && (
              <Button href={venue.reservationLink}>Reserve / Learn More</Button>
            )}
            <Button href="/claim-listing" variant="ghost">
              Claim or update this listing
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function BasicProfile({ venue }: VenueProfileProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge variant="basic">Basic Profile</Badge>
          {venue.listingStatus === "verified" ? (
            <Badge variant="verified">Verified</Badge>
          ) : (
            <Badge variant="ai">AI-Scouted</Badge>
          )}
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
            Upgrade to Premium
          </Button>
          <Button href="/claim-listing" variant="ghost">
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

export function VenueProfile({ venue }: VenueProfileProps) {
  if (venue.profileTier === "premium") {
    return <PremiumProfile venue={venue} />;
  }

  return <BasicProfile venue={venue} />;
}
