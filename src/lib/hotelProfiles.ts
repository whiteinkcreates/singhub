import type { HeroPosition } from "@/lib/venueEnhancements";
export type HotelMediaProfile = {
  heroImageUrl: string;
  heroAlt: string;
  heroPosition?: HeroPosition;
  imageSource: string;
  usageRights: string;
};
export function parseHotelMediaProfile(input: unknown): HotelMediaProfile {
  if (!input || typeof input !== "object") throw new Error("Hotel media settings are required.");
  const value = input as Record<string, unknown>;
  const text = (key: string, limit: number) => {
    if (typeof value[key] !== "string" || value[key].length > limit) throw new Error(`Invalid ${key}.`);
    return value[key].trim() as string;
  };
  const heroImageUrl = text("heroImageUrl", 2048);
  if (heroImageUrl) {
    const url = new URL(heroImageUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Image URL must use HTTP or HTTPS.");
  }
  const heroPosition = value.heroPosition;
  if (heroPosition !== undefined && !["center", "top", "bottom", "left", "right"].includes(String(heroPosition))) throw new Error("Invalid hero focal point.");
  const profile = { heroImageUrl, ...(heroPosition === undefined ? {} : { heroPosition: heroPosition as HeroPosition }), heroAlt: text("heroAlt", 300), imageSource: text("imageSource", 2048), usageRights: text("usageRights", 2000) };
  if (heroImageUrl && !profile.heroAlt) throw new Error("Describe the selected image for accessibility.");
  return profile;
}
