import Link from "next/link";
import { NeighborhoodCard } from "@/components/seo/SeoCards";
import { neighborhoodSeoPages } from "@/lib/seoContent";

export const metadata = {
  title: "San Diego Karaoke Neighborhoods | SingHUB",
  description: "Browse San Diego karaoke by neighborhood and local scene vibe.",
  alternates: {
    canonical: "/neighborhoods",
  },
};

export default function NeighborhoodsPage() {
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
          Every San Diego karaoke area has a different personality. Use these guides to find the room that fits your night instead of wandering into the wrong chorus economy.
        </p>
        <Link
          href="/find-karaoke"
          className="mt-7 inline-block rounded-full bg-fuchsia-400 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-fuchsia-950/40 transition hover:-translate-y-0.5 hover:bg-fuchsia-300"
        >
          Find Karaoke Near You
        </Link>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {neighborhoodSeoPages.map((neighborhood) => (
          <NeighborhoodCard key={neighborhood.slug} neighborhood={neighborhood} />
        ))}
      </section>
    </main>
  );
}
