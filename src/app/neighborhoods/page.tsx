import Link from "next/link";
import { getSanDiegoPublicVenues } from "@/lib/sanDiegoMarket";
import { getVenueListings } from "@/lib/venueData";

export const metadata = {
  title: "San Diego Karaoke Neighborhoods | SingHUB",
  description: "Browse San Diego karaoke by neighborhood and market.",
  alternates: {
    canonical: "/neighborhoods",
  },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function NeighborhoodsPage() {
  const venues = getSanDiegoPublicVenues(await getVenueListings());
  const counts = new Map<string, { market: string; count: number }>();

  for (const venue of venues) {
    if (!venue.neighborhood || venue.neighborhood === "Multiple venues") continue;
    const current = counts.get(venue.neighborhood);
    counts.set(venue.neighborhood, {
      market: venue.market || "San Diego",
      count: (current?.count || 0) + 1,
    });
  }

  const grouped = new Map<string, Array<{ name: string; count: number }>>();
  for (const [name, detail] of counts) {
    grouped.set(detail.market, [
      ...(grouped.get(detail.market) || []),
      { name, count: detail.count },
    ]);
  }

  const marketOrder = [
    "Downtown",
    "Central San Diego",
    "Coastal San Diego",
    "East County",
    "South Bay",
    "North County",
    "San Diego",
  ];
  const markets = [...grouped.keys()].sort((a, b) => {
    const aIndex = marketOrder.indexOf(a);
    const bIndex = marketOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
          Neighborhood Karaoke
        </p>
        <h1 className="mt-4 text-4xl font-black text-white md:text-6xl">
          San Diego karaoke by neighborhood
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Browse the actual neighborhoods represented in the SingHUB Venue Index, grouped into larger San Diego markets so nearby scenes are easier to explore.
        </p>
        <Link
          href="/find-karaoke"
          className="mt-7 inline-block rounded-full bg-fuchsia-400 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-fuchsia-950/40 transition hover:-translate-y-0.5 hover:bg-fuchsia-300"
        >
          Find Karaoke Near You
        </Link>
      </section>

      <div className="mt-14 space-y-12">
        {markets.map((market) => (
          <section key={market}>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">
                  Market
                </p>
                <h2 className="mt-2 text-3xl font-black text-white">{market}</h2>
              </div>
              <p className="text-sm text-slate-400">
                {grouped.get(market)?.reduce((sum, item) => sum + item.count, 0)} venues
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(grouped.get(market) || [])
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((neighborhood) => (
                  <Link
                    key={neighborhood.name}
                    href={`/neighborhoods/${slugify(neighborhood.name)}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/50"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                      Neighborhood
                    </p>
                    <h3 className="mt-3 text-2xl font-black text-white">
                      {neighborhood.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {neighborhood.count} {neighborhood.count === 1 ? "venue" : "venues"} currently represented in SingHUB.
                    </p>
                    <p className="mt-4 text-sm font-bold text-fuchsia-200">
                      Explore {neighborhood.name} →
                    </p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
