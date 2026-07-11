import Link from "next/link";
import { TonightHostCard } from "@/components/host/HostCard";
import { Button } from "@/components/ui/Button";
import { VenueCard } from "@/components/venue/VenueCard";
import { getHostsHostingToday } from "@/lib/hostData";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getFeaturedVenueListings } from "@/lib/venueData";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdC5G3JP5JSLrj5Za1S-ueRvSKVPr_l_OuBk0Ru6RZmXi5lOQ/viewform?usp=header";

const dashboardTiles = [
  {
    href: "/find-karaoke?day=tonight",
    icon: "▣",
    label: "Tonight",
    helper: "What's happening tonight",
    className: "border-fuchsia-300/45 bg-fuchsia-400/12 text-fuchsia-100 shadow-fuchsia-950/30",
  },
  {
    href: "/find-karaoke?near=me",
    icon: "⌖",
    label: "Near Me",
    helper: "Karaoke close to you",
    className: "border-cyan-300/45 bg-cyan-400/12 text-cyan-100 shadow-cyan-950/25",
  },
  {
    href: "/hosts",
    icon: "◉",
    label: "Hosts",
    helper: "See who's on the mic",
    className: "border-amber-300/45 bg-amber-400/12 text-amber-100 shadow-amber-950/20",
  },
  {
    href: "/find-karaoke",
    icon: "◇",
    label: "Venues",
    helper: "Bars, lounges & more",
    className: "border-emerald-300/45 bg-emerald-400/12 text-emerald-100 shadow-emerald-950/20",
  },
];

const tickerItems = [
  "Tonight in San Diego",
  "18 spots listed",
  "6 hosts on the mic",
  "Missing a night? Send it in",
];

function UtilityTicker() {
  const items = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className="mt-5 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/72 shadow-lg shadow-slate-950/30 backdrop-blur">
      <div className="flex min-w-max animate-[marquee_30s_linear_infinite] items-center gap-4 px-4 py-3 text-[0.7rem] font-black uppercase tracking-[0.16em] text-slate-100 hover:[animation-play-state:paused] sm:text-xs">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-4 whitespace-nowrap">
            <span className={index % 4 === 0 ? "text-red-200" : index % 4 === 1 ? "text-cyan-200" : index % 4 === 2 ? "text-fuchsia-200" : "text-amber-100"}>
              {item}
            </span>
            <span className="text-fuchsia-300">•</span>
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

function NeonBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.32),transparent_32%),radial-gradient(circle_at_10%_20%,rgba(34,211,238,0.24),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.72),rgba(2,6,23,0.96))]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-red-400" />
      <div className="absolute -right-12 top-5 h-44 w-52 rounded-[2rem] border border-fuchsia-300/35 bg-slate-950/55 shadow-[0_0_42px_rgba(217,70,239,0.38)] blur-[0.2px] sm:right-8 sm:top-8 sm:h-52 sm:w-64 md:right-14 md:w-80">
        <div className="absolute inset-3 rounded-[1.5rem] border border-cyan-300/25" />
        <p className="absolute left-6 top-8 text-3xl font-black uppercase leading-none text-fuchsia-200 opacity-70 drop-shadow-[0_0_22px_rgba(217,70,239,0.9)] sm:text-4xl md:text-5xl">
          Karaoke
        </p>
        <p className="absolute left-6 top-20 text-lg font-black uppercase tracking-[0.12em] text-cyan-100 opacity-70 drop-shadow-[0_0_20px_rgba(34,211,238,0.88)] sm:top-24 sm:text-xl md:top-28 md:text-2xl">
          In San Diego
        </p>
        <div className="absolute bottom-6 left-6 right-6 h-8 opacity-55">
          <div className="absolute bottom-0 left-0 h-4 w-7 rounded-t bg-cyan-200/40 shadow-[0_0_16px_rgba(34,211,238,0.55)]" />
          <div className="absolute bottom-0 left-8 h-6 w-8 rounded-t bg-fuchsia-200/35 shadow-[0_0_16px_rgba(217,70,239,0.55)]" />
          <div className="absolute bottom-0 left-[4.5rem] h-3 w-10 rounded-t bg-red-200/35 shadow-[0_0_16px_rgba(248,113,113,0.45)]" />
          <div className="absolute bottom-0 left-32 h-7 w-6 rounded-t bg-cyan-200/35 shadow-[0_0_16px_rgba(34,211,238,0.45)]" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(34,211,238,0.12),rgba(248,113,113,0.1),rgba(2,6,23,0.98))]" />
    </div>
  );
}

