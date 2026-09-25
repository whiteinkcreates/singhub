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
  wordmarkImageUrl?: string;
  heroFallback: "downtown" | "coast";
  walkableMiles?: number;
  quickTripMiles?: number;
  standoutMiles?: number;
};

const downtown: HotelGuide[] = [
  { slug: "pendry-san-diego", name: "Pendry San Diego", shortName: "Pendry", area: "downtown", address: "550 J St, San Diego, CA 92101", latitude: 32.7083, longitude: -117.1594, heroImageUrl: "https://uploads.pendry.com/redesign/wp-content/uploads/sites/2/2018/12/10211411/1-4.jpeg", wordmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Pendry_Hotels_Logo.png", heroFallback: "downtown" },
  { slug: "hard-rock-san-diego", name: "Hard Rock Hotel San Diego", shortName: "Hard Rock", area: "downtown", address: "207 5th Ave, San Diego, CA 92101", latitude: 32.7077, longitude: -117.1600, heroImageUrl: "https://hotel.hardrock.com/san-diego/files/6076/HRSD_Exterior_2200x1467.jpg", heroFallback: "downtown" },
  { slug: "hilton-gaslamp", name: "Hilton San Diego Gaslamp Quarter", shortName: "Hilton Gaslamp", area: "downtown", address: "401 K St, San Diego, CA 92101", latitude: 32.7088, longitude: -117.1617, heroFallback: "downtown" },
  { slug: "ac-hotel-gaslamp", name: "AC Hotel San Diego Downtown Gaslamp Quarter", shortName: "AC Hotel Gaslamp", area: "downtown", address: "743 5th Ave, San Diego, CA 92101", latitude: 32.7130, longitude: -117.1599, heroFallback: "downtown" },
  { slug: "margaritaville-gaslamp", name: "Margaritaville Hotel San Diego Gaslamp Quarter", shortName: "Margaritaville", area: "downtown", address: "435 6th Ave, San Diego, CA 92101", latitude: 32.7101, longitude: -117.1581, heroFallback: "downtown" },
  { slug: "andaz-san-diego", name: "Andaz San Diego", shortName: "Andaz", area: "downtown", address: "600 F St, San Diego, CA 92101", latitude: 32.7133, longitude: -117.1591, heroFallback: "downtown" },
  { slug: "omni-san-diego", name: "Omni San Diego Hotel at the Ballpark", shortName: "Omni San Diego", area: "downtown", address: "675 L St, San Diego, CA 92101", latitude: 32.7069, longitude: -117.1588, heroFallback: "downtown" },
  { slug: "marriott-gaslamp", name: "San Diego Marriott Gaslamp Quarter", shortName: "Marriott Gaslamp", area: "downtown", address: "660 K St, San Diego, CA 92101", latitude: 32.7079, longitude: -117.1586, heroFallback: "downtown" },
  { slug: "residence-inn-gaslamp", name: "Residence Inn San Diego Downtown/Gaslamp Quarter", shortName: "Residence Inn Gaslamp", area: "downtown", address: "356 6th Ave, San Diego, CA 92101", latitude: 32.7098, longitude: -117.1581, heroFallback: "downtown" },
  { slug: "hotel-indigo-gaslamp", name: "Hotel Indigo San Diego-Gaslamp Quarter", shortName: "Hotel Indigo", area: "downtown", address: "509 9th Ave, San Diego, CA 92101", latitude: 32.7105, longitude: -117.1561, heroFallback: "downtown" },
  { slug: "moxy-gaslamp", name: "Moxy San Diego Downtown/Gaslamp Quarter", shortName: "Moxy Gaslamp", area: "downtown", address: "831 6th Ave, San Diego, CA 92101", latitude: 32.7147, longitude: -117.1590, heroFallback: "downtown" },
  { slug: "horton-grand", name: "Horton Grand Hotel", shortName: "Horton Grand", area: "downtown", address: "311 Island Ave, San Diego, CA 92101", latitude: 32.7105, longitude: -117.1613, heroFallback: "downtown" },
  { slug: "palihotel-san-diego", name: "Palihotel San Diego", shortName: "Palihotel", area: "downtown", address: "830 6th Ave, San Diego, CA 92101", latitude: 32.7146, longitude: -117.1590, heroFallback: "downtown" },
  { slug: "us-grant", name: "THE US GRANT, a Luxury Collection Hotel", shortName: "THE US GRANT", area: "downtown", address: "326 Broadway, San Diego, CA 92101", latitude: 32.7156, longitude: -117.1616, heroFallback: "downtown" },
  { slug: "westin-gaslamp", name: "The Westin San Diego Gaslamp Quarter", shortName: "Westin Gaslamp", area: "downtown", address: "910 Broadway Cir, San Diego, CA 92101", latitude: 32.7150, longitude: -117.1632, heroFallback: "downtown" },
];

const laJolla: HotelGuide[] = [
  { slug: "la-valencia", name: "La Valencia Hotel", shortName: "La Valencia", area: "la-jolla", address: "1132 Prospect St, La Jolla, CA 92037", latitude: 32.8480, longitude: -117.2733, heroImageUrl: "https://assets.milestoneinternet.com/cdn-cgi/image/f%3Dauto/pacifica-host-hotels/la-valencia-hotel/site-images/meetings/pink-hotel-with-a-domed-tower.jpg?cropH=1500&cropW=4800&cropY=485&height=450&width=1440", wordmarkImageUrl: "https://la-valencia-hotel.myshopify.com/cdn/shop/files/LV_08-Hotel-and-Spa-MainLogo_Red.png?v=1768343477", heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "grande-colonial", name: "Grande Colonial", shortName: "Grande Colonial", area: "la-jolla", address: "910 Prospect St, La Jolla, CA 92037", latitude: 32.8464, longitude: -117.2747, heroImageUrl: "https://thegrandecolonial.com/wp-content/uploads/2024/03/11202024_DroneExteriors_GrandeColonial_02.jpg", heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "pantai-inn", name: "Pantai Inn", shortName: "Pantai Inn", area: "la-jolla", address: "1003 Coast Blvd, La Jolla, CA 92037", latitude: 32.8471, longitude: -117.2762, heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "orli-la-jolla", name: "Orli La Jolla", shortName: "Orli", area: "la-jolla", address: "7753 Draper Ave, La Jolla, CA 92037", latitude: 32.8433, longitude: -117.2742, heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "cormorant-la-jolla", name: "Cormorant Boutique Hotel", shortName: "Cormorant", area: "la-jolla", address: "1110 Prospect St, La Jolla, CA 92037", latitude: 32.8475, longitude: -117.2740, heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "inn-by-the-sea-la-jolla", name: "Inn by the Sea La Jolla", shortName: "Inn by the Sea", area: "la-jolla", address: "7830 Fay Ave, La Jolla, CA 92037", latitude: 32.8448, longitude: -117.2740, heroFallback: "coast", quickTripMiles: 5, standoutMiles: 9 },
  { slug: "hotel-la-jolla", name: "Hotel La Jolla, Curio Collection by Hilton", shortName: "Hotel La Jolla", area: "la-jolla", address: "7955 La Jolla Shores Dr, La Jolla, CA 92037", latitude: 32.8550, longitude: -117.2539, heroFallback: "coast", walkableMiles: 1, quickTripMiles: 6, standoutMiles: 10 },
  { slug: "la-jolla-beach-tennis-club", name: "La Jolla Beach & Tennis Club", shortName: "La Jolla Beach & Tennis Club", area: "la-jolla", address: "2000 Spindrift Dr, La Jolla, CA 92037", latitude: 32.8572, longitude: -117.2570, heroFallback: "coast", walkableMiles: 1, quickTripMiles: 6, standoutMiles: 10 },
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
    wordmarkImageUrl: "https://development.ihg.com/sites/ihgplc/files/IHG/americas/logo/holiday-inn-express-logo-img.png",
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
