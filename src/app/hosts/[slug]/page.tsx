export const revalidate = 300;
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getActiveSingBoardFlyers } from "@/lib/singboard/repository";
import { HostProfileTemplate } from "@/components/host/HostProfileTemplate";
import { getActiveHosts, getHostBySlug } from "@/lib/hostData";

type HostProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const hosts = await getActiveHosts();
  return hosts.map((host) => ({ slug: host.slug }));
}

export async function generateMetadata({ params }: HostProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const host = await getHostBySlug(slug);

  if (!host) return { title: "Karaoke Host | SingHUB" };

  const title = `${host.publicDisplayName} Karaoke Schedule | SingHUB`;
  const description = host.bio || `See where ${host.publicDisplayName} is hosting karaoke this week in San Diego on SingHUB.`;
  const image = host.profileImageUrl || host.heroImageUrl || host.directoryHeroImageUrl || host.logoUrl || "/images/og/singhub-og.png";

  return {
    title,
    description,
    alternates: { canonical: `/hosts/${host.slug}` },
    openGraph: {
      type: "website",
      url: `/hosts/${host.slug}`,
      siteName: "SingHUB",
      title,
      description,
      images: [{ url: image, alt: `${host.publicDisplayName} on SingHUB` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function HostProfilePage({ params }: HostProfilePageProps) {
  const { slug } = await params;
  const host = await getHostBySlug(slug);
  if (!host) notFound();
  const posts = await getActiveSingBoardFlyers().catch(() => []);
  const related = posts.filter(post => post.reviewStatus === "verified" && post.hostId === host.hostId);
  return <>
    <HostProfileTemplate host={host} />
    {related.length>0&&<section className="mx-auto max-w-6xl px-4 py-8 text-white" aria-labelledby="kj-singboard-heading">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 id="kj-singboard-heading" className="text-2xl font-black">On SingBOARD</h2><Link href="/singboard" className="text-sm font-bold text-cyan-300">Browse SingBOARD →</Link></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{related.map(post=><Link key={post.id} href={`/events/${post.id}`} className="flex gap-3 rounded-2xl border border-white/15 bg-[#111827] p-3 hover:border-cyan-300/50">
        {post.imageUrl?<img src={post.imageUrl} alt="" className="h-20 w-16 shrink-0 rounded-lg object-cover"/>:<div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/20 text-2xl">🎤</div>}
        <div><strong className="line-clamp-2">{post.title}</strong><p className="mt-1 text-xs text-slate-300">{post.venue} · {post.eventDate}</p></div>
      </Link>)}</div>
    </section>}
  </>;
}
