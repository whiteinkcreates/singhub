import { KaraokePlacesExperience } from "@/components/places/KaraokePlacesExperience";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getVenueListings } from "@/lib/venueData";

export const metadata = {
  title: "Karaoke Places | SingHUB",
  description:
    "Explore the SingHUB Venue Index: verified karaoke, places on the radar, recent visits, and SingHUB Salutes.",
};

export default async function KaraokePlacesPage() {
  const venues = getPublicVenues(await getVenueListings());

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/30 bg-slate-950 p-6 shadow-2xl shadow-fuchsia-950/30 md:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">
            Phase 1.5
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black text-white md:text-6xl">
            The karaoke map can remember more than tonight.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            SingHUB can pin places worth knowing without presenting every pin as an active event. Verified schedules still power the Finder. The Venue Index holds the larger karaoke story.
          </p>
        </div>
      </section>

      <div className="mt-8">
        <KaraokePlacesExperience venues={venues} />
      </div>
    </main>
  );
}
