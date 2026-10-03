import {parseImagePlacement,type ResponsiveImagePlacement} from './imagePlacement';
import type { HeroPosition } from "@/lib/venueEnhancements";
export type HotelPackageReview = { heroImageUrl:string; heroApproved:boolean; brandLogoUrl:string; brandApproved:boolean; rightsNote:string; brandNote:string; reviewedAt:string };
export type HotelMediaProfile = {
  packageReview?: HotelPackageReview;
  heroImageUrl: string;
  heroAlt: string;
  heroPosition?: HeroPosition;
  heroPlacement?: ResponsiveImagePlacement;
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
  let packageReview:HotelPackageReview|undefined;
  if(value.packageReview!==undefined){
    const review=value.packageReview as Record<string,unknown>;
    if(!review||typeof review!=="object"||typeof review.heroApproved!=="boolean"||typeof review.brandApproved!=="boolean")throw new Error("Invalid package review.");
    for(const key of ["heroImageUrl","brandLogoUrl","rightsNote","brandNote","reviewedAt"])if(typeof review[key]!=="string"||(review[key] as string).length>2048)throw new Error("Invalid package review field.");
    if(review.heroApproved&&(!(review.rightsNote as string).trim()||review.heroImageUrl!==heroImageUrl))throw new Error("Record permission for the selected property photo.");
    if(review.brandApproved&&!(review.brandNote as string).trim())throw new Error("Record approval for the hotel branding.");
    packageReview={heroImageUrl:review.heroImageUrl as string,heroApproved:review.heroApproved,brandLogoUrl:review.brandLogoUrl as string,brandApproved:review.brandApproved,rightsNote:(review.rightsNote as string).trim(),brandNote:(review.brandNote as string).trim(),reviewedAt:new Date().toISOString()};
  }
  const profile = { packageReview, heroImageUrl, heroPlacement:parseImagePlacement(value.heroPlacement), ...(heroPosition === undefined ? {} : { heroPosition: heroPosition as HeroPosition }), heroAlt: text("heroAlt", 300), imageSource: text("imageSource", 2048), usageRights: text("usageRights", 2000) };
  if (heroImageUrl && !profile.heroAlt) throw new Error("Describe the selected image for accessibility.");
  return profile;
}
