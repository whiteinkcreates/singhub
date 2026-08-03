import Link from "next/link";
import { Button } from "@/components/ui/Button";

const PREMIUM_DEMO_IMAGE_URL =
  "https://res.cloudinary.com/dy3lyejkk/image/upload/v1781683694/ChatGPT_Image_Jun_17_2026_01_05_26_AM_sjmyq4.png";

export const metadata = {
  title: "Founding Venue Program | SingHUB",
  description:
    "Help more San Diego karaoke singers discover your venue with a verified, enhanced SingHUB presence and focused promotional support.",
};

const outcomes = [
  {
    label: "Get discovered",
    title: "Show up when singers are deciding where to go",
    body: "SingHUB is built around karaoke intent. People search by night, neighborhood, venue, and host instead of digging through scattered posts and outdated calendars.",
  },
  {
    label: "Look worth the trip",
    title: "Give your karaoke night a stronger first impression",
    body: "An enhanced profile helps singers understand the room, schedule, host, vibe, parking, specials, and what makes your night worth choosing.",
  },
  {
    label: "Stay accurate",
    title: "Make schedule changes easier to trust",
    body: "Founding venues receive priority update support so singers are not making decisions from stale information that sends them somewhere else.",
  },
];

const pilotFeatures = [
  "Verified and enhanced venue profile",
  "Accurate karaoke schedule management",
  "Premium finder card and stronger visual presentation",
  "Venue story, vibe, host, parking, food, drink, and specials details",
  "Priority placement eligibility in relevant discovery surfaces",
  "Inclusion in SingHUB venue, neighborhood, and karaoke roundups",
  "One dedicated venue or karaoke-night spotlight during the pilot",
  "Direct support for listing changes and corrections",
  "Basic reporting on profile views, outbound clicks, and engagement where available",
  "Founding venue input into future venue tools and reporting",
];

const comparisonRows = [
  ["Karaoke finder listing", "Included", "Included"],
  ["Public venue profile", "Standard", "Enhanced"],
  ["Schedule and venue details", "Core information", "Expanded and prioritized"],
  ["Visual presentation", "Standard card", "Premium card and hero treatment"],
  ["Venue story, specials, parking, food and drink", "Limited", "Included"],
  ["Promotional support", "Not included", "Roundups plus spotlight"],
  ["Update support", "Standard review queue", "Priority support"],
  ["Performance reporting", "Not included", "Pilot reporting"],
];

const processSteps = [
  {
    number: "01",
    title: "We review the venue",
    body: "SingHUB confirms your current listing, karaoke schedule, host details, links, and the information singers need before showing up.",
  },
  {
    number: "02",
    title: "We build the upgrade",
    body: "Your profile receives stronger visuals, clearer calls-to-action, richer venue information, and a presentation designed to help singers choose confidently.",
  },
  {
    number: "03",
    title: "We promote and learn",
    body: "During the 90-day pilot, SingHUB supports discovery, tracks available engagement signals, and uses your feedback to improve the venue program.",
  },
];

const faqs = [
  {
    question: "Is SingHUB a general nightlife directory?",
    answer:
      "No. SingHUB is focused specifically on helping people find karaoke. That narrower focus means your venue is being presented to people with a relevant reason to visit.",
  },
  {
    question: "Are results guaranteed?",
    answer:
      "No marketing channel can honestly guarantee attendance. SingHUB provides improved discovery, presentation, promotion, and measurable engagement where available. The pilot is designed to test that value with real venues.",
  },
  {
    question: "What happens after 90 days?",
    answer:
      "We review the available results and your feedback together. You can decide whether continuing makes sense before moving into an ongoing venue plan.",
  },
  {
    question: "Can we update our schedule during the pilot?",
    answer:
      "Yes. Founding venues receive priority support for karaoke schedule changes, host updates, specials, and other relevant listing details.",
  },
];

function FoundingPriceCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-fuchsia-300/50 bg-slate-950/90 shadow-2xl shadow-fuchsia-950/35 ${
        compact ? "p-5" : "p-6 md:p-7"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-red-400" />
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="relative">
        <div className="inline-flex rounded-full border border-fuchsia-300/50 bg-fuchsia-300/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.2em] text-fuchsia-100">
          Founding Venue Pilot
        </div>
        <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-2">
          <span className="text-5xl font-black leading-none text-white drop-shadow-[0_0_22px_rgba(217,70,239,0.55)]">
            $149
          </span>
          <span className="pb-1 text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
            for 90 days
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          A focused, discounted test for venues ready to improve how their karaoke night is found and presented.
        </p>
        <div className="mt-5 border-t border-white/10 pt-4 text-sm font-semibold text-slate-200">
          Approximately $50 per month. No long-term commitment required to test the pilot.
        </div>
      </div>
    </div>
  );
}

