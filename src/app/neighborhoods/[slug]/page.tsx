import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { VenueMiniCard } from "@/components/seo/SeoCards";
import { getSanDiegoPublicVenues } from "@/lib/sanDiegoMarket";
import { getNeighborhoodSeoPage } from "@/lib/seoContent";
import {
  breadcrumbStructuredData,
  faqStructuredData,
  SITE_URL,
  venueListStructuredData,
} from "@/lib/seoStructuredData";
import { getVenueListings } from "@/lib/venueData";

const LEGACY_NEIGHBORHOOD_SLUGS: Record<string, string> = {
  gaslamp: "gaslamp-quarter",
  "east-county-la-mesa": "la-mesa",
};

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateStaticParams() {
  const venues = getSanDiegoPublicVenues(await getVenueListings());
  const slugs = new Set(
    venues
      .map((venue) => venue.neighborhood)
      .filter((neighborhood) => neighborhood && neighborhood !== "Multiple venues")
      .map(slugify),
  );
  return [...slugs].map((slug) => ({ slug }));
}

type NeighborhoodPageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

async function getNeighborhood(slug: string) {
  const venues = getSanDiegoPublicVenues(await getVenueListings());
  const match = venues.find(
    (venue) => venue.neighborhood && slugify(venue.neighborhood) === slug,
  );
  if (!match) return null;
  return {
    name: match.neighborhood,
    market: match.market || "San Diego",
    venues: venues.filter((venue) => venue.neighborhood === match.neighborhood),
  };
}

export async function generateMetadata({ params }: NeighborhoodPageProps) {
  const resolvedParams = await params;
  const canonicalSlug = LEGACY_NEIGHBORHOOD_SLUGS[resolvedParams.slug] || resolvedParams.slug;
  const page = await getNeighborhood(canonicalSlug);
  if (!page) return {};
  const editorial = getNeighborhoodSeoPage(canonicalSlug);

  return {
    title: editorial?.metaTitle || `${page.name} Karaoke | SingHUB`,
    description:
      editorial?.description ||
      `Find current karaoke nights, venues, and schedules in ${page.name}, San Diego.`,
    alternates: {
      canonical: `/neighborhoods/${canonicalSlug}`,
    },
    openGraph: {
      title: editorial?.metaTitle || `${page.name} Karaoke | SingHUB`,
      description:
        editorial?.description ||
        `Find current karaoke nights, venues, and schedules in ${page.name}, San Diego.`,
      url: `${SITE_URL}/neighborhoods/${canonicalSlug}`,
      type: "website",
    },
  };
}

export default async function NeighborhoodPage({ params }: NeighborhoodPageProps) {
  const resolvedParams = await params;
  const legacyTarget = LEGACY_NEIGHBORHOOD_SLUGS[resolvedParams.slug];
  if (legacyTarget) permanentRedirect(`/neighborhoods/${legacyTarget}`);

  const page = await getNeighborhood(resolvedParams.slug);
  if (!page) notFound();
  const editorial = getNeighborhoodSeoPage(resolvedParams.slug);
  const activeDays = DAY_NAMES.filter((day) =>
    page.venues.some((venue) =>
      venue.karaokeDay.toLowerCase().includes(day.toLowerCase()),
    ),
  );
  const faqs = [
    {
      question: `Where can I find karaoke in ${page.name}?`,
      answer: `SingHUB currently lists ${page.venues.length} ${page.venues.length === 1 ? "venue" : "venues"} with karaoke in ${page.name}. Open a venue listing to check its recurring day, start time, host, and current details.`,
    },
    {
      question: `What nights have karaoke in ${page.name}?`,
      answer:
        activeDays.length > 0
          ? `Current ${page.name} listings include karaoke on ${activeDays.join(", ")}. Schedules can change, so check the venue listing before heading out.`
          : `SingHUB is still confirming the current weekly schedule for ${page.name}.`,
    },
  ];
  const canonicalPath = `/neighborhoods/${resolvedParams.slug}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: `${page.name} Karaoke`,
              url: `${SITE_URL}${canonicalPath}`,
              description:
                editorial?.description ||
                `Find current karaoke nights in ${page.name}, San Diego.`,
              about: {
                "@type": "Place",
                name: `${page.name}, San Diego, California`,
              },
            },
            breadcrumbStructuredData([
              { name: "Home", path: "/" },
              { name: "Neighborhoods", path: "/neighborhoods" },
              { name: page.name, path: canonicalPath },
            ]),
            venueListStructuredData(
              `${page.name} Karaoke Venues`,
              canonicalPath,
              page.venues,
            ),
            faqStructuredData(faqs),
          ],
        }}
      />
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
            Neighborhood Karaoke Guide
          </p>
          <h1 className="mt-4 text-4xl font-black text-white md:text-6xl">
            {page.name} karaoke
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            {editorial?.intro ||
              `Browse current karaoke venues and recurring nights in ${page.name}, grouped within ${page.market} for broader San Diego discovery.`}
          </p>
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
            Market
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">{page.market}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {page.venues.length} {page.venues.length === 1 ? "venue is" : "venues are"} currently represented in this neighborhood.
          </p>
          {editorial ? (
            <>
              <p className="mt-5 text-sm font-bold leading-7 text-cyan-100">{editorial.vibe}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {editorial.bestFor.map((item) => (
                  <span key={item} className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-2 text-xs font-bold text-fuchsia-100">
                    {item}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </aside>
      </section>

      {activeDays.length > 0 ? (
        <section className="mt-12 rounded-[1.75rem] border border-cyan-300/20 bg-cyan-300/[0.06] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Karaoke By Night</p>
          <h2 className="mt-2 text-2xl font-black text-white">When {page.name} has karaoke</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {activeDays.map((day) => (
              <Link key={day} href={`/karaoke/${day.toLowerCase()}`} className="rounded-full border border-white/15 bg-slate-950/70 px-4 py-3 text-sm font-bold text-white hover:border-fuchsia-300/60">
                {day} karaoke →
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
          {page.name} Listings
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          Known karaoke around {page.name}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Neighborhoods use one canonical location value, so venues in this list match {page.name} exactly instead of relying on fuzzy text matching.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {page.venues.slice(0, 18).map((venue) => (
            <VenueMiniCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">Quick Answers</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-2xl bg-white/[0.04] p-5">
              <h2 className="text-lg font-black text-white">{faq.question}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
