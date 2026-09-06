import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getVenueListings } from "@/lib/venueData";
import type { VenueListing } from "@/types";

export const metadata: Metadata = {
  title: "Karaoke Near Me | Find Karaoke Bars & Live Nights Tonight | SingHUB",
  description:
    "Find karaoke near you tonight. Search San Diego karaoke bars, private karaoke rooms, live nights, neighborhoods, and day-by-day karaoke schedules.",
  alternates: { canonical: "/karaoke-near-me" },
  openGraph: {
    title: "Karaoke Near Me | SingHUB",
    description: "Find karaoke bars, private rooms, and live karaoke nights near you tonight, starting in San Diego.",
    url: "https://singhub.app/karaoke-near-me",
    siteName: "SingHUB",
    type: "website",
  },
};

const popularVenueIds = ["venue-0002", "venue-0073", "venue-0062", "venue-0064"];
const weeklySpotlightVenueId = "venue-0006";

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
  { label: "Gaslamp", href: "/neighborhoods/gaslamp-quarter" },
  { label: "North Park", href: "/neighborhoods/north-park" },
  { label: "Pacific Beach", href: "/neighborhoods/pacific-beach" },
  { label: "Hillcrest", href: "/neighborhoods/hillcrest" },
  { label: "Ocean Beach", href: "/neighborhoods/ocean-beach" },
  { label: "La Mesa / East County", href: "/neighborhoods/la-mesa" },
  { label: "Point Loma", href: "/find-karaoke?q=Point%20Loma" },
  { label: "Bay Park", href: "/find-karaoke?q=Bay%20Park" },
  { label: "Kearny Mesa", href: "/find-karaoke?q=Kearny%20Mesa" },
  { label: "Mission Valley", href: "/find-karaoke?q=Mission%20Valley" },
  { label: "College Area", href: "/find-karaoke?q=College%20Area" },
  { label: "Chula Vista", href: "/find-karaoke?q=Chula%20Vista" },
];

const starterGuideLinks = [
  {
    title: "First time singing karaoke?",
    href: "/guides/first-time-singing-karaoke",
    body: "Pick a song, get through the nerves, and survive your first trip to the mic.",
  },
  {
    title: "Karaoke etiquette basics",
    href: "/guides/karaoke-etiquette-dont-be-that-guy",
    body: "A quick room-read before you become someone else's group chat story.",
  },
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
    "venue-0073": "McGuffie's Live",
  };
  return canonicalNames[venue.id] ?? venue.venueName;
}

function getVenueHref(venue: VenueListing) {
  return `/venues/${venue.slug}`;
}

function getSchedule(venue: VenueListing) {
  if (!isUsable(venue.karaokeDay)) return "Schedule being confirmed";
  if (!isUsable(venue.startTime) || !isUsable(venue.endTime)) return venue.karaokeDay;
  return `${venue.karaokeDay} • ${venue.startTime} to ${venue.endTime}`;
}

function VenueMiniCard({ venue }: { venue: VenueListing }) {
  const name = getDisplayName(venue);
  const tags = venue.vibeTags.slice(0, 3);
  return (
    <Link href={getVenueHref(venue)} className="group relative flex min-h-[15rem] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-cyan-300/50 sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_10%,rgba(217,70,239,0.28),transparent_14rem),radial-gradient(circle_at_90%_0%,rgba(34,211,238,0.22),transparent_12rem)]" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="rounded-full border border-fuchsia-300/50 bg-fuchsia-300/10 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-fuchsia-100">Start here</span>
          <span className="text-lg">🎤</span>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/80">{venue.neighborhood || "San Diego"}</p>
        <h3 className="mt-2 text-2xl font-black leading-tight text-white group-hover:text-fuchsia-100">{name}</h3>
        <p className="mt-3 text-sm font-semibold leading-5 text-cyan-100">{getSchedule(venue)}</p>
      </div>
      <div className="relative mt-6">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-1 text-xs font-semibold text-slate-200">{tag}</span>)}
        </div>
        <p className="mt-4 text-sm font-bold text-fuchsia-100">View listing →</p>
      </div>
    </Link>
  );
}

function WeeklySpotlight({ venue }: { venue: VenueListing }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/40 bg-slate-950 p-5 shadow-2xl shadow-fuchsia-950/30 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(217,70,239,0.24),transparent_22rem),radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.18),transparent_20rem)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-fuchsia-300">Weekly spotlight venue</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">{getDisplayName(venue)}</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
              JT's is a neighborhood karaoke stop with daily late-night singing, games, no cover, and an easy local-bar feel. It is a strong pick when you want karaoke without turning the night into a full production.
            </p>
            <p className="mt-4 text-sm font-semibold text-cyan-100">{venue.neighborhood} • {getSchedule(venue)}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Good for</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              <li>Last-minute karaoke plans</li>
              <li>Regulars and casual singers</li>
              <li>A no-cover neighborhood night</li>
            </ul>
            <Button href={getVenueHref(venue)} className="mt-5 w-full">View spotlight</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrowsePanel({ title, intro, links, showAllHref }: { title: string; intro: string; links: Array<{ label: string; href: string }>; showAllHref?: string }) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{intro}</p>
        </div>
        {showAllHref && <Link href={showAllHref} className="shrink-0 rounded-full border border-fuchsia-300/40 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-fuchsia-100">See all</Link>}
      </div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {links.map((link) => <Link key={link.href} href={link.href} className="shrink-0 rounded-full border border-cyan-300/25 bg-slate-950/60 px-4 py-3 text-sm font-bold text-cyan-100 transition hover:border-fuchsia-300/60 hover:text-fuchsia-100">{link.label}</Link>)}
      </div>
    </section>
  );
}