export default async function Home() {
  const featuredVenues = getPublicVenues(getFeaturedVenueListings());
  const hostsHostingToday = await getHostsHostingToday();

  return (
    <main className="overflow-x-hidden">
      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4 md:py-8">
        <div className="relative max-w-full overflow-hidden rounded-[1.35rem] border border-fuchsia-300/40 bg-slate-950 shadow-2xl shadow-fuchsia-950/35 sm:rounded-[1.75rem] md:rounded-[2.25rem]">
          <NeonBackdrop />

          <div className="relative px-4 py-5 sm:px-6 sm:py-7 md:px-10 md:py-10 lg:px-14 lg:py-12">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-fuchsia-200 sm:text-sm sm:tracking-[0.28em]">
                Welcome to SingHUB
              </p>

              <h1 className="mt-3 max-w-[13ch] text-4xl font-black leading-[0.98] text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.18)] min-[380px]:text-5xl sm:text-6xl md:text-7xl">
                Find karaoke tonight.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-100 sm:text-base sm:leading-7 md:text-lg md:leading-8">
                Live hosts. Real venues. Right here in San Diego.
              </p>

              <div className="mt-5">
                <Button href="/find-karaoke?day=tonight" className="w-full sm:w-auto">
                  Find Karaoke Tonight
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:max-w-3xl">
              {dashboardTiles.map((tile) => (
                <Link
                  key={tile.href}
                  href={tile.href}
                  className={`group flex min-h-28 items-center justify-between gap-4 rounded-2xl border p-4 shadow-lg transition hover:-translate-y-1 hover:bg-slate-950/82 ${tile.className}`}
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-lg font-black text-white shadow-[0_0_18px_rgba(255,255,255,0.08)]">
                      {tile.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xl font-black text-white group-hover:text-white sm:text-2xl">
                        {tile.label}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-slate-200">
                        {tile.helper}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-2xl font-black text-white/70 transition group-hover:translate-x-1 group-hover:text-white">
                    ›
                  </span>
                </Link>
              ))}

              <Link
                href="/neighborhoods"
                className="group flex min-h-24 items-center justify-between gap-4 rounded-2xl border border-blue-300/45 bg-blue-400/12 p-4 text-blue-100 shadow-lg shadow-blue-950/20 transition hover:-translate-y-1 hover:bg-slate-950/82 sm:col-span-2"
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span className="relative flex h-11 w-16 shrink-0 items-end justify-center rounded-xl border border-white/15 bg-white/10 px-2 pb-2 shadow-[0_0_18px_rgba(96,165,250,0.22)]">
                    <span className="h-4 w-3 rounded-t bg-cyan-200/85" />
                    <span className="ml-1 h-7 w-3 rounded-t bg-fuchsia-200/85" />
                    <span className="ml-1 h-5 w-4 rounded-t bg-red-200/80" />
                    <span className="ml-1 h-8 w-3 rounded-t bg-blue-200/85" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xl font-black text-white sm:text-2xl">
                      Neighborhoods
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-slate-200">
                      Explore karaoke by area
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-2xl font-black text-white/70 transition group-hover:translate-x-1 group-hover:text-white">
                  ›
                </span>
              </Link>
            </div>

            <UtilityTicker />
          </div>
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
