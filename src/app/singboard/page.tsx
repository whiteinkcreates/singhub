import type { Metadata } from "next";
import { PositionedImage } from "@/components/media/PositionedImage";
import { HeroScrollCue } from "@/components/layout/HeroScrollCue";
import { SINGBOARD_STICKER_ART } from "@/lib/singboardStickerArt";
import { getHostMediaSettings } from "@/lib/hostMedia.server";
import { SITE_SINGBOARD_HERO_KEY } from "@/lib/hostMedia";
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
  const [flyers, venueRows, hostRows, boardHero] = await Promise.all([
    getActiveSingBoardFlyers(),
    getVenueListings(),
    getActiveHosts({includeMedia:false}).catch(() => []),
    getHostMediaSettings(SITE_SINGBOARD_HERO_KEY).catch(() => null),
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
    <section data-page-hero="" className="sb-hero" aria-labelledby="singboard-hero-title">
      <div data-board-hero-frame="" className="sb-hero__frame">
        <PositionedImage
          src={boardHero?.heroUrl || SINGBOARD_STICKER_ART}
          alt={boardHero?.heroAlt || "SingBOARD sticker wall"}
          placement={boardHero?.heroPlacement}
          position={boardHero?.heroPosition}
          className="sb-hero__image"
        />
        <div className="sb-hero__shade" aria-hidden="true" />
        <div className="sb-hero__layout">
          <div data-hero-copy="" className="sb-hero__copy">
            <p className="sb-hero__eyebrow">SAN DIEGO KARAOKE COMMUNITY</p>
            <h1 id="singboard-hero-title">SingBOARD</h1>
            <p className="sb-hero__description">Karaoke flyers, meetups, special events and community updates from San Diego venues and KJs.</p>
          </div>
        </div>
      </div>
      <HeroScrollCue />
    </section>
    <section data-page-surface="" className="sb-surface" aria-label="SingBOARD events and notices">
      <div className="sb-shell">
        <LivingSingBoard initialFlyers={listings} venues={venues} hosts={hosts}/>
      </div>
    </section>
  </main>;
}
