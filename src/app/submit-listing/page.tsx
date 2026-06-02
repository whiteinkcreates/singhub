import { Button } from "@/components/ui/Button";

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
          Know a karaoke night missing from SingHUB? Send the basics. Phase 1 is
          read-only and mock-data driven, so this form is a front-end foundation
          for future review workflows.
        </p>
      </section>

      <form className="mt-10 grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:grid-cols-2 md:p-8">
        <FormField label="Venue name" name="venue-name" required />
        <FormField label="Neighborhood" name="neighborhood" required />
        <FormField label="Address" name="address" required className="md:col-span-2" />
        <FormField label="Karaoke day" name="karaoke-day" required />
        <FormField label="Start time" name="start-time" required />
        <FormField label="Host name" name="host-name" />
        <FormField label="Website or Instagram" name="link" />
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-200">
            Notes for singers
          </span>
          <textarea
            name="notes"
            rows={5}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </label>
        <div className="md:col-span-2">
          <Button type="button">Submit Listing</Button>
        </div>
      </form>
    </main>
  );
}

function FormField({
  label,
  name,
  required = false,
  className = "",
}: {
  label: string;
  name: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-200">
        {label} {required && <span className="text-fuchsia-300">*</span>}
      </span>
      <input
        name={name}
        required={required}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
      />
    </label>
  );
}
