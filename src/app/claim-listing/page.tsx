import { ClaimListingForm } from "@/components/submit/ClaimListingForm";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getVenueListings } from "@/lib/venueData";

export const metadata = {
  title: "Claim a Karaoke Listing | SingHUB",
  description: "Claim or update a SingHUB karaoke venue listing.",
};

type ClaimListingPageProps = {
  searchParams?: Promise<{
    venue?: string;
  }>;
};

export default async function ClaimListingPage({
  searchParams,
}: ClaimListingPageProps) {
  const venues = getPublicVenues(getVenueListings());
  const resolvedSearchParams = await searchParams;
  const selectedVenueSlug = resolvedSearchParams?.venue;

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 md:py-20">
      <section className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">
          Claim Listing
        </p>
        <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
          Keep your karaoke listing accurate
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Venue owners, hosts, and regulars can send updates to a SingHUB listing. This does not create an account yet; it sends the update into the SingHUB review queue.
        </p>
      </section>

      <ClaimListingForm venues={venues} selectedVenueSlug={selectedVenueSlug} />
    </main>
  );
}
