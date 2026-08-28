import Link from "next/link";
import { HostDirectoryCard } from "@/components/host/HostCard";
import { Button } from "@/components/ui/Button";
import { VenueCard } from "@/components/venue/VenueCard";
import { getFeaturedHosts } from "@/lib/hostData";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getSanDiegoRegionHosts } from "@/lib/sanDiegoMarket";
import { getFeaturedVenueListings, getVenueListings } from "@/lib/venueData";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdC5G3JP5JSLrj5Za1S-ueRvSKVPr_l_OuBk0Ru6RZmXi5lOQ/viewform?usp=header";
const HERO_IMAGE_URL =
  "https://res.cloudinary.com/dy3lyejkk/image/upload/v1786839114/file_00000000bc6081fd9e63561226afdd01_kldtkz.png";

const onboardingTickerItems = [
  "Welcome to SingHUB. Let's get started.",
  "Choose Tonight to see current San Diego karaoke options.",
  "Search by night, neighborhood, venue, or host.",
  "Use SingHUB Radar to explore karaoke venues across San Diego.",
  "See a schedule change? Send it to SingHUB and help keep San Diego accurate.",
];

const actionCards = [
  {
    href: "/find-karaoke?day=tonight",
    icon: "TN",
    label: "Tonight",
    helper: "See what is happening tonight.",
    tone: "coral",
  },
  {
    href: "/places",
    icon: "RD",
    label: "SingHUB Radar",
    helper: "Explore karaoke venues across San Diego.",
    tone: "violet",
  },
  {
    href: "/neighborhoods",
    icon: "NB",
    label: "Neighborhoods",
    helper: "Explore karaoke near you.",
    tone: "gold",
  },
  {
    href: "/hosts",
    icon: "KJ",
    label: "Hosts",
    helper: "Find your favorite KJs.",
    tone: "fuchsia",
  },
  {
    href: "/find-karaoke?type=live",
    icon: "LV",
    label: "Live Karaoke",
    helper: "Find bars and venues with hosted karaoke nights.",
    tone: "coral",
  },
  {
    href: "/find-karaoke?type=private-room",
    icon: "PR",
    label: "Private Rooms",
    helper: "Find karaoke rooms for your crew.",
    tone: "cyan",
  },
];

function getActionCardClasses(tone: string) {
  if (tone === "coral") {
    return {
      card: "border-red-300/45 bg-red-400/10 shadow-red-950/20 hover:border-red-200/80 hover:bg-red-400/15",
      icon: "border-red-300/55 bg-red-400/15 text-red-100 shadow-[0_0_18px_rgba(248,113,113,0.2)]",
      title: "group-hover:text-red-100",
    };
  }

  if (tone === "gold") {
    return {
      card: "border-yellow-300/45 bg-yellow-300/10 shadow-yellow-950/20 hover:border-yellow-200/80 hover:bg-yellow-300/15",
      icon: "border-yellow-300/55 bg-yellow-300/15 text-yellow-100 shadow-[0_0_18px_rgba(253,224,71,0.18)]",
      title: "group-hover:text-yellow-100",
    };
  }

  if (tone === "cyan") {
    return {
      card: "border-cyan-300/45 bg-cyan-300/10 shadow-cyan-950/20 hover:border-cyan-200/80 hover:bg-cyan-300/15",
      icon: "border-cyan-300/55 bg-cyan-300/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.2)]",
      title: "group-hover:text-cyan-100",
    };
  }

  if (tone === "violet") {
    return {
      card: "border-violet-300/45 bg-violet-300/10 shadow-violet-950/20 hover:border-violet-200/80 hover:bg-violet-300/15",
      icon: "border-violet-300/55 bg-violet-300/15 text-violet-100 shadow-[0_0_18px_rgba(167,139,250,0.2)]",
      title: "group-hover:text-violet-100",
    };
  }

  return {
    card: "border-fuchsia-300/45 bg-fuchsia-300/10 shadow-fuchsia-950/20 hover:border-fuchsia-200/80 hover:bg-fuchsia-300/15",
    icon: "border-fuchsia-300/55 bg-fuchsia-300/15 text-fuchsia-100 shadow-[0_0_18px_rgba(217,70,239,0.2)]",
    title: "group-hover:text-fuchsia-100",
  };
}

