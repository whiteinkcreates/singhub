import { FindKaraokeExperience } from "@/components/find/FindKaraokeExperience";
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
          your location to find karaoke nearby, compare neighborhoods, check
          event schedules, and spot listings that still need verification.
        </p>
      </section>

      <FindKaraokeExperience
        venues={venues}
        eventsByVenueSlug={eventsByVenueSlug}
      />
    </main>
  );
}
