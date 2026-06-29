import { FindKaraokeExperience } from "@/components/find/FindKaraokeExperience";
import { groupKaraokeEventsByVenueSlug } from "@/lib/eventData";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getVenueListings } from "@/lib/venueData";

type FindKaraokePageProps = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export const metadata = {
  title: "Find Karaoke in San Diego | SingHUB",
  description: "Find live karaoke, private rooms, and host-led karaoke nights in San Diego.",
};

function getSearchParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function FindKaraokePage({ searchParams }: FindKaraokePageProps) {
  const resolvedSearchParams = await searchParams;
  const venues = getPublicVenues(getVenueListings());
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
          Browse live karaoke, private rooms, and host-led events around San Diego.
          Use location, night, venue type, and trust filters to find the right mic.
        </p>
      </section>

      <FindKaraokeExperience
        venues={venues}
        eventsByVenueSlug={eventsByVenueSlug}
        initialDayFilter={getSearchParamValue(resolvedSearchParams?.day)}
        initialVenueTypeFilter={getSearchParamValue(resolvedSearchParams?.type)}
      />
    </main>
  );
}
