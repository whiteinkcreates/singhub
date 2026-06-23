import { LocalSeoPageView } from "@/components/seo/LocalSeoPageView";
import { getVenueListings } from "@/lib/venueData";
import { getLocalSeoPage, guidePosts, neighborhoodSeoPages } from "@/lib/seoContent";

const page = getLocalSeoPage("karaoke-near-me");

export const metadata = {
  title: page?.metaTitle,
  description: page?.description,
  alternates: {
    canonical: "/karaoke-near-me",
  },
};

export default function KaraokeNearMePage() {
  if (!page) {
    return null;
  }

  return (
    <LocalSeoPageView
      page={page}
      venues={getVenueListings()}
      guides={guidePosts}
      neighborhoods={neighborhoodSeoPages}
    />
  );
}
