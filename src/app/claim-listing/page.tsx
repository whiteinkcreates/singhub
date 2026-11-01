import { ClaimListingForm } from "@/components/submit/ClaimListingForm";
import { FoundingVenueInquiryForm } from "@/components/submit/FoundingVenueInquiryForm";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getVenueListings } from "@/lib/venueData";

export const metadata = {
  title: "Claim a Karaoke Listing | SingHUB",
  description: "Claim, update, or upgrade a SingHUB karaoke venue listing.",
  alternates: { canonical: "/claim-listing" },
};

type ClaimListingPageProps = {
  searchParams?: Promise<{
    venue?: string;
    premium?: string;
  }>;
};

export default async function ClaimListingPage({
  searchParams,
}: ClaimListingPageProps) {
  const venues = getPublicVenues(await getVenueListings());
  const resolvedSearchParams = await searchParams;
  const selectedVenueSlug = resolvedSearchParams?.venue;
  const isFoundingVenueInquiry = resolvedSearchParams?.premium === "true";

  if (isFoundingVenueInquiry) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <section className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/35 bg-slate-950 px-5 py-8 shadow-2xl shadow-fuchsia-950/30 sm:px-8 md:px-10 md:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_5%,rgba(217,70,239,0.24),transparent_20rem),radial-gradient(circle_at_88%_12%,rgba(34,211,238,0.16),transparent_20rem)]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-red-400" />
          <div className="relative max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300 sm:text-sm">
              SINGHUB PARTNER
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
              Let&apos;s make your karaoke night easier to find.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg md:leading-8">
              Ask about the $59/month SingHUB Partner plan. We will review your venue, discuss your calendar and promotional goals, and confirm setup and terms before any payment.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-200 sm:text-sm">
              <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-2">$59/month standard rate</span>
              <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-2">No payment today</span>
              <span className="rounded-full border border-red-300/30 bg-red-400/10 px-3 py-2">Personal follow-up</span>
            </div>
          </div>
        </section>

        <FoundingVenueInquiryForm venues={venues} selectedVenueSlug={selectedVenueSlug} />
      </main>
    );
  }

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
          Owners and managers can request to claim their listing for free. Anyone can submit a correction. Requests go to the SingHUB review queue, and venue authority is checked before a listing is marked claimed. No account or payment required.
        </p>
      </section>

      <ClaimListingForm venues={venues} selectedVenueSlug={selectedVenueSlug} />
    </main>
  );
}
