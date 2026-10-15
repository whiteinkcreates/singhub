export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HostProfileTemplate } from "@/components/host/HostProfileTemplate";
import {getActiveSingBoardFlyers} from "@/lib/singboard/repository";
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
  const allPosts=await getActiveSingBoardFlyers().catch(()=>[]);
  const posts=allPosts.filter(post=>post.hostId===host.hostId || post.hostId===host.slug);
  return <HostProfileTemplate host={host} posts={posts} />;
}
