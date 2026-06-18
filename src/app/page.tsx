import { Button } from "@/components/ui/Button";
import { VenueCard } from "@/components/venue/VenueCard";
import { getFeaturedVenueListings, getVenueTickerItems } from "@/lib/venueData";

function KaraokeTicker({ items }: { items: string[] }) {
  const tickerItems = [...items, ...items, ...items];

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-fuchsia-300/30 bg-slate-950/80 shadow-lg shadow-fuchsia-950/30">
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

function SanDiegoHeroCard() {
  return (
    <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-slate-950 shadow-2xl shadow-cyan-950/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_28rem),radial-gradient(circle_at_80%_30%,rgba(217,70,239,0.26),transparent_24rem),linear-gradient(135deg,rgba(2,6,23,0.2),rgba(2,6,23,0.95))]" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-950 to-transparent" />
      <div className="absolute left-6 top-6 rounded-2xl border border-fuchsia-300/40 bg-slate-950/70 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-fuchsia-100 shadow-lg shadow-fuchsia-950/40">
        San Diego Launch City
      </div>
      <div className="absolute bottom-8 left-6 right-6">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">
          Live bars • Private rooms • Local hosts
        </p>
        <p className="mt-3 text-3xl font-black leading-none text-white md:text-5xl">
          Find your next mic in San Diego.
        </p>
      </div>
      <div className="absolute right-6 top-24 rotate-3 rounded-2xl border border-cyan-300/40 bg-cyan-300/10 px-4 py-3 text-sm font-black uppercase tracking-[0.22em] text-cyan-100 shadow-lg shadow-cyan-950/40">
        Near You
      </div>
    </div>
  );
}

export default function Home() {
  const featuredVenues = getFeaturedVenueListings();
  const tickerItems = getVenueTickerItems();

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-24">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            San Diego Karaoke Starts Here
          </p>

          <div className="inline-flex -rotate-2 flex-col rounded-3xl border border-fuchsia-300/40 bg-slate-950/80 px-5 py-4 shadow-2xl shadow-fuchsia-950/40 md:px-7 md:py-5">
            <span className="mb-2 w-fit animate-pulse rounded-full border border-cyan-300/60 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.34em] text-cyan-100">
              Karaoke
            </span>
            <h1 className="text-5xl font-black leading-none tracking-tight text-white md:text-7xl">
              Near You
              <span className="block text-fuchsia-400 drop-shadow-[0_0_18px_rgba(217,70,239,0.85)]">
                in San Diego
              </span>
            </h1>
          </div>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            SingHUB helps singers, friends, hosts, and venues find the right
            karaoke night without digging through outdated calendars and random
            Instagram posts.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/find-karaoke">Find Karaoke Tonight</Button>
            <Button href="/venues/premium" variant="secondary">
              For Venues
            </Button>
          </div>

          <KaraokeTicker items={tickerItems} />
        </div>

        <SanDiegoHeroCard />
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
