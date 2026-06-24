import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { getVenueListings } from "@/lib/venueData";
import type { VenueListing } from "@/types";

export const metadata: Metadata = {
  title: "Karaoke Near Me | Find Karaoke Bars & Live Nights Tonight | SingHUB",
  description:
    "Find karaoke near you tonight. Search San Diego karaoke bars, private karaoke rooms, live nights, featured venues, neighborhoods, and day-by-day karaoke schedules.",
  alternates: {
    canonical: "/karaoke-near-me",
  },
  openGraph: {
    title: "Karaoke Near Me | SingHUB",
    description:
      "Find karaoke bars, private rooms, and live karaoke nights near you tonight, starting in San Diego.",
    url: "https://singhub.app/karaoke-near-me",
    siteName: "SingHUB",
    type: "website",
  },
};

const premiumVenueIds = ["venue-0006", "venue-0045", "venue-0010"];
const spotlightVenueIds = [
  "venue-0048",
  "venue-0043",
  "venue-0044",
  "venue-0064",
  "venue-0063",
];

const dayLinks = [
  { label: "Mon", href: "/karaoke/monday" },
  { label: "Tue", href: "/karaoke/tuesday" },
  { label: "Wed", href: "/karaoke/wednesday" },
  { label: "Thu", href: "/karaoke/thursday" },
  { label: "Fri", href: "/karaoke/friday" },
  { label: "Sat", href: "/karaoke/saturday" },
  { label: "Sun", href: "/karaoke/sunday" },
];

const neighborhoodLinks = [
  { label: "Gaslamp", href: "/neighborhoods/gaslamp" },
  { label: "North Park", href: "/neighborhoods/north-park" },
  { label: "Pacific Beach", href: "/neighborhoods/pacific-beach" },
  { label: "Hillcrest", href: "/neighborhoods/hillcrest" },
  { label: "Ocean Beach", href: "/neighborhoods/ocean-beach" },
  { label: "La Mesa", href: "/neighborhoods/east-county-la-mesa" },
];

function getVenueById(venues: VenueListing[], id: string) {
  return venues.find((venue) => venue.id === id);
}

function isUsable(value: string | undefined) {
  return Boolean(value && value.trim() && value.trim().toLowerCase() !== "tbd");
}

function getDisplayName(venue: VenueListing) {
  const canonicalNames: Record<string, string> = {
    "venue-0006": "JT's Tavern",
    "venue-0010": "The Regal",
    "venue-0043": "Carriage House Cocktails & Karaoke",
    "venue-0044": "The Hole in the Wall",
    "venue-0045": "Pal Joey's Cocktail Lounge",
    "venue-0048": "Hive Karaoke",
    "venue-0063": "The Cordova Bar",
    "venue-0064": "Spot KTV & Restaurant",
  };

  return canonicalNames[venue.id] ?? venue.venueName;
}

function getVenueHref(venue: VenueListing) {
  return `/venues/${venue.slug}`;
}

function getSchedule(venue: VenueListing) {
  if (!isUsable(venue.karaokeDay)) {
    return "Schedule being confirmed";
  }

  if (!isUsable(venue.startTime) || !isUsable(venue.endTime)) {
    return venue.karaokeDay;
  }

  return `${venue.karaokeDay} • ${venue.startTime} to ${venue.endTime}`;
}

function VenueMiniCard({ venue, premium = false }: { venue: VenueListing; premium?: boolean }) {
  const name = getDisplayName(venue);
  const tags = venue.vibeTags.slice(0, 3);

  return (
    <Link
      href={getVenueHref(venue)}
      className={`group relative flex min-h-[17rem] flex-col justify-between overflow-hidden rounded-[1.75rem] border p-4 shadow-2xl transition hover:-translate-y-1 sm:p-5 ${
        premium
          ? "border-amber-300/70 bg-amber-300/10 shadow-amber-950/30"
          : "border-white/10 bg-white/[0.045] shadow-black/30 hover:border-cyan-300/50"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_10%,rgba(217,70,239,0.28),transparent_14rem),radial-gradient(circle_at_90%_0%,rgba(34,211,238,0.22),transparent_12rem)]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-900/20 to-transparent" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] ${
              premium
                ? "border-amber-300/70 bg-amber-300/15 text-amber-100"
                : "border-fuchsia-300/50 bg-fuchsia-300/10 text-fuchsia-100"
            }`}
          >
            {premium ? "Premium" : "Featured"}
          </span>
          <span className="text-lg">{premium ? "♛" : "✦"}</span>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/80">
          {venue.neighborhood || "San Diego"}
        </p>
        <h3 className="mt-2 text-2xl font-black leading-tight text-white group-hover:text-fuchsia-100">
          {name}
        </h3>
        <p className="mt-3 text-sm font-semibold leading-5 text-cyan-100">
          {getSchedule(venue)}
        </p>
      </div>

      <div className="relative mt-6">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-1 text-xs font-semibold text-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm font-bold text-fuchsia-100">View listing →</p>
      </div>
    </Link>
  );
}

