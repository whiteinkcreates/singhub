import {parseImagePlacement,type ResponsiveImagePlacement} from './imagePlacement';
import type { HeroPosition } from "@/lib/venueEnhancements";
export type HotelPackageReview = { heroImageUrl:string; heroApproved:boolean; brandLogoUrl:string; brandApproved:boolean; rightsNote:string; brandNote:string; reviewedAt:string };
export const GUEST_GUIDE_DEFAULTS_SLUG = "guest-guide-defaults";
export type GuestGuideLifestyleMedia = {
  walkableImageUrl?: string;
  walkableImageAlt?: string;
  walkableImagePlacement?: ResponsiveImagePlacement;
  quickRideImageUrl?: string;
  quickRideImageAlt?: string;
  quickRideImagePlacement?: ResponsiveImagePlacement;
  standoutImageUrl?: string;
  standoutImageAlt?: string;
  standoutImagePlacement?: ResponsiveImagePlacement;
};

export function parseGuestGuideLifestyleMedia(input: unknown): GuestGuideLifestyleMedia {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const text = (key: string, limit: number) => {
    const raw = value[key];
    if (raw === undefined || raw === null || raw === "") return "";
    if (typeof raw !== "string" || raw.length > limit) throw new Error(`Invalid ${key}.`);
    return raw.trim();
  };
  const urlText = (key: string) => {
    const result = text(key, 2048);
    if (!result) return "";
    const url = new URL(result);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Image URL must use HTTP or HTTPS.");
    return result;
  };
  const result: GuestGuideLifestyleMedia = {
    walkableImageUrl: urlText("walkableImageUrl"),
    walkableImageAlt: text("walkableImageAlt", 300),
    walkableImagePlacement: parseImagePlacement(value.walkableImagePlacement),
    quickRideImageUrl: urlText("quickRideImageUrl"),
    quickRideImageAlt: text("quickRideImageAlt", 300),
    quickRideImagePlacement: parseImagePlacement(value.quickRideImagePlacement),
    standoutImageUrl: urlText("standoutImageUrl"),
    standoutImageAlt: text("standoutImageAlt", 300),
    standoutImagePlacement: parseImagePlacement(value.standoutImagePlacement),
  };
  if (result.walkableImageUrl && !result.walkableImageAlt) throw new Error("Describe the Walkable image for accessibility.");
  if (result.quickRideImageUrl && !result.quickRideImageAlt) throw new Error("Describe the Quick Ride image for accessibility.");
  if (result.standoutImageUrl && !result.standoutImageAlt) throw new Error("Describe the Local Standouts image for accessibility.");
  return result;
}
export type HotelMediaProfile = {
  packageReview?: HotelPackageReview;
  heroImageUrl: string;
  heroAlt: string;
  heroPosition?: HeroPosition;
  heroPlacement?: ResponsiveImagePlacement;
  imageSource: string;
  usageRights: string;
  walkableImageUrl?: string;
  walkableImageAlt?: string;
  walkableImagePlacement?: ResponsiveImagePlacement;
  quickRideImageUrl?: string;
  quickRideImageAlt?: string;
  quickRideImagePlacement?: ResponsiveImagePlacement;
  standoutImageUrl?: string;
  standoutImageAlt?: string;
  standoutImagePlacement?: ResponsiveImagePlacement;
};
export function parseHotelMediaProfile(input: unknown): HotelMediaProfile {
  if (!input || typeof input !== "object") throw new Error("Hotel media settings are required.");
  const value = input as Record<string, unknown>;
  const text = (key: string, limit: number, optional = false) => {
    if (value[key] === undefined && optional) return "";
    if (typeof value[key] !== "string" || (value[key] as string).length > limit) throw new Error(`Invalid ${key}.`);
    return (value[key] as string).trim();
  };
  const urlText = (key: string, optional = false) => {
    const result = text(key, 2048, optional);
    if (!result) return "";
    const url = new URL(result);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Image URL must use HTTP or HTTPS.");
    return result;
  };
  const heroImageUrl = urlText("heroImageUrl");
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
  const profile:HotelMediaProfile = {
    packageReview, heroImageUrl, heroPlacement:parseImagePlacement(value.heroPlacement), ...(heroPosition === undefined ? {} : { heroPosition: heroPosition as HeroPosition }),
    heroAlt:text("heroAlt",300), imageSource:text("imageSource",2048), usageRights:text("usageRights",2000),
    walkableImageUrl:urlText("walkableImageUrl",true), walkableImageAlt:text("walkableImageAlt",300,true), walkableImagePlacement:parseImagePlacement(value.walkableImagePlacement),
    quickRideImageUrl:urlText("quickRideImageUrl",true), quickRideImageAlt:text("quickRideImageAlt",300,true), quickRideImagePlacement:parseImagePlacement(value.quickRideImagePlacement),
    standoutImageUrl:urlText("standoutImageUrl",true), standoutImageAlt:text("standoutImageAlt",300,true), standoutImagePlacement:parseImagePlacement(value.standoutImagePlacement)
  };
  if (heroImageUrl && !profile.heroAlt) throw new Error("Describe the selected image for accessibility.");
  if (profile.walkableImageUrl && !profile.walkableImageAlt) throw new Error("Describe the Walkable image for accessibility.");
  if (profile.quickRideImageUrl && !profile.quickRideImageAlt) throw new Error("Describe the Quick Ride image for accessibility.");
  if (profile.standoutImageUrl && !profile.standoutImageAlt) throw new Error("Describe the Local Standouts image for accessibility.");
  return profile;
}
