import { VenueComparisonExportShell } from "@/components/admin/VenueComparisonExportShell";
import { getKaraokeEventListings } from "@/lib/eventData";
import { getVenueListings } from "@/lib/venueData";

export const metadata = {
  title: "Venue Comparison | SingHUB Admin",
  description: "Internal sales preview for standard and Founding Venue profiles.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminVenueComparisonPage() {
  const [venues, events] = await Promise.all([
    getVenueListings(),
    getKaraokeEventListings(),
  ]);

  const sortedVenues = [...venues].sort((a, b) =>
    a.venueName.localeCompare(b.venueName),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">
      <section className="max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
          SingHUB Admin
        </p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">
          Venue Sales Comparison
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Pick any venue and compare its standard SingHUB presence with a
          Founding Venue preview. Missing enhanced fields stay visible so the
          opportunity is easy to show during a sales conversation.
        </p>
      </section>

      <VenueComparisonExportShell venues={sortedVenues} events={events} />
    </main>
  );
}
