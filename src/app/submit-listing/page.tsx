import { SubmitListingForm } from "@/components/submit/SubmitListingForm";

export const metadata = {
  title: "Submit a Karaoke Listing | SingHUB",
  description: "Suggest a San Diego karaoke venue or karaoke night for SingHUB Phase 1. Incomplete tips are welcome.",
};

export default function SubmitListingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14 md:py-20">
      <section className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
          Submit Listing
        </p>
        <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
          Tell us about a karaoke night
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Know a karaoke night missing from SingHUB? Send whatever you know: a venue name, host name, IG handle, Google link, flyer, day, time, or quick note. Incomplete listings are welcome and will go into the review queue.
        </p>
      </section>

      <SubmitListingForm />
    </main>
  );
}
