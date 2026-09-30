import type { VenueListing } from "@/types";

export type HotelGuide = {
  slug: string;
  name: string;
  shortName: string;
  area: "downtown" | "la-jolla" | "la-mesa";
  address: string;
  latitude: number;
  longitude: number;
  heroImageUrl?: string;
  heroAlt?: string;
  heroPosition?: import("@/lib/venueEnhancements").HeroPosition;
  wordmarkImageUrl?: string;
  wordmarkSourceUrl?: string;
  wordmarkStatus?: "ready" | "cleanup" | "partner-file";
  wordmarkInvert?: boolean;
  heroFallback: "downtown" | "coast";
  walkableMiles?: number;
  quickTripMiles?: number;
  standoutMiles?: number;
};

const downtown: HotelGuide[] = [
  { slug: "pendry-san-diego", name: "Pendry San Diego", shortName: "The Pendry", area: "downtown", address: "550 J St, San Diego, CA 92101", latitude: 32.7083, longitude: -117.1594, heroImageUrl: "https://uploads.pendry.com/redesign/wp-content/uploads/sites/2/2018/12/10211411/1-4.jpeg", wordmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Pendry_Hotels_Logo.png", wordmarkSourceUrl: "https://www.pendry.com/san-diego/media/", wordmarkStatus: "ready", wordmarkInvert: true, heroFallback: "downtown" },
  { slug: "hard-rock-san-diego", name: "Hard Rock Hotel San Diego", shortName: "Hard Rock", area: "downtown", address: "207 5th Ave, San Diego, CA 92101", latitude: 32.7077, longitude: -117.1600, heroImageUrl: "https://hotel.hardrock.com/san-diego/files/6076/HRSD_Exterior_2200x1467.jpg", wordmarkSourceUrl: "https://hotel.hardrock.com/san-diego/files/6076/HRSD_RoomServiceMenu_8.5x11_2023.pdf", wordmarkStatus: "cleanup", heroFallback: "downtown" },
  { slug: "hilton-gaslamp", name: "Hilton San Diego Gaslamp Quarter", shortName: "Hilton Gaslamp", area: "downtown", address: "401 K St, San Diego, CA 92101", latitude: 32.7088, longitude: -117.1617, heroFallback: "downtown" },
  { slug: "ac-hotel-gaslamp", name: "AC Hotel San Diego Downtown Gaslamp Quarter", shortName: "AC Hotel Gaslamp", area: "downtown", address: "743 5th Ave, San Diego, CA 92101", latitude: 32.7130, longitude: -117.1599, wordmarkSourceUrl: "https://cache.marriott.com/content/dam/marriott-digital/ar/global-brand-exclusive/en_us/logo/assets/ar-mi-brand-page-ar-log18527-51041.jpg", wordmarkStatus: "cleanup", heroFallback: "downtown" },
  { slug: "margaritaville-gaslamp", name: "Margaritaville Hotel San Diego Gaslamp Quarter", shortName: "Margaritaville", area: "downtown", address: "435 6th Ave, San Diego, CA 92101", latitude: 32.7101, longitude: -117.1581, wordmarkSourceUrl: "https://www.margaritavilleresorts.com/margaritaville-hotel-san-diego/", wordmarkStatus: "partner-file", heroFallback: "downtown" },
  { slug: "andaz-san-diego", name: "Andaz San Diego", shortName: "Andaz", area: "downtown", address: "600 F St, San Diego, CA 92101", latitude: 32.7133, longitude: -117.1591, wordmarkSourceUrl: "https://newsroom.hyatt.com/Press-Kit", wordmarkStatus: "cleanup", heroFallback: "downtown" },
  { slug: "omni-san-diego", name: "Omni San Diego Hotel at the Ballpark", shortName: "Omni San Diego", area: "downtown", address: "675 L St, San Diego, CA 92101", latitude: 32.7069, longitude: -117.1588, wordmarkImageUrl: "https://www.omnihotels.com/sitecore/media%20library/Images/hotels/sandtn/DIGEX/LOGO/SanDiego-logo-white-290x90png?sc_database=web", wordmarkSourceUrl: "https://www.omnihotels.com/hotels/san-diego", wordmarkStatus: "ready", heroFallback: "downtown" },
  { slug: "marriott-gaslamp", name: "San Diego Marriott Gaslamp Quarter", shortName: "Marriott Gaslamp", area: "downtown", address: "660 K St, San Diego, CA 92101", latitude: 32.7079, longitude: -117.1586, wordmarkSourceUrl: "https://cache.marriott.com/content/dam/marriott-digital/mc/global-brand-exclusive/de_de/logo/assets/mc-mi-brand-page-mc-log17979-46832.jpg", wordmarkStatus: "cleanup", heroFallback: "downtown" },
  { slug: "residence-inn-gaslamp", name: "Residence Inn San Diego Downtown/Gaslamp Quarter", shortName: "Residence Inn Gaslamp", area: "downtown", address: "356 6th Ave, San Diego, CA 92101", latitude: 32.7098, longitude: -117.1581, wordmarkSourceUrl: "https://cache.marriott.com/is/image/marriotts7prod/ri-mi-brand-page-ri-log06839-45003", wordmarkStatus: "cleanup", heroFallback: "downtown" },
  { slug: "hotel-indigo-gaslamp", name: "Hotel Indigo San Diego-Gaslamp Quarter", shortName: "Hotel Indigo", area: "downtown", address: "509 9th Ave, San Diego, CA 92101", latitude: 32.7105, longitude: -117.1561, wordmarkSourceUrl: "https://development.ihg.com/sites/ihgplc/files/IHG/EMEAA/hotel-indigo.png", wordmarkStatus: "cleanup", heroFallback: "downtown" },
  { slug: "moxy-gaslamp", name: "Moxy San Diego Downtown/Gaslamp Quarter", shortName: "Moxy Gaslamp", area: "downtown", address: "831 6th Ave, San Diego, CA 92101", latitude: 32.7147, longitude: -117.1590, wordmarkSourceUrl: "https://cache.marriott.com/content/dam/marriott-digital/ox/global-brand-exclusive/en_us/logo/assets/ox-mi-brand-page-ox-log64332-07884.jpg", wordmarkStatus: "cleanup", heroFallback: "downtown" },
  { slug: "horton-grand", name: "Horton Grand Hotel", shortName: "Horton Grand", area: "downtown", address: "311 Island Ave, San Diego, CA 92101", latitude: 32.7105, longitude: -117.1613, wordmarkSourceUrl: "https://www.hortongrand.com/", wordmarkStatus: "partner-file", heroFallback: "downtown" },
  { slug: "palihotel-san-diego", name: "Palihotel San Diego", shortName: "Palihotel", area: "downtown", address: "830 6th Ave, San Diego, CA 92101", latitude: 32.7146, longitude: -117.1590, wordmarkSourceUrl: "https://s3.amazonaws.com/palisocietyv3/sd_badge_3-1695224403882.png", wordmarkStatus: "cleanup", heroFallback: "downtown" },
  { slug: "us-grant", name: "THE US GRANT, a Luxury Collection Hotel", shortName: "THE US GRANT", area: "downtown", address: "326 Broadway, San Diego, CA 92101", latitude: 32.7156, longitude: -117.1616, wordmarkSourceUrl: "https://www.marriott.com/en-us/hotels/sanlc-the-us-grant-a-luxury-collection-hotel-san-diego/overview/", wordmarkStatus: "cleanup", heroFallback: "downtown" },
  { slug: "westin-gaslamp", name: "The Westin San Diego Gaslamp Quarter", shortName: "Westin Gaslamp", area: "downtown", address: "910 Broadway Cir, San Diego, CA 92101", latitude: 32.7150, longitude: -117.1632, wordmarkSourceUrl: "https://cache.marriott.com/content/dam/marriott-digital/wi/global-brand-exclusive/en_us/logo/assets/wi-mi-brand-page-wi-log71095-24388.jpg", wordmarkStatus: "cleanup", heroFallback: "downtown" },
];

const laJolla: HotelGuide[] = [
  { slug: "la-valencia", name: "La Valencia Hotel", shortName: "La Valencia", area: "la-jolla", address: "1132 Prospect St, La Jolla, CA 92037", latitude: 32.8480, longitude: -117.2733, heroImageUrl: "https://assets.milestoneinternet.com/cdn-cgi/image/f%3Dauto/pacifica-host-hotels/la-valencia-hotel/site-images/meetings/pink-hotel-with-a-domed-tower.jpg?cropH=1500&cropW=4800&cropY=485&height=450&width=1440", wordmarkImageUrl: "https://la-valencia-hotel.myshopify.com/cdn/shop/files/LV_08-Hotel-and-Spa-MainLogo_Red.png?v=1768343477", wordmarkSourceUrl: "https://www.lavalencia.com/", wordmarkStatus: "ready", heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "grande-colonial", name: "Grande Colonial", shortName: "Grande Colonial", area: "la-jolla", address: "910 Prospect St, La Jolla, CA 92037", latitude: 32.8464, longitude: -117.2747, heroImageUrl: "https://thegrandecolonial.com/wp-content/uploads/2024/03/11202024_DroneExteriors_GrandeColonial_02.jpg", wordmarkSourceUrl: "https://thegrandecolonial.com/wp-content/uploads/2024/02/La-Jolla-Map.pdf", wordmarkStatus: "cleanup", heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "pantai-inn", name: "Pantai Inn", shortName: "Pantai Inn", area: "la-jolla", address: "1003 Coast Blvd, La Jolla, CA 92037", latitude: 32.8471, longitude: -117.2762, wordmarkSourceUrl: "https://pantai.com/", wordmarkStatus: "cleanup", heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "orli-la-jolla", name: "Orli La Jolla", shortName: "Orli", area: "la-jolla", address: "7753 Draper Ave, La Jolla, CA 92037", latitude: 32.8433, longitude: -117.2742, wordmarkImageUrl: "https://orlidev.wpengine.com/wp-content/uploads/2022/07/orli-no-location.svg", wordmarkSourceUrl: "https://stayorli.com/", wordmarkStatus: "ready", heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "cormorant-la-jolla", name: "Cormorant Boutique Hotel", shortName: "Cormorant", area: "la-jolla", address: "1110 Prospect St, La Jolla, CA 92037", latitude: 32.8475, longitude: -117.2740, wordmarkImageUrl: "https://www.cormorantlajolla.com/wp-content/uploads/cormorant_stackedwhite.png", wordmarkSourceUrl: "https://www.cormorantlajolla.com/", wordmarkStatus: "ready", heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "inn-by-the-sea-la-jolla", name: "Inn by the Sea La Jolla", shortName: "Inn by the Sea", area: "la-jolla", address: "7830 Fay Ave, La Jolla, CA 92037", latitude: 32.8448, longitude: -117.2740, wordmarkSourceUrl: "https://www.innbytheseaatlajolla.com/styleguide", wordmarkStatus: "partner-file", heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "hotel-la-jolla", name: "Hotel La Jolla, Curio Collection by Hilton", shortName: "Hotel La Jolla", area: "la-jolla", address: "7955 La Jolla Shores Dr, La Jolla, CA 92037", latitude: 32.8550, longitude: -117.2539, wordmarkSourceUrl: "https://www.hilton.com/en/hotels/sancuqq-hotel-la-jolla/", wordmarkStatus: "cleanup", heroFallback: "coast", walkableMiles: 1, quickTripMiles: 6, standoutMiles: 10 },
  { slug: "la-jolla-beach-tennis-club", name: "La Jolla Beach & Tennis Club", shortName: "La Jolla Beach & Tennis Club", area: "la-jolla", address: "2000 Spindrift Dr, La Jolla, CA 92037", latitude: 32.8572, longitude: -117.2570, wordmarkSourceUrl: "https://www.ljbtc.com/wp-content/uploads/2025/02/LJBTC-Wedding-Packages.pdf", wordmarkStatus: "cleanup", heroFallback: "coast", walkableMiles: 1, quickTripMiles: 6, standoutMiles: 10 },
];


const laMesa: HotelGuide[] = [
  {
    slug: "holiday-inn-express-la-mesa",
    name: "Holiday Inn Express La Mesa near SDSU",
    shortName: "Holiday Inn Express La Mesa",
    area: "la-mesa",
    address: "8000 Parkway Drive, La Mesa, CA 91942",
    latitude: 32.77495,
    longitude: -117.0259,
    heroImageUrl: "https://digital.ihg.com/is/image/ihg/holiday-inn-express-la-mesa-8924019411-4x3",
    wordmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/75/Holiday_Inn_Express_by_IHG_logo.svg",
    wordmarkSourceUrl: "https://development.ihg.com/sites/ihgplc/files/IHG/americas/logo/holiday-inn-express-logo-img.png",
    wordmarkStatus: "ready",
    heroFallback: "downtown",
    walkableMiles: 0.7,
    quickTripMiles: 3.5,
    standoutMiles: 8,
  },
];

export const hotelGuides = [...downtown, ...laJolla, ...laMesa];

export function getHotelGuide(slug: string) {
  return hotelGuides.find((hotel) => hotel.slug === slug);
}

export function getHotelGuidesByArea(area: HotelGuide["area"]) {
  return hotelGuides.filter((hotel) => hotel.area === area);
}

export function isHotelGuideVenueCandidate(venue: VenueListing) {
  return venue.latitude !== null && venue.longitude !== null && venue.venueType !== "event_producer";
}
