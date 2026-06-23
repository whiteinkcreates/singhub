import { LocalSeoPageView } from "@/components/seo/LocalSeoPageView";
import { getVenueListings } from "@/lib/venueData";
import { getLocalSeoPage, guidePosts, neighborhoodSeoPages } from "@/lib/seoContent";

const page = getLocalSeoPage("san-diego-karaoke");

export const metadata = {
  title: page?.metaTitle,
  description: page?.description,
  alternates: {
    canonical: "/san-diego-karaoke",
  },
};

export default function SanDiegoKaraokePage() {
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
