import { SubmitListingForm } from "@/components/submit/SubmitListingForm";

export const metadata = {
  title: "Submit a Karaoke Listing | SingHUB",
  description: "Suggest a San Diego karaoke venue for SingHUB Phase 1.",
};

export default function SubmitListingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14 md:py-20">
      <section className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
          Submit Listing
        </p>
        <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
          Add a San Diego karaoke night
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Know a karaoke night missing from SingHUB? Send the venue, schedule,
          links, and contact details so it can be reviewed for the Venue Index.
        </p>
      </section>

      <SubmitListingForm />
    </main>
  );
}
