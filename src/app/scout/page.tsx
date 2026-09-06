import Link from "next/link";

export const metadata = {
  title: "SingHUB Scout | Karaoke Data Engine",
  description:
    "SingHUB Scout turns city karaoke signals into useful venue and event entries.",
  alternates: { canonical: "/scout" },
};

const signals = [
  "venue websites",
  "karaoke calendars",
  "host and KJ mentions",
  "flyers and recurring posts",
  "community submissions",
  "verified venue updates",
];

const steps = [
  {
    title: "Find the signals",
    text: "Scout gathers karaoke clues from the messy places real nightlife lives: venues, hosts, flyers, calendars, and local updates.",
  },
  {
    title: "Turn noise into leads",
    text: "Likely karaoke nights become reviewable leads with source notes, location clues, schedule hints, and confidence levels.",
  },
  {
    title: "Verify before publishing",
    text: "Listings are reviewed before they become public entries in the SingHUB Venue Index.",
  },
];

export default function ScoutExplainerPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-300/30 bg-slate-950 p-6 shadow-2xl shadow-cyan-950/40 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_24rem),radial-gradient(circle_at_80%_30%,rgba(217,70,239,0.18),transparent_24rem)]" />
        <div className="relative max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">
            SingHUB Scout
          </p>
          <h1 className="mt-4 text-4xl font-black text-white md:text-6xl">
            The karaoke data engine behind the Venue Index.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
            Karaoke data is messy. A city can have weekly bar nights, private rooms,
            one-off events, rotating KJs, stale calendars, and hidden gems that only
            show up in local posts. SingHUB Scout is the system we use to turn those
            signals into a cleaner karaoke centerpiece for each city.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/find-karaoke"
              className="rounded-full bg-fuchsia-400 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-fuchsia-950/40 transition hover:-translate-y-0.5 hover:bg-fuchsia-300"
            >
              Find Karaoke
            </Link>
            <Link
              href="/submit-listing"
              className="rounded-full border border-cyan-300/60 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
            >
              Submit a Lead
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <h2 className="text-xl font-black text-white">{step.title}</h2>
            <p className="mt-3 leading-7 text-slate-300">{step.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-3xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-6 md:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-fuchsia-200">
          What Scout looks for
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {signals.map((signal) => (
            <span
              key={signal}
              className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-bold text-slate-100"
            >
              {signal}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-3xl font-black text-white">Built for city-by-city karaoke discovery.</h2>
        <p className="mt-4 leading-8 text-slate-300">
          San Diego is the starting point. The larger goal is a repeatable engine that
          can digest a city&apos;s karaoke footprint, surface the best leads, and help
          SingHUB become the place people check before they go sing.
        </p>
      </section>
    </main>
  );
}
