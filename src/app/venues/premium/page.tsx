import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "For Venues | SingHUB Premium Profiles",
  description:
    "Compare free SingHUB basic listings with premium venue profiles for San Diego karaoke venues.",
};

const basicFeatures = [
  "Listed in the karaoke finder",
  "Standard venue card",
  "Public venue profile page",
  "Name, address, neighborhood, and schedule",
  "Description and vibe tags",
  "Event schedule section",
  "Trust badge when verified, claimed, or AI-scouted",
  "Website, Instagram, directions, and claim/update links when available",
];

const premiumFeatures = [
  "Premium finder card design",
  "Uploaded banner photo or custom hero image",
  "Dark overlay with key venue info over the banner",
  "Stronger visual calls-to-action",
  "Expanded venue story or featured blurb",
  "Specials and happy hour section",
  "Food and drink highlights",
  "Parking and accessibility notes",
  "Reservation or booking link",
  "Host / KJ spotlight",
  "Featured placement eligibility",
  "Priority update support during launch",
];

const premiumBenefits = [
  {
    eyebrow: "More visibility",
    title: "Stand out before singers scroll past you",
    body: "Premium profiles give your venue a richer visual presence in the finder, so singers can feel the room before they decide where to go.",
  },
  {
    eyebrow: "Better decisions",
    title: "Answer the questions people ask before showing up",
    body: "Schedule, vibe, host, cover, parking, food, drinks, and booking details are presented in one place instead of scattered across posts and reviews.",
  },
  {
    eyebrow: "Launch advantage",
    title: "Get positioned early in the San Diego karaoke map",
    body: "Founding premium venues help shape how SingHUB presents karaoke nights, private rooms, hosts, and community updates as the platform grows.",
  },
];

const profileVisualRows = [
  ["Hero image", "Venue photo, nightlife graphic, or custom SingHUB visual"],
  ["CTA layer", "Directions, booking, website, claim, and schedule actions"],
  ["Story layer", "What makes the karaoke night worth showing up for"],
];

function FeatureList({ features, accent }: { features: string[]; accent: "cyan" | "fuchsia" }) {
  return (
    <ul className="mt-7 space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-100">
          <span
            className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black text-slate-950 ${
              accent === "cyan" ? "bg-cyan-300" : "bg-fuchsia-300"
            }`}
          >
            ✓
          </span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function PremiumProfilePreview() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/50 bg-slate-950 shadow-2xl shadow-fuchsia-950/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(217,70,239,0.38),transparent_18rem),radial-gradient(circle_at_82%_28%,rgba(34,211,238,0.24),transparent_20rem),linear-gradient(135deg,rgba(2,6,23,0.2),rgba(2,6,23,0.96))]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-[linear-gradient(135deg,rgba(217,70,239,0.45),rgba(34,211,238,0.22)),url('/images/hero/san-diego-skyline-vector.svg')] bg-cover bg-center opacity-95" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />

      <div className="relative p-5 pt-28 sm:p-6 sm:pt-32">
        <div className="mb-4 inline-flex rounded-full border border-fuchsia-300/50 bg-fuchsia-300/15 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-fuchsia-100">
          Premium Profile
        </div>
        <h3 className="text-3xl font-black text-white">Your Venue Name</h3>
        <p className="mt-2 text-sm font-semibold text-cyan-100">
          Mission Gorge / Grantville • Daily karaoke • 9pm-1am
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-200">
            Everything in Basic, plus
          </p>
          <div className="mt-4 grid gap-3">
            {profileVisualRows.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-slate-950/55 p-3">
                <p className="text-sm font-black text-white">{label}</p>
                <p className="mt-1 text-sm leading-5 text-slate-300">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/claim-listing?premium=true"
            className="rounded-full bg-gradient-to-r from-fuchsia-300 to-cyan-300 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-lg shadow-fuchsia-950/40 transition hover:scale-[1.02]"
          >
            Upgrade profile
          </Link>
          <Link
            href="/find-karaoke"
            className="rounded-full border border-white/15 bg-slate-950/60 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-slate-100 transition hover:border-cyan-300/60 hover:text-cyan-100"
          >
            See finder
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PremiumVenuePage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_26rem] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
              For Venues
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
              Get found by singers already looking for their next karaoke night.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              SingHUB gives karaoke venues a cleaner way to show up in local search,
              explain the vibe, and turn curious singers into people walking through
              the door. Start with a free basic listing, or upgrade to a premium
              profile built for more visibility.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/claim-listing?premium=true">Start Premium Profile</Button>
              <Button href="/claim-listing" variant="secondary">
                Claim Basic Listing
              </Button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Launch pricing and payment links are being finalized. Early premium
              venues can request placement now and lock in founding venue priority.
            </p>
          </div>

          <PremiumProfilePreview />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-fuchsia-300">
            Profile Options
          </p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
            Basic listing or premium profile?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Basic helps people find you. Premium helps people choose you.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-cyan-300/25 bg-slate-950/70 p-6 shadow-xl shadow-cyan-950/20 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">
                  Basic Profile
                </p>
                <h3 className="mt-3 text-3xl font-black text-white">Free listing</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Good for getting indexed quickly in the karaoke finder.
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-2xl shadow-lg shadow-cyan-950/30">
                🏪
              </div>
            </div>
            <FeatureList features={basicFeatures} accent="cyan" />
          </article>

          <article className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/50 bg-slate-950 p-6 shadow-2xl shadow-fuchsia-950/40 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_5%,rgba(217,70,239,0.28),transparent_18rem),radial-gradient(circle_at_90%_15%,rgba(34,211,238,0.18),transparent_18rem)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-fuchsia-300">
                    Premium Profile
                  </p>
                  <h3 className="mt-3 text-3xl font-black text-white">Monthly upgrade</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Best for venues that want more visibility, better presentation,
                    and stronger calls-to-action.
                  </p>
                </div>
                <div className="rounded-2xl border border-fuchsia-300/40 bg-fuchsia-300/15 px-4 py-3 text-2xl shadow-lg shadow-fuchsia-950/40">
                  💎
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-fuchsia-400 to-cyan-400 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950">
                Everything in Basic, plus
              </div>
              <FeatureList features={premiumFeatures} accent="fuchsia" />
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {premiumBenefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20"
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                {benefit.eyebrow}
              </p>
              <h3 className="mt-3 text-2xl font-black text-white">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{benefit.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="overflow-hidden rounded-[2rem] border border-fuchsia-300/40 bg-slate-950 shadow-2xl shadow-fuchsia-950/40">
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-fuchsia-300">
                Founding Venue Offer
              </p>
              <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
                Want your karaoke night to look premium from launch?
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                Request a premium profile now. We will confirm your venue details,
                collect the best hero image or create a SingHUB-style visual, and
                prepare the profile for monthly billing once payments go live.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Button href="/claim-listing?premium=true">Request Premium</Button>
              <Button href="/submit-listing" variant="secondary">
                Submit a Venue
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
