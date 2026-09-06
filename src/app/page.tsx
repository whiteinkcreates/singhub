import type { Metadata } from "next";
import Link from "next/link";
import { KaraokeForecastCard } from "@/components/home/KaraokeForecastCard";
import { PollOfTheDay } from "@/components/home/PollOfTheDay";
import { HostDirectoryCard } from "@/components/host/HostCard";
import { Button } from "@/components/ui/Button";
import { VenueCard } from "@/components/venue/VenueCard";
import { getKaraokeEventsHostingToday } from "@/lib/eventData";
import { getFeaturedHosts } from "@/lib/hostData";
import { buildKaraokeForecast } from "@/lib/homepageForecast";
import { getSanDiegoPublicVenues, getSanDiegoRegionHosts } from "@/lib/sanDiegoMarket";
import { getFeaturedVenueListings, getVenueListings } from "@/lib/venueData";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdC5G3JP5JSLrj5Za1S-ueRvSKVPr_l_OuBk0Ru6RZmXi5lOQ/viewform?usp=header";
const HERO_IMAGE_URL =
  "https://res.cloudinary.com/dy3lyejkk/image/upload/v1786839114/file_00000000bc6081fd9e63561226afdd01_kldtkz.png";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const searchLinks = [
  { href: "/find-karaoke?day=tonight", label: "Tonight" },
  { href: "/neighborhoods", label: "Neighborhood" },
  { href: "/places", label: "Venue" },
  { href: "/hosts", label: "Host" },
  { href: "/find-karaoke?type=live", label: "Live Band" },
  { href: "/find-karaoke?type=private-room", label: "Private Rooms" },
];

const actionCards = [
  {
    href: "/find-karaoke?day=tonight",
    eyebrow: "RIGHT NOW",
    title: "Tonight",
    helper: "See every verified karaoke option happening around San Diego tonight.",
    classes: "border-fuchsia-300/30 bg-[linear-gradient(145deg,rgba(134,25,143,.28),rgba(15,23,42,.42))]",
  },
  {
    href: "/places",
    eyebrow: "VENUE INDEX",
    title: "SingHUB Radar",
    helper: "Browse local rooms, bars, stages, and private karaoke spots worth knowing.",
    classes: "border-violet-300/30 bg-[linear-gradient(145deg,rgba(91,33,182,.26),rgba(15,23,42,.42))]",
  },
  {
    href: "/neighborhoods",
    eyebrow: "BY AREA",
    title: "Neighborhoods",
    helper: "Start with the part of town you are already in and find the nearest mic.",
    classes: "border-cyan-300/25 bg-[linear-gradient(145deg,rgba(8,145,178,.22),rgba(15,23,42,.42))]",
  },
  {
    href: "/hosts",
    eyebrow: "WHO RUNS THE ROOM",
    title: "KJs & Hosts",
    helper: "Follow the people and crews who make your favorite karaoke nights work.",
    classes: "border-pink-300/25 bg-[linear-gradient(145deg,rgba(190,24,93,.2),rgba(15,23,42,.42))]",
  },
];

