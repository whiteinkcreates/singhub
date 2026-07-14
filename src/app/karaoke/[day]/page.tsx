import Link from "next/link";
import { notFound } from "next/navigation";
import { VenueMiniCard } from "@/components/seo/SeoCards";
import { daySeoPages, getDaySeoPage } from "@/lib/seoContent";
import { getKaraokeEventListings } from "@/lib/eventData";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getVenueListings } from "@/lib/venueData";

export function generateStaticParams() {
  return daySeoPages.map((page) => ({ day: page.slug }));
}

type DayPageProps = {
  params: Promise<{ day: string }> | { day: string };
};

export async function generateMetadata({ params }: DayPageProps) {
  const resolvedParams = await params;
  const page = getDaySeoPage(resolvedParams.day);

  if (!page) {
    return {};
  }

  return {
    title: page.metaTitle,
    description: page.description,
    alternates: {
      canonical: `/karaoke/${page.slug}`,
    },
  };
}

function eventMatchesDay(eventDay: string, day: string) {
  const normalizedEventDay = eventDay.toLowerCase();
  const normalizedDay = day.toLowerCase();

  return normalizedEventDay.includes(normalizedDay) || normalizedEventDay.includes("daily");
}

export default async function DayKaraokePage({ params }: DayPageProps) {
  const resolvedParams = await params;
  const page = getDaySeoPage(resolvedParams.day);

  if (!page) {
    notFound();
  }

  const events = (await getKaraokeEventListings()).filter((event) =>
    eventMatchesDay(event.karaokeDay, page.day),
  );
  const eventVenueSlugs = new Set(events.map((event) => event.venueSlug));
  const venues = getPublicVenues(await getVenueListings()).filter((venue) =>
    eventVenueSlugs.has(venue.slug) || eventMatchesDay(venue.karaokeDay, page.day),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
          Karaoke By Day
        </p>
        <h1 className="mt-4 text-4xl font-black text-white md:text-6xl">{page.title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">{page.intro}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href={page.findHref}
            className="rounded-full bg-fuchsia-400 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-fuchsia-950/40 transition hover:-translate-y-0.5 hover:bg-fuchsia-300"
          >
            Find {page.day} Karaoke
          </Link>
          <Link
            href="/karaoke-tonight-san-diego"
            className="rounded-full border border-cyan-300/50 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
          >
            Karaoke Tonight
          </Link>
        </div>
      </section>

      <section className="mt-14 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
          {page.day} Listings
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          {venues.length > 0 ? `Known ${page.day} karaoke options` : `No ${page.day} listings yet`}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Schedules can change. SingHUB is actively cleaning and verifying local karaoke data, so use this as a launch pad and check the venue before heading out.
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
              Know a {page.day} karaoke night in San Diego? Submit it and help make the local finder better.
            </p>
            <Link href="/submit-listing" className="mt-4 inline-block text-sm font-bold text-cyan-200 hover:text-cyan-100">
              Submit a listing →
            </Link>
          </div>
        )}
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {daySeoPages
          .filter((dayPage) => dayPage.slug !== page.slug)
          .map((dayPage) => (
            <Link
              key={dayPage.slug}
              href={`/karaoke/${dayPage.slug}`}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-black text-white transition hover:-translate-y-0.5 hover:border-fuchsia-300/50"
            >
              {dayPage.day} karaoke →
            </Link>
          ))}
      </section>
    </main>
  );
}
