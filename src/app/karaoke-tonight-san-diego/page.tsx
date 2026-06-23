import { LocalSeoPageView } from "@/components/seo/LocalSeoPageView";
import { getVenueListings } from "@/lib/venueData";
import { getLocalSeoPage, guidePosts, neighborhoodSeoPages } from "@/lib/seoContent";

const page = getLocalSeoPage("karaoke-tonight-san-diego");

export const metadata = {
  title: page?.metaTitle,
  description: page?.description,
  alternates: {
    canonical: "/karaoke-tonight-san-diego",
  },
};

export default function KaraokeTonightSanDiegoPage() {
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
