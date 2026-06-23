import Link from "next/link";
import { notFound } from "next/navigation";
import { guidePosts, getGuidePost } from "@/lib/seoContent";

export function generateStaticParams() {
  return guidePosts.map((post) => ({ slug: post.slug }));
}

type GuidePageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateMetadata({ params }: GuidePageProps) {
  const resolvedParams = await params;
  const post = getGuidePost(resolvedParams.slug);

  if (!post) {
    return {};
  }

  return {
    title: post.metaTitle,
    description: post.description,
    alternates: {
      canonical: `/guides/${post.slug}`,
    },
  };
}

export default async function GuidePostPage({ params }: GuidePageProps) {
  const resolvedParams = await params;
  const post = getGuidePost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = guidePosts
    .filter((guidePost) => guidePost.slug !== post.slug)
    .filter((guidePost) => guidePost.category === post.category)
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 md:py-20">
      <article>
        <Link href="/guides" className="text-sm font-bold text-cyan-200 hover:text-cyan-100">
          ← All guides
        </Link>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-fuchsia-300">
          {post.category}
        </p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
          {post.title}
        </h1>
        <p className="mt-5 text-xl font-black text-cyan-200">{post.socialHook}</p>
        <p className="mt-5 text-lg leading-8 text-slate-300">{post.intro}</p>

        <div className="mt-10 grid gap-5">
          {post.sections.map((section) => (
            <section key={section.heading} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black text-white">{section.heading}</h2>
              <p className="mt-3 text-base leading-8 text-slate-300">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-[1.5rem] border border-fuchsia-300/30 bg-fuchsia-950/20 p-6">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
            Takeaway
          </p>
          <p className="mt-3 text-xl font-black leading-8 text-white">{post.takeaway}</p>
        </section>
      </article>

      <section className="mt-12 rounded-[2rem] border border-cyan-300/20 bg-slate-900/80 p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
          Next Step
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">Turn the guide into action</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Find a karaoke night, submit a missing listing, or turn this guide into a social post for the SingHUB feed.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/find-karaoke"
            className="rounded-full bg-fuchsia-400 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-fuchsia-950/40 transition hover:-translate-y-0.5 hover:bg-fuchsia-300"
          >
            Find Karaoke
          </Link>
          <Link
            href="/submit-listing"
            className="rounded-full border border-cyan-300/50 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/10"
          >
            Submit a Listing
          </Link>
        </div>
      </section>

      {relatedPosts.length > 0 ? (
        <section className="mt-12">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">
            Related Guides
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {relatedPosts.map((guidePost) => (
              <Link
                key={guidePost.slug}
                href={`/guides/${guidePost.slug}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-fuchsia-300/50"
              >
                <h3 className="text-xl font-black text-white">{guidePost.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{guidePost.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
