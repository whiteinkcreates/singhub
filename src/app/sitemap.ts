import type { MetadataRoute } from "next";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { daySeoPages, guidePosts, localSeoPages, neighborhoodSeoPages } from "@/lib/seoContent";
import { getVenueListings } from "@/lib/venueData";

const SITE_URL = "https://singhub.app";

function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ["/", "/find-karaoke", "/submit-listing", "/claim-listing", "/venues/premium", "/guides", "/neighborhoods"];
  const localRoutes = localSeoPages.map((page) => page.path);
  const dayRoutes = daySeoPages.map((page) => `/karaoke/${page.slug}`);
  const neighborhoodRoutes = neighborhoodSeoPages.map((page) => `/neighborhoods/${page.slug}`);
  const guideRoutes = guidePosts.map((post) => `/guides/${post.slug}`);
  const venueRoutes = getPublicVenues(getVenueListings())
    .filter((venue) => venue.slug && venue.venueName && !venue.venueName.toLowerCase().includes("tbd"))
    .map((venue) => `/venues/${venue.slug}`);

  return [...staticRoutes, ...localRoutes, ...dayRoutes, ...neighborhoodRoutes, ...guideRoutes, ...venueRoutes].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path.startsWith("/guides") ? "weekly" : "daily",
    priority: path === "/" || path === "/karaoke-near-me" ? 1 : 0.7,
  }));
}
