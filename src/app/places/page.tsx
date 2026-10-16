import { KaraokePlacesExperience } from "@/components/places/KaraokePlacesExperience";
import { V2IndexHero } from "@/components/layout/V2IndexHero";
import { getPublicIndexHero } from "@/lib/v2/indexHero.server";
import { SITE_RADAR_HERO_KEY } from "@/lib/hostMedia";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getVenueListings } from "@/lib/venueData";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "SingHUB Radar | Karaoke Places Worldwide",
  description: "Explore karaoke places on the SingHUB Radar, including verified schedules, community finds, and venues that still need confirmation.",
  alternates: { canonical: "/places" },
};

export default async function KaraokePlacesPage() {
  const [allVenues, hero] = await Promise.all([
    getVenueListings(),
    getPublicIndexHero(SITE_RADAR_HERO_KEY),
  ]);
  const venues = getPublicVenues(allVenues);
  return (
    <main className="min-h-screen bg-[#050609] text-white">
      <V2IndexHero
        eyebrow="SINGHUB RADAR"
        title="Explore karaoke places worth knowing."
        description="Browse verified karaoke and community finds from everywhere singers explore. Radar listings may still need confirmation. For current San Diego nights, use the Finder."
        heroUrl={hero?.heroUrl}
        heroAlt={hero?.heroAlt}
        heroPosition={hero?.heroPosition}
        heroPlacement={hero?.heroPlacement}
        primaryHref="/find-karaoke"
        primaryLabel="Find San Diego karaoke"
      />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8">
        <KaraokePlacesExperience venues={venues} />
      </div>
    </main>
  );
}
