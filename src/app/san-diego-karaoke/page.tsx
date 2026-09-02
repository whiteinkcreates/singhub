import { LocalSeoPageView } from "@/components/seo/LocalSeoPageView";
import { getSanDiegoPublicVenues } from "@/lib/sanDiegoMarket";
import { getVenueListings } from "@/lib/venueData";
import { getLocalSeoPage, guidePosts } from "@/lib/seoContent";

const page = getLocalSeoPage("san-diego-karaoke");

export const metadata = {
  title: page?.metaTitle,
  description: page?.description,
  alternates: {
    canonical: "/san-diego-karaoke",
  },
};

export default async function SanDiegoKaraokePage() {
  if (!page) {
    return null;
  }

  return (
    <LocalSeoPageView
      page={page}
      venues={getSanDiegoPublicVenues(await getVenueListings())}
      guides={guidePosts}
    />
  );
}
