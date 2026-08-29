import Link from "next/link";
import { HostDirectoryCard } from "@/components/host/HostCard";
import { Button } from "@/components/ui/Button";
import { VenueCard } from "@/components/venue/VenueCard";
import { getFeaturedHosts } from "@/lib/hostData";
import { getSanDiegoPublicVenues, getSanDiegoRegionHosts } from "@/lib/sanDiegoMarket";
import { getFeaturedVenueListings, getVenueListings } from "@/lib/venueData";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdC5G3JP5JSLrj5Za1S-ueRvSKVPr_l_OuBk0Ru6RZmXi5lOQ/viewform?usp=header";
const HERO_IMAGE_URL =
  "https://res.cloudinary.com/dy3lyejkk/image/upload/v1786839114/file_00000000bc6081fd9e63561226afdd01_kldtkz.png";

const searchLinks = [
  { href: "/find-karaoke?day=tonight", label: "Night" },
  { href: "/neighborhoods", label: "Neighborhood" },
  { href: "/places", label: "Venue" },
  { href: "/hosts", label: "Host" },
];

const actionCards = [
  {
    href: "/find-karaoke?day=tonight",
    icon: "NOW",
    label: "Tonight",
    helper: "See the karaoke options happening around San Diego tonight.",
    tone: "coral",
    emphasis: true,
  },
  {
    href: "/places",
    icon: "MAP",
    label: "SingHUB Radar",
    helper: "Browse the San Diego Venue Index and find a karaoke spot worth knowing.",
    tone: "violet",
    emphasis: true,
  },
  {
    href: "/neighborhoods",
    icon: "AREA",
    label: "Neighborhoods",
    helper: "Find karaoke by the part of town you are already in.",
    tone: "blue",
    emphasis: false,
  },
  {
    href: "/hosts",
    icon: "KJ",
    label: "Hosts",
    helper: "Find the KJs and hosts who run your favorite rooms.",
    tone: "fuchsia",
    emphasis: false,
  },
  {
    href: "/find-karaoke?type=live",
    icon: "LIVE",
    label: "Live Karaoke",
    helper: "Find bars and venues with hosted karaoke nights.",
    tone: "coral",
    emphasis: false,
  },
  {
    href: "/find-karaoke?type=private-room",
    icon: "ROOM",
    label: "Private Rooms",
    helper: "Find karaoke rooms for your crew, party, or private session.",
    tone: "cyan",
    emphasis: false,
  },
];

function getActionCardClasses(tone: string) {
  if (tone === "coral") {
    return {
      card: "border-red-300/45 bg-[linear-gradient(145deg,rgba(127,29,29,0.48),rgba(69,10,10,0.22))] shadow-red-950/30 hover:border-red-200/80",
      icon: "border-red-300/60 bg-red-400/18 text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.18)]",
      eyebrow: "text-red-200",
      glow: "bg-red-400/15",
    };
  }

  if (tone === "blue") {
    return {
      card: "border-blue-300/40 bg-[linear-gradient(145deg,rgba(30,64,175,0.34),rgba(15,23,42,0.2))] shadow-blue-950/30 hover:border-blue-200/75",
      icon: "border-blue-300/55 bg-blue-400/15 text-blue-100 shadow-[0_0_24px_rgba(96,165,250,0.18)]",
      eyebrow: "text-blue-200",
      glow: "bg-blue-400/12",
    };
  }

  if (tone === "cyan") {
    return {
      card: "border-cyan-300/40 bg-[linear-gradient(145deg,rgba(8,145,178,0.28),rgba(15,23,42,0.2))] shadow-cyan-950/30 hover:border-cyan-200/75",
      icon: "border-cyan-300/55 bg-cyan-300/15 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.18)]",
      eyebrow: "text-cyan-200",
      glow: "bg-cyan-300/12",
    };
  }

  if (tone === "violet") {
    return {
      card: "border-violet-300/45 bg-[linear-gradient(145deg,rgba(91,33,182,0.46),rgba(46,16,101,0.2))] shadow-violet-950/35 hover:border-violet-200/80",
      icon: "border-violet-300/60 bg-violet-300/15 text-violet-100 shadow-[0_0_24px_rgba(167,139,250,0.2)]",
      eyebrow: "text-violet-200",
      glow: "bg-violet-400/15",
    };
  }

  return {
    card: "border-fuchsia-300/40 bg-[linear-gradient(145deg,rgba(134,25,143,0.34),rgba(15,23,42,0.2))] shadow-fuchsia-950/30 hover:border-fuchsia-200/75",
    icon: "border-fuchsia-300/55 bg-fuchsia-300/15 text-fuchsia-100 shadow-[0_0_24px_rgba(217,70,239,0.18)]",
    eyebrow: "text-fuchsia-200",
    glow: "bg-fuchsia-400/12",
  };
}

