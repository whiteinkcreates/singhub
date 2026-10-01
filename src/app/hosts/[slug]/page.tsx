export const revalidate = 300;
import { notFound } from "next/navigation";
import { HostProfileTemplate } from "@/components/host/HostProfileTemplate";
import { getActiveHosts, getHostBySlug } from "@/lib/hostData";

type HostProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const hosts = await getActiveHosts();
  return hosts.map((host) => ({ slug: host.slug }));
}

export async function generateMetadata({ params }: HostProfilePageProps) {
  const { slug } = await params;
  const host = await getHostBySlug(slug);

  if (!host) {
    return {
      title: "Karaoke Host | SingHUB",
    };
  }

  const description =
    host.bio ||
    `See where ${host.publicDisplayName} is hosting karaoke this week in San Diego on SingHUB.`;

  return {
    title: `${host.publicDisplayName} Karaoke Schedule | SingHUB`,
    description,
    alternates: {
      canonical: `/hosts/${host.slug}`,
    },
    openGraph: {
      title: `${host.publicDisplayName} Karaoke Schedule | SingHUB`,
      description,
      images: [host.profileImageUrl || host.logoUrl || "/images/og/singhub-og.png"],
    },
  };
}

export default async function HostProfilePage({ params }: HostProfilePageProps) {
  const { slug } = await params;
  const host = await getHostBySlug(slug);
  if (!host) notFound();
  return <HostProfileTemplate host={host} />;
}
