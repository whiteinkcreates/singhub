import Link from "next/link";
import { TonightHostCard } from "@/components/host/HostCard";
import { Button } from "@/components/ui/Button";
import { VenueCard } from "@/components/venue/VenueCard";
import { getHostsHostingToday } from "@/lib/hostData";
import { getTickerItems } from "@/lib/tickerData";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getFeaturedVenueListings } from "@/lib/venueData";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdC5G3JP5JSLrj5Za1S-ueRvSKVPr_l_OuBk0Ru6RZmXi5lOQ/viewform?usp=header";

const heroQuickLinks = [
  { href: "/find-karaoke?type=live", label: "Live karaoke", tone: "fuchsia" },
  { href: "/find-karaoke?type=private-room", label: "Private rooms", tone: "cyan" },
  { href: "/find-karaoke?day=tonight", label: "Tonight", tone: "coral" },
];

const actionCards = [
  {
    href: "/find-karaoke?day=tonight",
    icon: "TN",
    label: "Tonight",
    helper: "See what is happening tonight.",
  },
  {
    href: "/neighborhoods",
    icon: "NB",
    label: "Neighborhoods",
    helper: "Explore karaoke near you.",
  },
  {
    href: "/hosts",
    icon: "KJ",
    label: "Hosts",
    helper: "Find your favorite KJs.",
  },
  {
    href: "/find-karaoke",
    icon: "VN",
    label: "Venues",
    helper: "Bars, pubs, and lounges with karaoke.",
  },
];

