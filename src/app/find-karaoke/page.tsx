import { VenueMap } from "@/components/map/VenueMap";
import { VenueCard } from "@/components/venue/VenueCard";
import { groupKaraokeEventsByVenueSlug } from "@/lib/eventData";
import { getVenueListings } from "@/lib/venueData";

export const metadata = {
  title: "Find Karaoke in San Diego | SingHUB",
  description: "Browse TSV-powered San Diego karaoke listings on SingHUB.",
};

export default function FindKaraokePage() {
  const venues = getVenueListings();
  const eventsByVenueSlug = groupKaraokeEventsByVenueSlug();

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
          Karaoke Finder
        </p>
        <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
          Find karaoke nights in San Diego
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Browse every Phase 1 listing loaded from public/data/venues.tsv. Use
          the cards to compare neighborhoods, times, hosts, profile tiers, and
          verification status.
        </p>
      </section>

      <div className="mt-10">
        <VenueMap venues={venues} />
      </div>

      <section className="mt-10">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">All listings</h2>
            <p className="mt-1 text-sm text-slate-400">
              Showing {venues.length} TSV-powered venue listings.
            </p>
          </div>
        </div>

        <div className="grid gap-5">
          {venues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              events={eventsByVenueSlug[venue.slug] ?? []}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
