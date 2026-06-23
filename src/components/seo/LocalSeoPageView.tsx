import Link from "next/link";
import { GuideCard, NeighborhoodCard, VenueMiniCard } from "@/components/seo/SeoCards";
import type { GuidePost, LocalSeoPage, NeighborhoodSeoPage } from "@/lib/seoContent";
import type { VenueListing } from "@/types";

type LocalSeoPageViewProps = {
  page: LocalSeoPage;
  venues: VenueListing[];
  guides?: GuidePost[];
  neighborhoods?: NeighborhoodSeoPage[];
};

export function LocalSeoPageView({ page, venues, guides = [], neighborhoods = [] }: LocalSeoPageViewProps) {
  const featuredVenues = venues.slice(0, 6);

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
            {page.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
            {page.headline}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{page.intro}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={page.primaryCtaHref}
              className="rounded-full bg-fuchsia-400 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-fuchsia-950/40 transition hover:-translate-y-0.5 hover:bg-fuchsia-300"
            >
              {page.primaryCtaLabel}
            </Link>
            {page.secondaryCtaHref && page.secondaryCtaLabel ? (
              <Link
                href={page.secondaryCtaHref}
                className="rounded-full border border-cyan-300/50 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
              >
                {page.secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-fuchsia-300/30 bg-slate-900/80 p-6 shadow-2xl shadow-fuchsia-950/30">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300">
            Start Searching
          </p>
          <div className="mt-5 grid gap-3">
            <Link className="rounded-2xl bg-white/[0.06] p-4 font-bold text-white hover:bg-white/[0.1]" href="/find-karaoke?day=tonight">
              Karaoke tonight in San Diego
            </Link>
            <Link className="rounded-2xl bg-white/[0.06] p-4 font-bold text-white hover:bg-white/[0.1]" href="/find-karaoke?type=live">
              Live bar karaoke
            </Link>
            <Link className="rounded-2xl bg-white/[0.06] p-4 font-bold text-white hover:bg-white/[0.1]" href="/find-karaoke?type=private-room">
              Private karaoke rooms
            </Link>
            <Link className="rounded-2xl bg-white/[0.06] p-4 font-bold text-white hover:bg-white/[0.1]" href="/submit-listing">
              Submit a missing karaoke night
            </Link>
          </div>
        </aside>
      </section>

      <section className="mt-16 grid gap-5 md:grid-cols-3">
        {page.sections.map((section) => (
          <article key={section.heading} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-2xl font-black text-white">{section.heading}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{section.body}</p>
          </article>
        ))}
      </section>

      {featuredVenues.length > 0 ? (
        <section className="mt-16">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
                Local Listings
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">Start with these karaoke listings</h2>
            </div>
            <Link href="/find-karaoke" className="text-sm font-bold text-cyan-200 hover:text-cyan-100">
              View all listings →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredVenues.map((venue) => (
              <VenueMiniCard key={venue.id} venue={venue} />
            ))}
          </div>
        </section>
      ) : null}

      {neighborhoods.length > 0 ? (
        <section className="mt-16">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
            Neighborhoods
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">Browse karaoke by San Diego area</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {neighborhoods.slice(0, 6).map((neighborhood) => (
              <NeighborhoodCard key={neighborhood.slug} neighborhood={neighborhood} />
            ))}
          </div>
        </section>
      ) : null}

      {guides.length > 0 ? (
        <section className="mt-16">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
            SingHUB Guides
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">Useful karaoke content, not filler</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {guides.slice(0, 6).map((post) => (
              <GuideCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-16 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">FAQ</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {page.faqs.map((faq) => (
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
