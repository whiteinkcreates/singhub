import { hotelGuides, type HotelGuide } from "@/lib/hotelGuides";

export type HotelExperienceConfig = {
  slug: string;
  hotelGuideSlug: HotelGuide["slug"];
  hotelSiteUrl?: string;
  brandLogoUrl?: string;
  primaryColor: string;
  accentColor: string;
  pageBackground: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  headingFontFamily: string;
  bodyFontFamily: string;
  eyebrow: string;
  headline: string;
  intro: string;
};

type ExperienceOverride = Partial<Omit<HotelExperienceConfig, "slug" | "hotelGuideSlug">>;

const HOTEL_SITE_BY_GUIDE: Record<string, string> = {
  "pendry-san-diego": "https://www.pendry.com/san-diego/",
  "hard-rock-san-diego": "https://hotel.hardrock.com/san-diego/",
  "hilton-gaslamp": "https://www.hilton.com/en/hotels/sangqhf-hilton-san-diego-gaslamp-quarter/",
  "ac-hotel-gaslamp": "https://www.marriott.com/en-us/hotels/sanar-ac-hotel-san-diego-downtown-gaslamp-quarter/overview/",
  "margaritaville-gaslamp": "https://www.margaritavilleresorts.com/margaritaville-hotel-san-diego/",
  "andaz-san-diego": "https://www.hyatt.com/andaz/en-US/sanas-andaz-san-diego",
  "omni-san-diego": "https://www.omnihotels.com/hotels/san-diego",
  "marriott-gaslamp": "https://www.marriott.com/en-us/hotels/sangl-san-diego-marriott-gaslamp-quarter/overview/",
  "residence-inn-gaslamp": "https://www.marriott.com/en-us/hotels/sanrg-residence-inn-san-diego-downtown-gaslamp-quarter/overview/",
  "hotel-indigo-gaslamp": "https://www.ihg.com/hotelindigo/hotels/us/en/san-diego/sanis/hoteldetail",
  "moxy-gaslamp": "https://www.marriott.com/en-us/hotels/sanox-moxy-san-diego-downtown-gaslamp-quarter/overview/",
  "horton-grand": "https://www.hortongrand.com/",
  "palihotel-san-diego": "https://www.palisociety.com/hotels/san-diego",
  "us-grant": "https://www.marriott.com/en-us/hotels/sanlc-the-us-grant-a-luxury-collection-hotel-san-diego/overview/",
  "westin-gaslamp": "https://www.marriott.com/en-us/hotels/sanwi-the-westin-san-diego-gaslamp-quarter/overview/",
  "la-valencia": "https://www.lavalencia.com/",
  "grande-colonial": "https://thegrandecolonial.com/",
  "pantai-inn": "https://pantai.com/",
  "orli-la-jolla": "https://stayorli.com/",
  "cormorant-la-jolla": "https://www.cormorantlajolla.com/",
  "inn-by-the-sea-la-jolla": "https://www.innbytheseaatlajolla.com/",
  "hotel-la-jolla": "https://www.hilton.com/en/hotels/sancuqq-hotel-la-jolla/",
  "la-jolla-beach-tennis-club": "https://www.ljbtc.com/",
  "pacific-terrace": "https://www.pacificterrace.com/",
  "tower23": "https://www.t23hotel.com/",
  "wayfarer-san-diego": "https://www.wayfarersd.com/",
  "holiday-inn-express-la-mesa": "https://www.ihg.com/holidayinnexpress/hotels/us/en/la-mesa/sanpd/hoteldetail",
};

const AREA_THEME: Record<HotelGuide["area"], Pick<HotelExperienceConfig, "primaryColor" | "accentColor" | "pageBackground" | "surfaceColor" | "textColor" | "mutedTextColor">> = {
  downtown: {
    primaryColor: "#172338",
    accentColor: "#B7794A",
    pageBackground: "#F6F4F0",
    surfaceColor: "#FFFFFF",
    textColor: "#172338",
    mutedTextColor: "#637083",
  },
  beach: {
    primaryColor: "#123B4B",
    accentColor: "#D99B63",
    pageBackground: "#F4F8F8",
    surfaceColor: "#FFFFFF",
    textColor: "#133541",
    mutedTextColor: "#687A80",
  },
  "la-jolla": {
    primaryColor: "#15384A",
    accentColor: "#B88962",
    pageBackground: "#F3F8F9",
    surfaceColor: "#FFFFFF",
    textColor: "#15384A",
    mutedTextColor: "#61717A",
  },
  "la-mesa": {
    primaryColor: "#163B57",
    accentColor: "#6C9D65",
    pageBackground: "#F6F8F7",
    surfaceColor: "#FFFFFF",
    textColor: "#17324B",
    mutedTextColor: "#607180",
  },
};

