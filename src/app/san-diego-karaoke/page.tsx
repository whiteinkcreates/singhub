import { LocalSeoPageView } from "@/components/seo/LocalSeoPageView";
import { V2IndexHero } from "@/components/layout/V2IndexHero";
import { getPublicIndexHero } from "@/lib/v2/indexHero.server";
import { SITE_SAN_DIEGO_KARAOKE_HERO_KEY } from "@/lib/hostMedia";
import { getSanDiegoPublicVenues } from "@/lib/sanDiegoMarket";
import { getVenueListings } from "@/lib/venueData";
import { getLocalSeoPage } from "@/lib/seoContent";

const page = getLocalSeoPage("san-diego-karaoke");

export const metadata = {
  title: page?.metaTitle,
  description: page?.description,
  alternates: {
    canonical: "/san-diego-karaoke",
  },
};

export default async function SanDiegoKaraokePage() {
  if (!page) return null;
  const [allVenues, hero] = await Promise.all([
    getVenueListings(),
    getPublicIndexHero(SITE_SAN_DIEGO_KARAOKE_HERO_KEY),
  ]);
  return (
    <div className="singhub-v2-index-page min-h-screen bg-[#050609] text-white">
      <V2IndexHero
        eyebrow={page.eyebrow}
        title={page.headline}
        description={page.intro}
        heroUrl={hero?.heroUrl}
        heroAlt={hero?.heroAlt}
        heroPosition={hero?.heroPosition}
        heroPlacement={hero?.heroPlacement}
        primaryHref={page.primaryCtaHref}
        primaryLabel={page.primaryCtaLabel}
      />
      <div className="singhub-v2-index-surface"><LocalSeoPageView page={page} venues={getSanDiegoPublicVenues(allVenues)} hideIntro /></div>
    </div>
  );
}
