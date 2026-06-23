import Link from "next/link";
import { GuideCard } from "@/components/seo/SeoCards";
import { guidePosts } from "@/lib/seoContent";

export const metadata = {
  title: "San Diego Karaoke Guides | SingHUB",
  description: "Karaoke guides, etiquette, song ideas, host tips, and San Diego karaoke launch content from SingHUB.",
  alternates: {
    canonical: "/guides",
  },
};

export default function GuidesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 md:py-20">
      <section className="max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-fuchsia-300">
          SingHUB Guides
        </p>
        <h1 className="mt-4 text-4xl font-black text-white md:text-6xl">
          Karaoke content that can also become posts
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          These guides give SingHUB crawlable search content now and give the Instagram grid reusable source material later. Same brain, two channels, fewer creative tabs left open forever.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/find-karaoke"
            className="rounded-full bg-fuchsia-400 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-fuchsia-950/40 transition hover:-translate-y-0.5 hover:bg-fuchsia-300"
          >
            Find Karaoke Tonight
          </Link>
          <Link
            href="/submit-listing"
            className="rounded-full border border-cyan-300/50 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
          >
            Submit a Listing
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {guidePosts.map((post) => (
          <GuideCard key={post.slug} post={post} />
        ))}
      </section>
    </main>
  );
}
