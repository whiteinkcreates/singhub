import { VenuePartnerDemo } from "@/components/venue/VenuePartnerDemo";
import { getKaraokeEventListings } from "@/lib/eventData";
import { getVenueListings } from "@/lib/venueData";

export const metadata = {
  title: "Venue Partnership Demo | SingHUB",
  description:
    "Compare a current SingHUB venue listing with the enhanced Founding Venue experience.",
  robots: {
    index: false,
    follow: false,
  },
};

type VenueDemoPageProps = {
  searchParams: Promise<{
    venue?: string | string[];
  }>;
};

export default async function VenueDemoPage({ searchParams }: VenueDemoPageProps) {
  const [venues, events, params] = await Promise.all([
    getVenueListings(),
    getKaraokeEventListings(),
    searchParams,
  ]);

  const sortedVenues = [...venues]
    .filter((venue) => venue.venueType === "live_bar")
    .sort((a, b) => a.venueName.localeCompare(b.venueName));
  const requestedVenue = Array.isArray(params.venue) ? params.venue[0] : params.venue;

  return (
    <main className="mx-auto max-w-[96rem] px-4 py-10 text-white md:py-14">
      <section className="mb-9 max-w-5xl">
        <div className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
          SingHUB Founding Venue Demo
        </div>
        <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
          Your karaoke night is already listed. Here is what a partnership can turn it into.
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300 md:text-lg">
          Compare the live standard SingHUB experience with the enhanced venue treatment. The enhanced side uses the same production profile and finder-card components built for participating venues, with venue-specific demo details clearly identified where needed.
        </p>
      </section>

      <VenuePartnerDemo
        venues={sortedVenues}
        events={events}
        initialSlug={requestedVenue}
      />
    </main>
  );
}
