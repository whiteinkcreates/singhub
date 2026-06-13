import { Button } from "@/components/ui/Button";
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
  const venues = getVenueListings();
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
          Venue owners and hosts can request updates to a SingHUB listing. This
          Phase 1 form does not create accounts; it establishes the public claim
          flow for future verification.
        </p>
      </section>

      <form className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-slate-200">
              Listing to claim
            </span>
            <select
              name="venue-slug"
              defaultValue={selectedVenueSlug}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-emerald-400"
            >
              {venues.map((venue) => (
                <option key={venue.id} value={venue.slug}>
                  {venue.venueName} - {venue.neighborhood}
                </option>
              ))}
            </select>
          </label>
          <FormField label="Your name" name="name" required />
          <FormField label="Email" name="email" type="email" required />
          <FormField label="Venue phone" name="phone" />
          <FormField label="Role at venue" name="role" />
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-slate-200">
              What needs to change?
            </span>
            <textarea
              name="changes"
              rows={5}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-emerald-400"
            />
          </label>
        </div>
        <Button className="mt-6" type="button">
          Request Claim / Update
        </Button>
      </form>
    </main>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-200">
        {label} {required && <span className="text-fuchsia-300">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-emerald-400"
      />
    </label>
  );
}
