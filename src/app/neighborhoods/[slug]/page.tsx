import Link from "next/link";
import { notFound } from "next/navigation";
import { VenueMiniCard } from "@/components/seo/SeoCards";
import { getNeighborhoodSeoPage, neighborhoodSeoPages } from "@/lib/seoContent";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getVenueListings } from "@/lib/venueData";

export function generateStaticParams() {
  return neighborhoodSeoPages.map((page) => ({ slug: page.slug }));
}

type NeighborhoodPageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateMetadata({ params }: NeighborhoodPageProps) {
  const resolvedParams = await params;
  const page = getNeighborhoodSeoPage(resolvedParams.slug);

  if (!page) {
    return {};
  }

  return {
    title: page.metaTitle,
    description: page.description,
    alternates: {
      canonical: `/neighborhoods/${page.slug}`,
    },
  };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function venueMatchesNeighborhood(venueNeighborhood: string, neighborhoodName: string, slug: string) {
  const haystack = normalize(venueNeighborhood);
  const name = normalize(neighborhoodName);
  const slugText = normalize(slug);

  if (haystack.includes(name) || name.includes(haystack)) {
    return true;
  }

  return slugText.split(" ").some((part) => part.length > 3 && haystack.includes(part));
}

export default async function NeighborhoodPage({ params }: NeighborhoodPageProps) {
  const resolvedParams = await params;
  const page = getNeighborhoodSeoPage(resolvedParams.slug);

  if (!page) {
    notFound();
  }

  const venues = getPublicVenues(await getVenueListings()).filter((venue) =>
    venueMatchesNeighborhood(venue.neighborhood || "", page.name, page.slug),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
            Neighborhood Karaoke Guide
          </p>
          <h1 className="mt-4 text-4xl font-black text-white md:text-6xl">
            {page.name} karaoke
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">{page.intro}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/find-karaoke?neighborhood=${encodeURIComponent(page.name)}`}
              className="rounded-full bg-fuchsia-400 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-fuchsia-950/40 transition hover:-translate-y-0.5 hover:bg-fuchsia-300"
            >
              Find {page.name} Karaoke
            </Link>
            <Link
              href="/neighborhoods"
              className="rounded-full border border-cyan-300/50 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
            >
              All Neighborhoods
            </Link>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-cyan-300/30 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/20">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">
            Local Vibe
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">{page.vibe}</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {page.bestFor.map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
                {item}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-14 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
          {page.name} Listings
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          {venues.length > 0 ? `Known karaoke around ${page.name}` : `Help map karaoke around ${page.name}`}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Neighborhood data is only as good as the source details. If a room is missing or the schedule changed, submit the current info so SingHUB gets smarter.
        </p>
        {venues.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {venues.slice(0, 12).map((venue) => (
              <VenueMiniCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-cyan-300/30 bg-white/[0.03] p-6">
            <p className="text-slate-300">
              Know a karaoke night around {page.name}? Send the venue, day, time, host, and source.
            </p>
            <Link href="/submit-listing" className="mt-4 inline-block text-sm font-bold text-cyan-200 hover:text-cyan-100">
              Submit a listing →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