function KaraokeTicker({ items, label = "Welcome to SingHUB" }: { items: string[]; label?: string }) {
  const tickerItems = [...items, ...items, ...items];

  return (
    <div className="mt-5 max-w-full overflow-hidden rounded-2xl border border-fuchsia-300/35 bg-slate-950/75 shadow-lg shadow-fuchsia-950/30 backdrop-blur md:mt-7">
      <div className="flex items-center border-b border-white/10 px-4 py-2 text-[0.65rem] font-black uppercase tracking-[0.2em] text-red-200 sm:text-xs">
        {label}
      </div>
      <div className="flex min-w-max animate-[marquee_34s_linear_infinite] gap-8 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-cyan-100 hover:[animation-play-state:paused] md:text-sm md:tracking-[0.18em]">
        {tickerItems.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-8 whitespace-nowrap">
            <span>{item}</span>
            <span className="text-fuchsia-300">*</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

export default async function Home() {
  const [venueListings, featuredVenueListings, featuredHostListings] = await Promise.all([
    getVenueListings(),
    getFeaturedVenueListings(),
    getFeaturedHosts(),
  ]);
  const publicVenues = getPublicVenues(venueListings);
  const featuredVenues = getPublicVenues(featuredVenueListings);
  const featuredHosts = getSanDiegoRegionHosts(featuredHostListings, publicVenues);
  const featuredHost = featuredHosts[0];

  return (
    <main className="overflow-x-hidden">
      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:py-8">
        <div className="relative max-w-full overflow-hidden rounded-[1.15rem] border border-fuchsia-300/40 bg-slate-950 shadow-2xl shadow-fuchsia-950/30 sm:rounded-[1.75rem] md:rounded-[2.25rem]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-85 sm:opacity-100"
            style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/35 to-slate-950/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/10" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,transparent,rgba(34,211,238,0.08),rgba(2,6,23,0.96))] sm:h-32" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-red-400" />

          <div className="relative min-w-0 px-4 py-7 sm:px-6 sm:py-9 md:px-10 md:py-12 lg:px-14 lg:py-16">
            <div className="min-w-0 max-w-3xl">
              <p className="max-w-full text-[0.68rem] font-black uppercase tracking-[0.16em] text-cyan-200 sm:text-xs sm:tracking-[0.28em]">
                San Diego Karaoke Starts Here
              </p>

              <h1 className="mt-4 max-w-full text-3xl font-black leading-[1.02] text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.18)] min-[380px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                Find karaoke in San Diego.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base sm:leading-7 md:mt-5 md:text-lg md:leading-8">
                Search by night, neighborhood, venue, or host and see where to sing tonight.
              </p>

              <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3">
                <Button href="/find-karaoke?day=tonight" className="w-full sm:w-auto">
                  Find Karaoke Tonight
                </Button>
                <Button href="/hosts" variant="secondary" className="w-full sm:w-auto">
                  Find a Karaoke Host
                </Button>
              </div>

              <KaraokeTicker items={onboardingTickerItems} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 md:pb-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {actionCards.map((card) => {
            const classes = getActionCardClasses(card.tone);
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group flex min-h-32 items-center gap-4 rounded-2xl border p-4 shadow-lg transition hover:-translate-y-1 hover:bg-slate-950 xl:flex-col xl:items-start ${classes.card}`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-black sm:h-12 sm:w-12 ${classes.icon}`}>
                  {card.icon}
                </span>
                <span>
                  <span className={`block text-base font-black text-white ${classes.title}`}>{card.label}</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-300">{card.helper}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-300">
              Featured KJ
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Who&apos;s Running The Room?
            </h2>
            <p className="mt-2 max-w-2xl text-slate-300">
              A weekly spotlight for local KJs and karaoke crews helping San Diego find the next song.
            </p>
          </div>
          <div className="shrink-0">
            <Button href="/hosts" variant="ghost">
              View all hosts
            </Button>
          </div>
        </div>

        {featuredHost ? (
          <div className="max-w-2xl">
            <HostDirectoryCard host={featuredHost} />
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-slate-950/72 p-5 md:p-6">
            <h3 className="text-2xl font-black text-white">Know a host who should be featured?</h3>
            <p className="mt-3 text-slate-300">Send us the info and we will review it for SingHUB.</p>
            <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap sm:gap-x-4 sm:gap-y-3">
              <Button href={FORM_URL}>Send KJ Info</Button>
              <Button href="/hosts" variant="secondary">Browse All Hosts</Button>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/10 p-5 md:flex md:items-center md:justify-between md:gap-6">
          <p className="text-lg font-black text-white">
            Host karaoke in San Diego? Get listed on SingHUB.
          </p>
          <div className="mt-4 shrink-0 md:mt-0">
            <Button href={FORM_URL}>Send Your KJ Info</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-fuchsia-300">
              Featured Nights
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Start with these local karaoke nights
            </h2>
          </div>
          <div className="shrink-0">
            <Button href="/find-karaoke" variant="ghost">
              View all karaoke nights
            </Button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>
    </main>
  );
}
