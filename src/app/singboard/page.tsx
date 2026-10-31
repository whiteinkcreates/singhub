import type { Metadata } from "next";
import { LivingSingBoard, type HostChoice, type VenueChoice } from "@/components/singboard/LivingSingBoard";
import { getActiveSingBoardFlyers } from "@/lib/singboard/repository";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getVenueListings } from "@/lib/venueData";
import { getActiveHosts } from "@/lib/hostData";
import "@/components/singboard/living-board.css";

export const metadata: Metadata = {
  title: "SingBOARD | SingHUB",
  description: "Real San Diego karaoke events, special nights, meetups, flyers, and community notices.",
  alternates: { canonical: "/singboard" },
};
export const dynamic = "force-dynamic";

function regionFor(neighborhood: string): VenueChoice["region"] {
  const name = neighborhood.toLowerCase();
  if (/gaslamp|downtown|east village|little italy|marina district/.test(name)) return "downtown";
  if (/la mesa|el cajon|santee|spring valley|lakeside|alpine|lemon grove/.test(name)) return "east-county";
  if (/ocean beach|pacific beach|mission beach|point loma/.test(name)) return "beach";
  if (/encinitas|carlsbad|oceanside|vista|escondido|poway|san marcos/.test(name)) return "north-county";
  if (/chula vista|national city|imperial beach|bonita/.test(name)) return "south-bay";
  return "central";
}

// Use registered venue photography only. No AI-generated or invented venue signs.
const MESA_PHOTO = "https://res.cloudinary.com/dy3lyejkk/image/upload/v1791249550/singhub/venues/the-mesa/e9pqrecg4md6bhufq49e.jpg";

export default async function SingBoardPage() {
  const [flyers, venueRows, hostRows] = await Promise.all([
    getActiveSingBoardFlyers(),
    getVenueListings(),
    getActiveHosts({includeMedia:false}).catch(() => []),
  ]);
  const venues:VenueChoice[] = getPublicVenues(venueRows).map(venue=>({
    slug:venue.slug,name:venue.venueName,neighborhood:venue.neighborhood,
    region:regionFor(venue.neighborhood),
    imageUrl:venue.bannerImageUrl || (venue.slug==="the-mesa" ? MESA_PHOTO : undefined),
  }));
  const hosts:HostChoice[] = hostRows.map(host=>({
    id:host.hostId,slug:host.slug,name:host.publicDisplayName,otherName:host.hostName,
  }));
  const byId = new Map(hosts.map(host=>[host.id,host.slug]));
  const byVenueSlug = new Map(venues.map(venue=>[venue.slug,venue]));
  const listings=flyers.map(post=>({
    ...post,
    hostSlug:post.hostId?byId.get(post.hostId):undefined,
    venuePhoto:post.venueSlug?byVenueSlug.get(post.venueSlug)?.imageUrl:undefined,
  }));

  return <main data-scroll-page="singboard" className="sb-page">
    <header className="sb-masthead">
      <div className="sb-masthead__inner">
        <div className="sb-masthead__brand">
          <img src="/images/singhub-v2/singhub-wordmark.png" alt="SingHUB" className="sb-wordmark"/>
          <h1 className="sb-paper">SingBOARD</h1>
          <p className="sb-masthead__sub">San Diego karaoke events, meetups, and community.</p>
        </div>
        <p aria-hidden="true" className="sb-graffiti">PEOPLE<br/>SONGS<br/>PLACES<br/>COMMUNITY</p>
      </div>
    </header>
    <section className="sb-shell" aria-label="SingBOARD events and notices">
      <LivingSingBoard initialFlyers={listings} venues={venues} hosts={hosts}/>
    </section>
  </main>;
}