export default async function Home() {
  const [venueListings, featuredVenueListings, featuredHostListings] = await Promise.all([
    getVenueListings(),
    getFeaturedVenueListings(),
    getFeaturedHosts(),
  ]);
  const publicVenues = getSanDiegoPublicVenues(venueListings);
  const featuredVenues = getSanDiegoPublicVenues(featuredVenueListings);
  const featuredHosts = getSanDiegoRegionHosts(featuredHostListings, publicVenues);
  const featuredHost = featuredHosts[0];

  return (
    <main className="overflow-x-hidden">
      <section className="mx-auto max-w-7xl px-3 pb-8 pt-4 sm:px-4 md:pb-12 md:pt-8">
        <div className="relative min-h-[34rem] max-w-full overflow-hidden rounded-[1.35rem] border border-fuchsia-300/35 bg-slate-950 shadow-2xl shadow-fuchsia-950/30 sm:rounded-[1.9rem] md:min-h-[38rem] md:rounded-[2.5rem]">
          <div
            className="absolute inset-0 bg-cover bg-[position:58%_center] sm:bg-center"
            style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.82)_0%,rgba(2,6,23,0.5)_34%,rgba(2,6,23,0.18)_58%,rgba(2,6,23,0.03)_78%,transparent_100%)] md:bg-[linear-gradient(90deg,rgba(2,6,23,0.76)_0%,rgba(2,6,23,0.38)_34%,rgba(2,6,23,0.1)_56%,transparent_76%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/5 to-transparent md:from-slate-950/24" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300" />
          <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-fuchsia-500/8 blur-3xl" />

          <div className="relative flex min-h-[34rem] items-end px-4 py-7 sm:px-7 sm:py-9 md:min-h-[38rem] md:items-center md:px-12 md:py-14 lg:px-16">
            <div className="min-w-0 max-w-3xl">
              <p className="inline-flex rounded-full border border-cyan-300/35 bg-slate-950/48 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-cyan-100 backdrop-blur sm:text-xs sm:tracking-[0.26em]">
                San Diego Karaoke Starts Here
              </p>

              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.96] tracking-tight text-white drop-shadow-[0_2px_18px_rgba(2,6,23,0.7)] min-[380px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                Find karaoke
                <span className="block bg-gradient-to-r from-white via-cyan-100 to-fuchsia-200 bg-clip-text text-transparent">
                  in San Diego.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-100 drop-shadow-[0_1px_12px_rgba(2,6,23,0.8)] sm:text-lg sm:leading-8 md:text-xl">
                Search by night, neighborhood, venue, or host and see where to sing tonight.
              </p>

              <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3">
                <Button href="/find-karaoke?day=tonight" className="w-full sm:w-auto">
                  Find Karaoke Tonight
                </Button>
                <Button href="/places" variant="secondary" className="w-full sm:w-auto">
                  Explore the Venue Index
                </Button>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <span className="mr-1 text-xs font-black uppercase tracking-[0.2em] text-slate-200 drop-shadow-[0_1px_8px_rgba(2,6,23,0.8)]">
                  Search by
                </span>
                {searchLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="rounded-full border border-white/20 bg-slate-950/42 px-3 py-2 text-xs font-bold text-white backdrop-blur transition hover:border-cyan-300/60 hover:bg-cyan-300/10 hover:text-cyan-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-cyan-300/10 bg-cyan-950/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_30%,rgba(34,211,238,0.08),transparent_22rem),radial-gradient(circle_at_92%_70%,rgba(217,70,239,0.08),transparent_24rem)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="mb-7 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
              Find Your Way In
            </p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              Start with what you know.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Know the night, the neighborhood, the venue, or the host? SingHUB gets you from there to the mic.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {actionCards.map((card) => {
              const classes = getActionCardClasses(card.tone);
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className={`group relative isolate overflow-hidden rounded-3xl border p-5 shadow-xl transition hover:-translate-y-1 ${classes.card} ${card.emphasis ? "min-h-52 lg:col-span-2 lg:min-h-60 lg:p-7" : "min-h-44"}`}
                >
                  <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl transition group-hover:scale-125 ${classes.glow}`} />
                  <div className="relative flex h-full flex-col justify-between">
                    <span className={`inline-flex w-fit rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${classes.icon}`}>
                      {card.icon}
                    </span>
                    <div className="mt-8">
                      <p className={`text-xs font-black uppercase tracking-[0.2em] ${classes.eyebrow}`}>
                        Find Karaoke
                      </p>
                      <h3 className={`${card.emphasis ? "mt-2 text-3xl md:text-4xl" : "mt-2 text-2xl"} font-black text-white`}>
                        {card.label}
                      </h3>
                      <p className={`mt-3 max-w-xl leading-6 text-slate-200 ${card.emphasis ? "text-base" : "text-sm"}`}>
                        {card.helper}
                      </p>
                      <p className="mt-5 text-sm font-black text-white transition group-hover:text-cyan-100">
                        Explore →
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-fuchsia-300/10 bg-[linear-gradient(135deg,rgba(46,16,101,0.32),rgba(2,6,23,0.94)_48%,rgba(8,47,73,0.3))]">
        <div className="absolute -left-28 top-16 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 md:py-20 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-fuchsia-300">
              Featured KJ
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Who&apos;s running the room?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Meet the local KJs and karaoke crews who shape the room, the rotation, and the night.
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
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 md:p-8">
              <h3 className="text-2xl font-black text-white">Know a host who should be featured?</h3>
              <p className="mt-3 text-slate-300">Send us the info and we will review it for SingHUB.</p>
              <div className="mt-5">
                <Button href={FORM_URL}>Send KJ Info</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="relative bg-slate-950/72">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
                Featured Nights
              </p>
              <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">
                A few good places to start.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                Local karaoke nights worth knowing when you want a recommendation instead of another search box.
              </p>
            </div>
            <Button href="/find-karaoke" variant="secondary">
              View All Karaoke Nights
            </Button>
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