export default async function Home() {
  const [venueListings, featuredVenueListings, featuredHostListings, todaysEvents] = await Promise.all([
    getVenueListings(),
    getFeaturedVenueListings(),
    getFeaturedHosts(),
    getKaraokeEventsHostingToday(),
  ]);

  const publicVenues = getSanDiegoPublicVenues(venueListings);
  const featuredVenues = getSanDiegoPublicVenues(featuredVenueListings);
  const featuredHosts = getSanDiegoRegionHosts(featuredHostListings, publicVenues);
  const featuredHost = featuredHosts[0];
  const forecast = buildKaraokeForecast(todaysEvents, publicVenues);

  return (
    <main className="overflow-x-hidden bg-slate-950">
      <section className="mx-auto max-w-7xl px-3 pb-5 pt-4 sm:px-4 md:pb-7 md:pt-7">
        <div className="relative min-h-[34rem] overflow-hidden rounded-[1.5rem] border border-fuchsia-300/30 bg-slate-950 shadow-[0_32px_100px_rgba(2,6,23,.58)] sm:rounded-[2rem] md:min-h-[39rem] md:rounded-[2.6rem]">
          <div
            className="absolute inset-0 bg-cover bg-[position:58%_center] sm:bg-center"
            style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,.93)_0%,rgba(2,6,23,.72)_37%,rgba(2,6,23,.3)_64%,rgba(2,6,23,.08)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/10" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-violet-400" />
          <div className="absolute -left-28 top-16 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative flex min-h-[34rem] items-end px-5 py-8 sm:px-8 md:min-h-[39rem] md:items-center md:px-12 md:py-14 lg:px-16">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-cyan-300/30 bg-slate-950/55 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.22em] text-cyan-100 backdrop-blur sm:text-xs">
                Real people. Real stages. A louder San Diego.
              </p>

              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.93] tracking-[-0.04em] text-white drop-shadow-[0_4px_22px_rgba(2,6,23,.65)] sm:text-6xl md:text-7xl lg:text-8xl">
                Find Karaoke Tonight
                <span className="block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-cyan-200 bg-clip-text text-transparent">
                  in San Diego.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-200 sm:text-lg md:text-xl md:leading-8">
                Search by night, neighborhood, venue, or host and see where San Diego is singing tonight.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button href="/find-karaoke?day=tonight" className="w-full sm:w-auto">
                  Find Karaoke Tonight
                </Button>
                <Button href="/places" variant="secondary" className="w-full sm:w-auto">
                  Explore the Venue Index
                </Button>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                {searchLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="rounded-full border border-white/15 bg-slate-950/48 px-3 py-2 text-xs font-bold text-slate-100 backdrop-blur transition hover:border-cyan-300/50 hover:bg-cyan-300/[0.08] hover:text-cyan-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,.07),transparent_28rem),radial-gradient(circle_at_85%_70%,rgba(217,70,239,.08),transparent_30rem)]" />
        <div className="relative mx-auto max-w-7xl space-y-5 px-3 pb-8 sm:px-4 md:space-y-6 md:pb-12">
          <KaraokeForecastCard forecast={forecast} />
          <PollOfTheDay />
        </div>
      </section>

      <section className="relative border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-18">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Pick your path</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Know what kind of night you want?</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
              Go straight to tonight, browse the Venue Index, hunt by neighborhood, or follow the host who runs the room right.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {actionCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group min-h-56 rounded-3xl border p-5 shadow-xl transition hover:-translate-y-1 hover:border-white/30 ${card.classes}`}
              >
                <div className="flex h-full flex-col justify-between">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-slate-400">{card.eyebrow}</p>
                  <div className="mt-12">
                    <h3 className="text-2xl font-black text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{card.helper}</p>
                    <p className="mt-5 text-sm font-black text-cyan-200 transition group-hover:translate-x-1">Explore →</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-fuchsia-300/10 bg-[linear-gradient(135deg,rgba(46,16,101,.28),rgba(2,6,23,.96)_48%,rgba(8,47,73,.26))]">
        <div className="absolute -left-28 top-16 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 md:py-20 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-fuchsia-300">Featured KJ</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-5xl">Who’s running the room?</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Meet the local KJs and karaoke crews who shape the rotation, the room, and the night.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/hosts">Browse All Hosts</Button>
              <Button href={FORM_URL} variant="secondary">Get Listed as a KJ</Button>
            </div>
          </div>

          {featuredHost ? (
            <div className="w-full max-w-3xl lg:justify-self-end">
              <HostDirectoryCard host={featuredHost} />
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl md:p-8">
              <h3 className="text-2xl font-black text-white">Know a host who should be featured?</h3>
              <p className="mt-3 text-slate-300">Send us the info and we will review it for SingHUB.</p>
              <div className="mt-5"><Button href={FORM_URL}>Send KJ Info</Button></div>
            </div>
          )}
        </div>
      </section>

      <section className="relative bg-slate-950/80">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">Featured Nights</p>
              <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">A few good places to start.</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                Local karaoke nights worth knowing when you want a recommendation instead of another search box.
              </p>
            </div>
            <Button href="/find-karaoke" variant="secondary">View All Karaoke Nights</Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