function BrowsePanel({
  title,
  intro,
  links,
}: {
  title: string;
  intro: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 sm:p-6">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{intro}</p>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full border border-cyan-300/25 bg-slate-950/60 px-4 py-3 text-sm font-bold text-cyan-100 transition hover:border-fuchsia-300/60 hover:text-fuchsia-100"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function KaraokeNearMePage() {
  const venues = getVenueListings();
  const premiumVenues = premiumVenueIds
    .map((id) => getVenueById(venues, id))
    .filter((venue): venue is VenueListing => Boolean(venue));
  const spotlightVenues = spotlightVenueIds
    .map((id) => getVenueById(venues, id))
    .filter((venue): venue is VenueListing => Boolean(venue));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Karaoke Near Me",
    url: "https://singhub.app/karaoke-near-me",
    description:
      "Find karaoke bars, private rooms, and live karaoke nights near you tonight, starting in San Diego.",
    isPartOf: {
      "@type": "WebSite",
      name: "SingHUB",
      url: "https://singhub.app",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [...premiumVenues, ...spotlightVenues].map((venue, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: getDisplayName(venue),
        url: `https://singhub.app${getVenueHref(venue)}`,
      })),
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:py-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/40 bg-slate-950 shadow-2xl shadow-fuchsia-950/40 md:rounded-[2.5rem]">
          <div
            className="absolute inset-0 bg-cover bg-[62%_center] opacity-75 md:opacity-90"
            style={{ backgroundImage: "url('/images/hero/karaoke-near-me-neon.svg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/60 to-slate-950 md:bg-gradient-to-r md:from-slate-950 md:via-slate-950/82 md:to-slate-950/18" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(217,70,239,0.25),transparent_22rem),radial-gradient(circle_at_80%_12%,rgba(34,211,238,0.14),transparent_24rem)]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300" />

          <div className="relative min-h-[42rem] px-4 py-6 sm:px-6 md:min-h-[39rem] md:px-10 md:py-12 lg:px-14">
            <div className="flex max-w-2xl flex-col justify-end pt-36 sm:pt-44 md:min-h-[34rem] md:justify-center md:pt-0">
              <p className="mb-3 w-fit rounded-full border border-cyan-300/30 bg-slate-950/55 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100 backdrop-blur">
                SingHUB Local Karaoke Finder
              </p>
              <h1 className="text-[4.3rem] font-black leading-[0.86] tracking-tight text-white drop-shadow-2xl sm:text-8xl md:text-9xl">
                Karaoke
                <span className="block bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                  Near Me
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-100 sm:text-lg">
                Find karaoke bars, private rooms, and live karaoke nights near you tonight. Start with San Diego, then pick the room that matches the mood.
              </p>

              <form action="/find-karaoke" className="mt-6 rounded-[1.35rem] border border-cyan-300/40 bg-slate-950/75 p-2 shadow-[0_0_34px_rgba(34,211,238,0.18)] backdrop-blur sm:flex sm:items-center sm:gap-2">
                <label className="sr-only" htmlFor="karaoke-location-search">
                  Search by city, neighborhood, venue, or zip code
                </label>
                <div className="flex min-h-14 flex-1 items-center gap-3 px-3">
                  <span className="text-2xl text-cyan-200">⌖</span>
                  <input
                    id="karaoke-location-search"
                    name="q"
                    type="search"
                    placeholder="City, neighborhood, venue, or zip code"
                    className="w-full bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-4 text-sm font-black text-white shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110 sm:mt-0 sm:w-auto"
                >
                  Use My Location
                </button>
              </form>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button href="/find-karaoke?day=tonight" className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-4 text-base">
                  Find Karaoke Tonight
                </Button>
                <Button href="/san-diego-karaoke" variant="secondary" className="w-full py-4 text-base">
                  Browse San Diego
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-200 sm:text-left">
                <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 backdrop-blur">
                  <p className="text-lg">✓</p>
                  <p className="mt-1 text-cyan-100">Verified listings</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 backdrop-blur">
                  <p className="text-lg">🎤</p>
                  <p className="mt-1 text-fuchsia-100">Live nights</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 backdrop-blur">
                  <p className="text-lg">◉</p>
                  <p className="mt-1 text-cyan-100">Private rooms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-fuchsia-300">Featured venues</p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">Premium karaoke spots</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Premium placements get extra visibility on high-intent karaoke searches. Start here when you want the room to feel ready.
            </p>
          </div>
          <Button href="/venues/premium" variant="ghost">Premium for venues</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {premiumVenues.map((venue) => (
            <VenueMiniCard key={venue.id} venue={venue} premium />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">Karaoke near you</p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">Popular San Diego karaoke listings</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Canonical venue names from the working San Diego venue sheet, cleaned up for the public search page.
            </p>
          </div>
          <Button href="/find-karaoke" variant="secondary">View all venues</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {spotlightVenues.map((venue) => (
            <VenueMiniCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 lg:grid-cols-2">
        <BrowsePanel
          title="Browse by day"
          intro="Karaoke is a weekly habit. Pick the night first, then find the venue that fits."
          links={dayLinks}
        />
        <BrowsePanel
          title="Browse by neighborhood"
          intro="Search the areas people actually use when making plans: beach bars, downtown chaos, East County locals, and more."
          links={neighborhoodLinks}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8">
        <div className="grid gap-4 rounded-[2rem] border border-cyan-300/35 bg-slate-950 p-5 shadow-2xl shadow-cyan-950/25 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
          {[
            ["100% useful first", "Pages are built around real karaoke searches, not random nightlife filler."],
            ["Updated nightly", "The goal is fresh local karaoke data singers can actually use before leaving."],
            ["Private rooms included", "KTV and bookable rooms sit beside live bar karaoke instead of hiding in a separate universe."],
            ["Built for venues", "Premium listings create a paid lane without locking singers out of the finder."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-base font-black text-white">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