export default async function KaraokeNearMePage() {
  const venues = getPublicVenues(await getVenueListings());
  const popularVenues = popularVenueIds.map((id) => getVenueById(venues, id)).filter((venue): venue is VenueListing => Boolean(venue));
  const weeklySpotlightVenue = getVenueById(venues, weeklySpotlightVenueId);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Karaoke Near Me",
    url: "https://singhub.app/karaoke-near-me",
    description: "Find karaoke bars, private rooms, and live karaoke nights near you tonight, starting in San Diego.",
    isPartOf: { "@type": "WebSite", name: "SingHUB", url: "https://singhub.app" },
    mainEntity: { "@type": "ItemList", itemListElement: popularVenues.map((venue, index) => ({ "@type": "ListItem", position: index + 1, name: getDisplayName(venue), url: `https://singhub.app${getVenueHref(venue)}` })) },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:py-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/40 bg-slate-950 shadow-2xl shadow-fuchsia-950/40 md:rounded-[2.5rem]">
          <div className="absolute inset-0 bg-no-repeat opacity-40 sm:opacity-50 md:opacity-60 bg-[length:82%] bg-[position:center_1rem] sm:bg-[length:34rem] sm:bg-[position:92%_46%] lg:bg-[length:40rem] lg:bg-[position:88%_50%]" style={{ backgroundImage: "url('/images/hero/karaoke-marker-target.svg')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/62 via-slate-950/84 to-slate-950 md:bg-gradient-to-r md:from-slate-950 md:via-slate-950/88 md:to-slate-950/48" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(217,70,239,0.25),transparent_22rem),radial-gradient(circle_at_80%_12%,rgba(34,211,238,0.14),transparent_24rem)]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300" />
          <div className="relative min-h-[40rem] px-4 py-6 sm:px-6 md:min-h-[37rem] md:px-10 md:py-12 lg:px-14">
            <div className="flex max-w-2xl flex-col justify-center pt-24 sm:pt-32 md:min-h-[32rem] md:pt-0">
              <p className="mb-3 w-fit rounded-full border border-cyan-300/30 bg-slate-950/55 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-cyan-100 backdrop-blur sm:text-xs sm:tracking-[0.18em]">SingHUB Local Karaoke Finder</p>
              <h1 className="text-[4.3rem] font-black leading-[0.86] tracking-tight text-white drop-shadow-2xl sm:text-8xl md:text-9xl">Karaoke<span className="block bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">Near Me</span></h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-100 sm:text-lg">Find karaoke bars, private rooms, and live karaoke nights near you tonight. Start with San Diego, then pick the room that matches the mood.</p>
              <form action="/find-karaoke" className="mt-6 rounded-[1.35rem] border border-cyan-300/40 bg-slate-950/75 p-2 shadow-[0_0_34px_rgba(34,211,238,0.18)] backdrop-blur sm:flex">
                <input name="q" type="search" placeholder="Search venue, neighborhood, vibe, or day" className="min-h-14 w-full rounded-2xl bg-transparent px-4 text-base font-semibold text-white outline-none placeholder:text-slate-400" />
                <Button type="submit" className="mt-2 w-full sm:mt-0 sm:w-auto">Search</Button>
              </form>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <Link href="/find-karaoke" className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-white">Browse listings</Link>
                <Link href="/submit-listing" className="rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-4 py-2 text-fuchsia-100">Add a karaoke night</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {weeklySpotlightVenue && <WeeklySpotlight venue={weeklySpotlightVenue} />}

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-4">
        {popularVenues.map((venue) => <VenueMiniCard key={venue.id} venue={venue} />)}
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 lg:grid-cols-2">
        <BrowsePanel title="Browse karaoke by day" intro="Plans change fast. Pick the day first, then choose the room." links={dayLinks} showAllHref="/find-karaoke" />
        <BrowsePanel title="Browse karaoke by neighborhood" intro="Start close to where you are, then chase the best crowd." links={neighborhoodLinks} showAllHref="/neighborhoods" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-fuchsia-300">Karaoke 101</p>
          <h2 className="mt-3 text-3xl font-black text-white">New to karaoke? Start here.</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {starterGuideLinks.map((guide) => (
              <Link key={guide.href} href={guide.href} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-cyan-300/50">
                <h3 className="text-xl font-black text-white">{guide.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{guide.body}</p>
                <p className="mt-4 text-sm font-bold text-cyan-100">Read guide →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
