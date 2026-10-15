import { notFound } from "next/navigation";
import { daySeoPages, getDaySeoPage } from "@/lib/seoContent";
import { VenueDirectoryExperience } from "@/components/v2/VenueDirectoryExperience";
import { getDiscoveryData } from "@/lib/v2/data";
import { getHostMediaSettings } from "@/lib/hostMedia.server";
import { SITE_DISCOVERY_HERO_KEY } from "@/lib/hostMedia";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return daySeoPages.map(page => ({ day: page.slug })); }
type Props = { params: Promise<{ day: string }> };
export async function generateMetadata({ params }: Props) {
  const { day } = await params;
  const page = getDaySeoPage(day);
  if (!page) return {};
  return { title: page.metaTitle, description: page.description, alternates: { canonical: `/karaoke/${page.slug}` } };
}
export default async function DayPage({ params }: Props) {
  const { day } = await params;
  const page = getDaySeoPage(day);
  if (!page) notFound();
  const [{ rows }, hero] = await Promise.all([
    getDiscoveryData(),
    getHostMediaSettings(SITE_DISCOVERY_HERO_KEY).catch(() => null),
  ]);
  return <VenueDirectoryExperience rows={rows} initialDay={page.day} heroUrl={hero?.heroUrl} heroAlt={hero?.heroAlt} heroPosition={hero?.heroPosition} heroPlacement={hero?.heroPlacement} />;
}
