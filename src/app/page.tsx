import { Button } from "@/components/ui/Button";
import { VenueCard } from "@/components/venue/VenueCard";
import { getFeaturedVenueListings, getVenueTickerItems } from "@/lib/venueData";

function KaraokeTicker({ items }: { items: string[] }) {
  const tickerItems = [...items, ...items, ...items];

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-fuchsia-300/40 bg-slate-950/70 shadow-lg shadow-fuchsia-950/40 backdrop-blur">
      <div className="flex min-w-max animate-[marquee_32s_linear_infinite] gap-8 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-100 hover:[animation-play-state:paused]">
        {tickerItems.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-8 whitespace-nowrap">
            <span>{item}</span>
            <span className="text-fuchsia-300">✦</span>
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

function HeroStatsPanel() {
  return (
    <div className="hidden rounded-3xl border border-cyan-300/30 bg-slate-950/65 p-5 text-sm shadow-xl shadow-cyan-950/30 backdrop-blur md:block">
      <div className="grid gap-4">
        <div className="border-b border-white/10 pb-4">
          <p className="text-2xl font-black text-white">70+</p>
          <p className="mt-1 font-semibold text-cyan-100">Launch listings</p>
        </div>
        <div className="border-b border-white/10 pb-4">
          <p className="text-2xl font-black text-white">Live</p>
          <p className="mt-1 font-semibold text-cyan-100">Bar nights + private rooms</p>
        </div>
        <div>
          <p className="text-2xl font-black text-white">SD</p>
          <p className="mt-1 font-semibold text-cyan-100">Built for San Diego karaoke</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const featuredVenues = getFeaturedVenueListings();
  const tickerItems = getVenueTickerItems();

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-fuchsia-300/50 bg-slate-950 shadow-2xl shadow-fuchsia-950/50 md:rounded-[2.5rem]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-95"
            style={{ backgroundImage: "url('/images/hero/san-diego-skyline-hero.svg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(217,70,239,0.28),transparent_24rem),radial-gradient(circle_at_78%_38%,rgba(34,211,238,0.22),transparent_26rem)]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-blue-400" />

          <div className="relative grid min-h-[42rem] gap-8 px-5 py-8 md:grid-cols-[1fr_18rem] md:px-10 md:py-10 lg:px-14 lg:py-12">
            <div className="flex max-w-4xl flex-col justify-end md:justify-center">
              <p className="mb-5 text-sm font-black uppercase tracking-[0.32em] text-cyan-200">
                San Diego Karaoke Starts Here
              </p>

              <div className="w-fit rounded-[1.7rem] border-2 border-cyan-300/70 bg-slate-950/55 px-5 py-4 shadow-[0_0_34px_rgba(34,211,238,0.35)] backdrop-blur md:px-7 md:py-5">
                <span className="block animate-pulse text-6xl font-black uppercase leading-none tracking-tight text-cyan-100 drop-shadow-[0_0_28px_rgba(34,211,238,0.95)] md:text-8xl lg:text-9xl">
                  Karaoke
                </span>
                <span className="mt-1 block text-4xl font-black leading-none text-fuchsia-300 drop-shadow-[0_0_22px_rgba(217,70,239,0.9)] md:text-6xl lg:text-7xl">
                  Near You
                </span>
                <span className="mt-2 block text-3xl font-black leading-none text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.65)] md:text-5xl lg:text-6xl">
                  in San Diego
                </span>
              </div>

              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-100 md:text-lg md:leading-8">
                Find karaoke bars, private rooms, and live karaoke nights in San
                Diego without digging through outdated calendars and random
                Instagram posts.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button href="/find-karaoke">Find Karaoke Tonight</Button>
                <Button href="/venues/premium" variant="secondary">
                  For Venues
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-slate-100">
                <span className="rounded-full border border-fuchsia-300/40 bg-slate-950/55 px-4 py-2 backdrop-blur">
                  Live karaoke
                </span>
                <span className="rounded-full border border-cyan-300/40 bg-slate-950/55 px-4 py-2 backdrop-blur">
                  Private rooms
                </span>
                <span className="rounded-full border border-fuchsia-300/40 bg-slate-950/55 px-4 py-2 backdrop-blur">
                  Tonight
                </span>
              </div>

              <KaraokeTicker items={tickerItems} />
            </div>

            <div className="flex items-end justify-end">
              <HeroStatsPanel />
            </div>
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