function PremiumProfilePreview() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/50 bg-slate-950 shadow-2xl shadow-fuchsia-950/40">
      <div
        className="absolute inset-x-0 top-0 h-56 bg-cover bg-center opacity-90"
        style={{ backgroundImage: `url('${PREMIUM_DEMO_IMAGE_URL}')` }}
      />
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/15" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.22),transparent_17rem),radial-gradient(circle_at_12%_35%,rgba(217,70,239,0.22),transparent_18rem)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-red-400" />

      <div className="relative p-5 pt-36 sm:p-6 sm:pt-40">
        <div className="inline-flex rounded-full border border-fuchsia-300/50 bg-fuchsia-300/15 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-fuchsia-100">
          Founding Venue Profile
        </div>
        <h3 className="mt-4 text-3xl font-black text-white">Your karaoke night, presented properly</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-cyan-100">
          Schedule • Host • Vibe • Specials • Parking • Directions
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-200">Discovery</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Built to appear where singers are already searching by night, neighborhood, venue, and host.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Decision support</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Give people enough useful information to choose your room instead of guessing.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-red-300/25 bg-red-400/10 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-200">The simple idea</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-white">
            You already invest in creating a karaoke night. Being found should be part of the plan.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PremiumVenuePage() {
  return (
    <main className="overflow-x-hidden">
      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:py-8">
        <div className="relative overflow-hidden rounded-[1.25rem] border border-fuchsia-300/40 bg-slate-950 shadow-2xl shadow-fuchsia-950/30 sm:rounded-[1.75rem] md:rounded-[2.25rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.18),transparent_22rem),radial-gradient(circle_at_12%_30%,rgba(217,70,239,0.2),transparent_24rem),linear-gradient(140deg,rgba(2,6,23,0.98),rgba(15,23,42,0.9))]" />
          <div className="absolute -right-20 top-4 h-48 w-48 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-red-400" />

          <div className="relative grid gap-8 px-4 py-7 sm:px-6 md:px-10 md:py-12 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center lg:px-12">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.2em] text-cyan-100 sm:text-xs">
                Founding Venue Program • San Diego
              </div>
              <h1 className="mt-5 text-4xl font-black leading-[1.02] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Your karaoke night deserves to be found.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg md:leading-8">
                SingHUB helps people discover karaoke by night, neighborhood, venue, and host. The Founding Venue Pilot gives your business a stronger presence where local singers are already deciding where to go.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button href="/claim-listing?premium=true" className="w-full sm:w-auto">
                  Request a Founding Venue Review
                </Button>
                <Button href="/find-karaoke" variant="secondary" className="w-full sm:w-auto">
                  See the Karaoke Finder
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-slate-100 sm:text-sm">
                {["90-day pilot", "Hands-on setup", "Priority updates", "No long-term commitment"].map((item) => (
                  <span key={item} className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-2">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <FoundingPriceCard compact />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-red-300">A better discovery channel</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
            Karaoke promotion should not disappear after one social post.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
            Social media helps announce a night. SingHUB is designed to help people find it when they are actively looking for somewhere to sing.
          </p>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {outcomes.map((outcome) => (
            <article key={outcome.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">{outcome.label}</p>
              <h3 className="mt-3 text-2xl font-black text-white">{outcome.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{outcome.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-fuchsia-300">What is included</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">A real venue marketing pilot, not a prettier directory badge.</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
              The founding offer combines better presentation, better information, promotional support, and direct access while SingHUB develops the venue program with a limited group of local partners.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {pilotFeatures.map((feature) => (
                <div key={feature} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/65 p-4 text-sm leading-6 text-slate-100">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-300 to-cyan-300 text-xs font-black text-slate-950">
                    ✓
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <PremiumProfilePreview />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-slate-950/80 shadow-2xl shadow-cyan-950/20">
          <div className="border-b border-white/10 p-6 md:p-8">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">Basic vs. Founding Venue</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">Being listed is useful. Being positioned is better.</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs font-black uppercase tracking-[0.16em] text-slate-300">
                <tr>
                  <th className="px-6 py-4">Capability</th>
                  <th className="px-6 py-4">Basic listing</th>
                  <th className="px-6 py-4 text-fuchsia-200">Founding venue</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([label, basic, founding]) => (
                  <tr key={label} className="border-b border-white/10 last:border-0">
                    <td className="px-6 py-4 font-bold text-white">{label}</td>
                    <td className="px-6 py-4 text-slate-400">{basic}</td>
                    <td className="px-6 py-4 font-semibold text-cyan-100">{founding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-300">How the pilot works</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">Simple enough to start. Structured enough to evaluate.</h2>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {processSteps.map((step) => (
            <article key={step.number} className="rounded-[1.75rem] border border-yellow-300/20 bg-yellow-300/[0.05] p-6">
              <p className="text-4xl font-black text-yellow-200/60">{step.number}</p>
              <h3 className="mt-4 text-2xl font-black text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-8 rounded-[2rem] border border-fuchsia-300/40 bg-slate-950 p-6 shadow-2xl shadow-fuchsia-950/35 md:p-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-fuchsia-300">Why founding venues</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">Real enough to create value. Early enough for your feedback to matter.</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
              SingHUB is live and receiving positive feedback from the local karaoke community. The platform is still early, which is exactly why the first venue partners receive hands-on support, discounted pilot pricing, and a direct voice in what gets built next.
            </p>
            <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-white">
              You already invest in the host, equipment, staff, and experience. Helping people find the night should be a given.
            </p>
          </div>
          <FoundingPriceCard compact />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">Questions owners ask</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">Straight answers before you commit.</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-lg font-black text-white">{faq.question}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/50 bg-slate-950 px-6 py-10 text-center shadow-2xl shadow-fuchsia-950/40 md:px-10 md:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,70,239,0.24),transparent_28rem),radial-gradient(circle_at_85%_80%,rgba(34,211,238,0.16),transparent_24rem)]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-red-400" />
          <div className="relative mx-auto max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-fuchsia-300">Founding venue applications are open</p>
            <h2 className="mt-4 text-4xl font-black text-white md:text-6xl">Make your karaoke night easier to choose.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Request a review of your current SingHUB presence. We will confirm fit, walk through the pilot, and identify the strongest way to present your venue.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/claim-listing?premium=true" className="w-full sm:w-auto">
                Request a Founding Venue Review
              </Button>
              <Link
                href="/find-karaoke"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:border-cyan-300/60 hover:text-cyan-100 sm:w-auto"
              >
                Explore SingHUB
              </Link>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              90 days • $149 • Limited San Diego founding group
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
