import Image from "next/image";
import { VenueLightUpBuilder } from "@/components/admin/VenueLightUpBuilder";
import { EMPTY_VENUE_ENHANCEMENT } from "@/lib/venueEnhancements";
import { getAdminVenueEnhancement } from "@/lib/venueEnhancements.server";
import { getVenueListings } from "@/lib/venueData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Venue Studio | SingHUB Admin",
  description: "Build and publish enhanced SingHUB venue profiles.",
  robots: { index: false, follow: false },
};

export default async function LightUpVenuesPage() {
  const venues = (await getVenueListings())
    .map((venue) => ({
      slug: venue.slug,
      name: venue.venueName,
      neighborhood: venue.neighborhood || venue.city,
      profileTier: venue.profileTier,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const initialSlug = venues.some((venue) => venue.slug === "barlando") ? "barlando" : venues[0]?.slug || "";
  const initialProfile = initialSlug
    ? (await getAdminVenueEnhancement(initialSlug)) || EMPTY_VENUE_ENHANCEMENT
    : EMPTY_VENUE_ENHANCEMENT;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-white">
      <section className="max-w-4xl">
        <Image
          src="/images/header-singhub-logo.png"
          alt="SingHUB"
          width={2400}
          height={600}
          className="h-auto w-44 object-contain object-left"
          priority
        />
        <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Venue Studio</p>
        <h1 className="mt-2 text-4xl font-black md:text-6xl">Light Up a Venue</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Choose any indexed venue, build its richer SingHUB presence, preview the important pieces, and publish when it is ready. Media lives in Cloudinary, venue facts are deliberate, and singer feedback remains separate as Singers Say.
        </p>
      </section>

      <section className="mt-8">
        <VenueLightUpBuilder initialSlug={initialSlug} initialProfile={initialProfile} venues={venues} />
      </section>
    </main>
  );
}
