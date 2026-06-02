import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Create a Premium Venue Profile | SingHUB",
  description: "Create an enhanced SingHUB profile for a San Diego karaoke venue.",
};

const premiumFeatures = [
  "Enhanced venue story, vibe tags, and karaoke-night highlights",
  "Food, drink, parking, accessibility, and age-policy sections",
  "Reservation, booking, website, and social links",
  "Featured placement eligibility on the SingHUB homepage",
];

export default function PremiumVenuePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="grid gap-8 lg:grid-cols-[1fr_28rem] lg:items-start">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-fuchsia-300">
            Premium Venue Profile
          </p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
            Build a richer profile for karaoke singers
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Premium profiles help venue owners present the details singers need
            before they choose a karaoke night. Phase 1 stores requests as a
            static form concept only—no payments, login, or dashboard behavior.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {premiumFeatures.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-4 text-sm leading-6 text-fuchsia-50"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        <form className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
          <h2 className="text-2xl font-black text-white">Premium profile request</h2>
          <div className="mt-6 space-y-4">
            <FormField label="Venue name" name="venue-name" required />
            <FormField label="Owner or manager name" name="owner-name" />
            <FormField label="Email" name="email" type="email" required />
            <FormField label="Website or Instagram" name="link" />
            <label className="block">
              <span className="text-sm font-semibold text-slate-200">
                What should singers know?
              </span>
              <textarea
                name="details"
                rows={5}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-fuchsia-400"
              />
            </label>
          </div>
          <Button className="mt-6 w-full" type="button">
            Request Premium Profile
          </Button>
        </form>
      </section>
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
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-fuchsia-400"
      />
    </label>
  );
}
