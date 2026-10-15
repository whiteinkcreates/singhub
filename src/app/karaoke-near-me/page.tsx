import type { Metadata } from "next";
import { VenueDirectoryExperience } from "@/components/v2/VenueDirectoryExperience";
import { getDiscoveryData } from "@/lib/v2/data";
import { getHostMediaSettings } from "@/lib/hostMedia.server";
import { SITE_VENUES_HERO_KEY } from "@/lib/hostMedia";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Karaoke Near Me in San Diego Tonight | SingHUB",
  description: "Find karaoke bars, private rooms, and recurring karaoke nights across San Diego.",
  alternates: { canonical: "/karaoke-near-me" },
};
export default async function KaraokeNearMePage() {
  const [{ rows }, hero] = await Promise.all([
    getDiscoveryData(),
    getHostMediaSettings(SITE_VENUES_HERO_KEY).catch(() => null),
  ]);
  return <VenueDirectoryExperience rows={rows} initialDay="" heroUrl={hero?.heroUrl} heroAlt={hero?.heroAlt} heroPosition={hero?.heroPosition} heroPlacement={hero?.heroPlacement} />;
}
