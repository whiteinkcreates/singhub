import type { HotelGuide } from "@/lib/hotelGuides";

export type HotelExperienceConfig = {
  slug: string;
  hotelGuideSlug: HotelGuide["slug"];
  hotelSiteUrl: string;
  brandLogoUrl: string;
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

export const hotelExperienceConfigs: HotelExperienceConfig[] = [
  {
    slug: "holidayinnexpresslamesa",
    hotelGuideSlug: "holiday-inn-express-la-mesa",
    hotelSiteUrl:
      "https://www.ihg.com/holidayinnexpress/hotels/us/en/la-mesa/sanpd/hoteldetail",
    brandLogoUrl:
      "https://development.ihg.com/sites/ihgplc/files/IHG/americas/logo/holiday-inn-express-logo-img.png",
    primaryColor: "#003B70",
    accentColor: "#68B231",
    pageBackground: "#F7F9FC",
    surfaceColor: "#FFFFFF",
    textColor: "#0A2D5A",
    mutedTextColor: "#52677D",
    headingFontFamily: "Arial, Helvetica, sans-serif",
    bodyFontFamily: "Arial, Helvetica, sans-serif",
    eyebrow: "Your local karaoke guide",
    headline: "Looking for somewhere to sing tonight?",
    intro:
      "Start with what is happening now, find a place that matches your vibe, or pick an easy option for food and a mic. SingHUB keeps the local karaoke information current for guests of Holiday Inn Express La Mesa near SDSU.",
  },
];

export function getHotelExperienceConfig(slug: string) {
  return hotelExperienceConfigs.find((experience) => experience.slug === slug);
}
