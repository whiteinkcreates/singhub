import Link from "next/link";
import { V2IndexHero } from "@/components/layout/V2IndexHero";
import { getPublicIndexHero } from "@/lib/v2/indexHero.server";
import { SITE_NEIGHBORHOODS_HERO_KEY } from "@/lib/hostMedia";
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
  const [allVenues, hero] = await Promise.all([getVenueListings(), getPublicIndexHero(SITE_NEIGHBORHOODS_HERO_KEY)]);
  const venues = getSanDiegoPublicVenues(allVenues);
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
    <main className="min-h-screen bg-[#050609] text-white">
      <V2IndexHero eyebrow="SAN DIEGO NEIGHBORHOODS" title="Find your karaoke neighborhood." description="Explore the local scenes in SingHUB's Venue Index, grouped by San Diego area so you can find your kind of room." heroUrl={hero?.heroUrl} heroAlt={hero?.heroAlt} heroPosition={hero?.heroPosition} heroPlacement={hero?.heroPlacement} primaryHref="/find-karaoke" primaryLabel="Open the venue finder" />

      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-20 pt-12">
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
