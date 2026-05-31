import { Button } from "@/components/ui/Button";
import { VenueCard } from "@/components/venue/VenueCard";
import { karaokeEvents, venues } from "@/data/mockData";

export default function Home() {
  const featuredVenues = venues.filter((venue) => venue.isFeatured);
  const featuredEvents = featuredVenues.map((venue) => ({
    venue,
    event: karaokeEvents.find((event) => event.venueId === venue.id),
  }));

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
              Upgrade Venue Profile
            </Button>
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
              Karaoke worth leaving the couch for
            </h2>
          </div>

          <Button href="/find-karaoke" variant="ghost">
            View all listings
          </Button>
        </div>

        <div className="grid gap-5">
          {featuredEvents.map(({ venue, event }) => (
            <VenueCard key={venue.id} venue={venue} event={event} />
          ))}
        </div>
      </section>
    </main>
  );
}