import type { MetadataRoute } from "next";
import { getPublicVenues } from "@/lib/publicVenueFilters";
import { getSanDiegoPublicVenues } from "@/lib/sanDiegoMarket";
import { daySeoPages, guidePosts, localSeoPages } from "@/lib/seoContent";
import { getActiveHosts } from "@/lib/hostData";
import { getVenueListings } from "@/lib/venueData";

const SITE_URL = "https://singhub.app";

function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const venues = await getVenueListings();
  const hosts = await getActiveHosts();

  const staticRoutes = [
    "/",
    "/find-karaoke",
    "/places",
    "/hosts",
    "/singboard",
    "/scout",
    "/community/san-diego",
    "/submit-listing",
    "/claim-listing",
    "/venues/premium",
    "/guides",
    "/neighborhoods",
  ];
  const localRoutes = localSeoPages.map((page) => page.path);
  const dayRoutes = daySeoPages.map((page) => `/karaoke/${page.slug}`);
  const neighborhoodRoutes = [
    ...new Set(
      getSanDiegoPublicVenues(venues)
        .map((venue) => venue.neighborhood)
        .filter((neighborhood) => neighborhood && neighborhood !== "Multiple venues")
        .map((neighborhood) => `/neighborhoods/${slugify(neighborhood)}`),
    ),
  ];
  const guideRoutes = guidePosts.map((post) => `/guides/${post.slug}`);
  const venueRoutes = getPublicVenues(venues)
    .filter((venue) => venue.slug && venue.venueName && !venue.venueName.toLowerCase().includes("tbd"))
    .map((venue) => `/venues/${venue.slug}`);
  const hostRoutes = hosts.map((host) => `/hosts/${host.slug}`);

  return [...staticRoutes, ...localRoutes, ...dayRoutes, ...neighborhoodRoutes, ...guideRoutes, ...venueRoutes, ...hostRoutes].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path.startsWith("/guides") ? "weekly" : "daily",
    priority: path === "/" || path === "/karaoke-near-me" ? 1 : 0.7,
  }));
}