function KaraokeTicker({ items }: { items: string[] }) {
  const tickerItems = [...items, ...items, ...items];

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-fuchsia-300/40 bg-slate-950/70 shadow-lg shadow-fuchsia-950/40 backdrop-blur md:mt-8">
      <div className="flex min-w-max animate-[marquee_32s_linear_infinite] gap-8 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-cyan-100 hover:[animation-play-state:paused] md:text-sm md:tracking-[0.18em]">
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
  const featuredVenues = getPublicVenues(getFeaturedVenueListings());
  const tickerItems = getTickerItems();
  const hostsHostingToday = await getHostsHostingToday();

  return (
    <main>
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4 md:py-10">
        <div className="relative overflow-hidden rounded-[1.55rem] border-2 border-fuchsia-300/50 bg-slate-950 shadow-2xl shadow-fuchsia-950/50 sm:rounded-[2rem] md:rounded-[2.5rem]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{ backgroundImage: "url('/images/hero/san-diego-skyline-vector.svg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/82 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/18 to-slate-950/40" />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(180deg,transparent,rgba(8,47,73,0.42)_24%,rgba(239,68,68,0.16)_48%,rgba(34,211,238,0.24)_62%,rgba(2,6,23,0.96)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-[repeating-linear-gradient(180deg,rgba(34,211,238,0.16)_0px,rgba(34,211,238,0.04)_2px,transparent_7px,transparent_14px)] opacity-80 blur-[0.2px]" />
          <div className="absolute -right-16 top-12 hidden h-56 w-56 rounded-full bg-red-500/30 blur-3xl md:block" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-red-400" />

          <div className="relative min-h-[34rem] px-4 py-6 sm:px-6 sm:py-8 md:min-h-[39rem] md:px-10 md:py-10 lg:px-14 lg:py-12">
            <div className="grid h-full gap-8 md:grid-cols-[minmax(0,1fr)_22rem] md:items-center lg:grid-cols-[minmax(0,1fr)_26rem]">
              <div className="flex max-w-4xl flex-col justify-end md:justify-center">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-cyan-200 sm:text-sm sm:tracking-[0.32em]">
                  San Diego, CA | Community. Music. Good times.
                </p>

                <h1 className="max-w-3xl text-5xl font-black leading-[0.92] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.22)] sm:text-7xl lg:text-8xl">
                  Find karaoke.
                  <span className="mt-2 block bg-gradient-to-r from-fuchsia-300 via-red-300 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(244,63,94,0.55)]">
                    Any night. Any vibe.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-100 md:mt-7 md:text-lg md:leading-8">
                  Search by night, neighborhood, venue, or host and see where to sing tonight without digging through outdated calendars and random Instagram posts.
                </p>

                <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/72 p-3 shadow-xl shadow-slate-950/35 backdrop-blur md:mt-7 md:grid-cols-[1fr_auto_auto_auto]">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-cyan-200">Search</p>
                    <p className="mt-1 text-sm font-semibold text-white">Karaoke nights, hosts, or venues</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-fuchsia-200">Location</p>
                    <p className="mt-1 text-sm font-semibold text-white">San Diego</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-red-200">When</p>
                    <p className="mt-1 text-sm font-semibold text-white">Tonight</p>
                  </div>
                  <Button href="/find-karaoke?day=tonight">Find Karaoke</Button>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-slate-100">
                  {heroQuickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-full border px-4 py-2 backdrop-blur transition hover:-translate-y-0.5 hover:bg-slate-950/80 ${
                        link.tone === "cyan"
                          ? "border-cyan-300/50 bg-slate-950/55 text-cyan-100 hover:border-cyan-200"
                          : link.tone === "coral"
                            ? "border-red-300/50 bg-red-400/10 text-red-100 hover:border-red-200"
                            : "border-fuchsia-300/50 bg-slate-950/55 text-fuchsia-100 hover:border-fuchsia-200"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <KaraokeTicker items={tickerItems} />
              </div>

              <div className="hidden justify-center md:flex">
                <div className="relative w-full max-w-sm rounded-[2rem] border-2 border-fuchsia-300/55 bg-slate-950/55 p-6 text-center shadow-[0_0_45px_rgba(217,70,239,0.45)] backdrop-blur">
                  <div className="absolute -inset-4 rounded-[2.5rem] border border-cyan-300/20 blur-sm" />
                  <p className="relative text-6xl font-black uppercase leading-none text-fuchsia-200 drop-shadow-[0_0_26px_rgba(217,70,239,0.95)] lg:text-7xl">
                    Karaoke
                  </p>
                  <p className="relative mt-3 text-3xl font-black uppercase tracking-[0.12em] text-cyan-100 drop-shadow-[0_0_24px_rgba(34,211,238,0.85)]">
                    Tonight
                  </p>
                  <div className="relative mx-auto mt-5 h-1 w-28 rounded-full bg-red-300 shadow-[0_0_28px_rgba(248,113,113,0.95)]" />
                  <p className="relative mt-5 text-sm font-bold uppercase tracking-[0.28em] text-red-100">
                    SingHUB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actionCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex min-h-32 items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-300/55 hover:bg-slate-950"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-fuchsia-300/45 bg-fuchsia-300/10 text-sm font-black text-fuchsia-100 shadow-[0_0_18px_rgba(217,70,239,0.18)]">
                {card.icon}
              </span>
              <span>
                <span className="block text-lg font-black text-white group-hover:text-cyan-100">{card.label}</span>
                <span className="mt-1 block text-sm leading-5 text-slate-300">{card.helper}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-300">
              Tonight&apos;s hosts
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Who&apos;s Running The Room?
            </h2>
            <p className="mt-2 max-w-2xl text-slate-300">
              Meet the KJs hosting karaoke tonight across San Diego.
            </p>
          </div>
          <Button href="/hosts" variant="ghost">
            View all hosts
          </Button>
        </div>

        {hostsHostingToday.length > 0 ? (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:thin]">
            {hostsHostingToday.map(({ host, gig }) => (
              <TonightHostCard key={`${host.slug}-${gig.raw}`} host={host} gig={gig} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-slate-950/72 p-5 md:p-6">
            <h3 className="text-2xl font-black text-white">Know who&apos;s hosting tonight?</h3>
            <p className="mt-3 text-slate-300">Send us the info and we will review it for SingHUB.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button href={FORM_URL}>Send KJ Info</Button>
              <Button href="/hosts" variant="secondary">Browse All Hosts</Button>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/10 p-5 md:flex md:items-center md:justify-between md:gap-6">
          <p className="text-lg font-black text-white">
            Host karaoke in San Diego? Get listed on SingHUB.
          </p>
          <div className="mt-4 md:mt-0">
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
          <Button href="/find-karaoke" variant="ghost">
            View all karaoke nights
          </Button>
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