const EXPERIENCE_OVERRIDES: Record<string, ExperienceOverride> = {
  "holiday-inn-express-la-mesa": {
    brandLogoUrl:
      "/images/hotel-branding/holiday-inn-express.svg",
    primaryColor: "#003B70",
    accentColor: "#68B231",
    pageBackground: "#F7F9FC",
    surfaceColor: "#FFFFFF",
    textColor: "#0A2D5A",
    mutedTextColor: "#52677D",
  },
  "pendry-san-diego": {
    primaryColor: "#1D1A18",
    accentColor: "#A98162",
    pageBackground: "#F4F1ED",
    textColor: "#1D1A18",
    mutedTextColor: "#756B63",
  },
  "horton-grand": {
    primaryColor: "#3A271E",
    accentColor: "#A9784B",
    pageBackground: "#F8F4ED",
    textColor: "#34251E",
    mutedTextColor: "#75685F",
    intro: "Step out of the Victorian calm and into tonight's San Diego karaoke scene. SingHUB keeps current local options organized around Horton Grand, from walkable Gaslamp rooms to standout nights worth a short ride.",
  },
  "palihotel-san-diego": {
    primaryColor: "#273024",
    accentColor: "#B46B52",
    pageBackground: "#F5F1E9",
    textColor: "#273024",
    mutedTextColor: "#6E716A",
    intro: "Palihotel puts you in the middle of the Gaslamp. SingHUB helps turn that location into a local karaoke night, with current options organized by distance, food, and the kind of room you actually want to walk into.",
  },
  "la-valencia": {
    primaryColor: "#822D3B",
    accentColor: "#C78A7C",
    pageBackground: "#FBF5F2",
    textColor: "#5A2830",
    mutedTextColor: "#7B6767",
  },
  "orli-la-jolla": {
    primaryColor: "#252421",
    accentColor: "#9C8768",
    pageBackground: "#F7F5F0",
    textColor: "#252421",
    mutedTextColor: "#6F6A62",
  },
  "cormorant-la-jolla": {
    primaryColor: "#183844",
    accentColor: "#C58C63",
    pageBackground: "#F5F8F7",
    textColor: "#183844",
    mutedTextColor: "#68777B",
  },
  "pacific-terrace": {
    primaryColor: "#254553",
    accentColor: "#C98555",
    pageBackground: "#F5F7F4",
    textColor: "#243C46",
    mutedTextColor: "#6C7777",
    intro: "Start with what is happening now, find a room that matches your vibe, or choose an easy food-and-karaoke option. SingHUB keeps the local karaoke information current for guests staying beachfront at Pacific Terrace Hotel.",
  },
  tower23: {
    primaryColor: "#20282B",
    accentColor: "#56AEB8",
    pageBackground: "#F4F7F7",
    textColor: "#20282B",
    mutedTextColor: "#687476",
    intro: "Pacific Beach already has the energy. SingHUB helps TOWER23 guests find where the microphones are tonight, from easy neighborhood options to karaoke worth a short ride.",
  },
  "wayfarer-san-diego": {
    primaryColor: "#1F5872",
    accentColor: "#E08D68",
    pageBackground: "#F3F8FA",
    textColor: "#20485C",
    mutedTextColor: "#6B7C84",
    intro: "You came to experience San Diego like a local. Start with karaoke happening tonight, match the room to your vibe, or find somewhere to grab food and sing without overthinking the night.",
  },
};

function directImageSource(value?: string) {
  if (!value) return undefined;
  return /\.(png|jpe?g|webp|svg)(\?.*)?$/i.test(value) || /\/is\/image\//i.test(value)
    ? value
    : undefined;
}

function makeExperience(hotel: HotelGuide): HotelExperienceConfig {
  const theme = AREA_THEME[hotel.area];
  const override = EXPERIENCE_OVERRIDES[hotel.slug] || {};
  const brandLogoUrl =
    override.brandLogoUrl ||
    hotel.wordmarkImageUrl ||
    directImageSource(hotel.wordmarkSourceUrl);

  return {
    slug: hotel.slug,
    hotelGuideSlug: hotel.slug,
    hotelSiteUrl: override.hotelSiteUrl || HOTEL_SITE_BY_GUIDE[hotel.slug],
    brandLogoUrl,
    ...theme,
    ...override,
    headingFontFamily: override.headingFontFamily || "Arial, Helvetica, sans-serif",
    bodyFontFamily: override.bodyFontFamily || "Arial, Helvetica, sans-serif",
    eyebrow: override.eyebrow || "Your local karaoke guide",
    headline: override.headline || "Looking for somewhere to sing tonight?",
    intro:
      override.intro ||
      `Start with what is happening now, find a place that matches your vibe, or pick an easy option for food and a mic. SingHUB keeps the local karaoke information current for guests of ${hotel.name}.`,
  };
}

/**
 * Every hotel guide automatically receives the shared Hotel Experience v1.2.
 * New hotel guide records therefore inherit the product without requiring a
 * second hand-built experience config.
 */
export const hotelExperienceConfigs: HotelExperienceConfig[] =
  hotelGuides.map(makeExperience);

const HOTEL_EXPERIENCE_ALIASES: Record<string, string> = {
  holidayinnexpresslamesa: "holiday-inn-express-la-mesa",
};

export function getHotelExperienceConfig(slug: string) {
  const canonicalSlug = HOTEL_EXPERIENCE_ALIASES[slug] || slug;
  const experience = hotelExperienceConfigs.find((item) => item.slug === canonicalSlug);
  if (!experience) return undefined;
  return slug === canonicalSlug ? experience : { ...experience, slug };
}
