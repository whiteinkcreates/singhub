import type { Metadata } from "next";
import { VenueDirectoryExperience } from "@/components/v2/VenueDirectoryExperience";
import { getDiscoveryData } from "@/lib/v2/data";
import { getHostMediaSettings } from "@/lib/hostMedia.server";
import { SITE_VENUES_HERO_KEY } from "@/lib/hostMedia";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Karaoke Tonight in San Diego | SingHUB",
  description: "Discover karaoke happening tonight in San Diego.",
  alternates: { canonical: "/karaoke-tonight-san-diego" },
};
export default async function TonightPage() {
  const [{ rows }, hero] = await Promise.all([
    getDiscoveryData(),
    getHostMediaSettings(SITE_VENUES_HERO_KEY).catch(() => null),
  ]);
  return <VenueDirectoryExperience rows={rows} initialDay="tonight" heroUrl={hero?.heroUrl} heroAlt={hero?.heroAlt} heroPosition={hero?.heroPosition} heroPlacement={hero?.heroPlacement} />;
}
