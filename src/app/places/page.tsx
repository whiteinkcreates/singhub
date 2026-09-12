import { KaraokePlacesExperience } from "@/components/places/KaraokePlacesExperience";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getVenueListings } from "@/lib/venueData";

export const metadata = {
  title: "SingHUB Radar | Karaoke Places Worldwide",
  description:
    "Explore karaoke places on the SingHUB Radar, including verified schedules, community finds, and venues that still need confirmation.",
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
            SingHUB Radar
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black text-white md:text-6xl">
            Explore karaoke places worth knowing.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            Browse verified karaoke and community-submitted finds from anywhere SingHUB singers have been or heard about. Radar listings may still need schedule confirmation and do not automatically mean karaoke is happening tonight. For current San Diego nights, use the Finder.
          </p>
        </div>
      </section>

      <div className="mt-8">
        <KaraokePlacesExperience venues={venues} />
      </div>
    </main>
  );
}
