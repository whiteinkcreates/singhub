import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "SingHUB Scout | Karaoke Discovery Program",
  description: "Learn how SingHUB Scout discovers and flags San Diego karaoke listings.",
};

const steps = [
  {
    title: "Discover",
    body: "Scout candidates start as public karaoke leads from community tips, venue pages, and local event patterns.",
  },
  {
    title: "Label",
    body: "Unconfirmed leads are clearly marked as AI-scouted so singers know the listing needs verification.",
  },
  {
    title: "Confirm",
    body: "Venues, hosts, and singers can submit or claim listings to move details toward verified status.",
  },
];

export default function ScoutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-300">
          SingHUB Scout
        </p>
        <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">
          Helping karaoke nights get discovered
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          SingHUB Scout is the Phase 1 discovery concept for finding karaoke
          nights around San Diego. It keeps early listings transparent by
          separating verified venue data from leads that still need confirmation.
        </p>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <article
            key={step.title}
            className="rounded-[2rem] border border-purple-400/20 bg-purple-400/10 p-6"
          >
            <h2 className="text-2xl font-black text-white">{step.title}</h2>
            <p className="mt-3 text-sm leading-6 text-purple-50">{step.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <h2 className="text-2xl font-black text-white">Know a karaoke night?</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-300">
          Submit it for SingHUB review or claim a listing that already appears
          in the finder. Phase 1 avoids databases and dashboards, so these are
          static public flows only.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button href="/submit-listing">Submit a Listing</Button>
          <Button href="/claim-listing" variant="secondary">
            Claim a Listing
          </Button>
        </div>
      </section>
    </main>
  );
}
