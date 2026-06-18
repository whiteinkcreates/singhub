import { Button } from "@/components/ui/Button";
import { VenueCard } from "@/components/venue/VenueCard";
import { getFeaturedVenueListings, getVenueTickerItems } from "@/lib/venueData";

function KaraokeTicker({ items }: { items: string[] }) {
  const tickerItems = [...items, ...items];

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-fuchsia-300/30 bg-slate-950/80 shadow-lg shadow-fuchsia-950/30">
      <div className="flex min-w-max animate-singhub-marquee gap-8 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">
        {tickerItems.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-8 whitespace-nowrap">
            <span>{item}</span>
            <span className="text-fuchsia-300">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const featuredVenues = getFeaturedVenueListings();
  const tickerItems = getVenueTickerItems();

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            San Diego Karaoke Starts Here
          </p>

          <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
            Find Karaoke{" "}
            <span className="text-fuchsia-400">Tonight</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
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
        </div>

        <KaraokeTicker items={tickerItems} />
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
