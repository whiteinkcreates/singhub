import "server-only";
import { applyHotelPhoto } from "./hotelPhotoCandidates.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getHotelGuide } from "@/lib/hotelGuides";
import { GUEST_GUIDE_DEFAULTS_SLUG, parseGuestGuideLifestyleMedia, parseHotelMediaProfile, type GuestGuideLifestyleMedia, type HotelMediaProfile } from "@/lib/hotelProfiles";
// Last known curated guest-guide artwork, saved in SingHUB's media library.
// Resilience fallback only: Supabase global defaults and hotel overrides always win.
const CURATED_SECTION_FALLBACK: GuestGuideLifestyleMedia = {
  walkableImageUrl: "https://res.cloudinary.com/dy3lyejkk/image/upload/v1791305205/singhub/hotels/guest-guide-defaults/jsh5q2jgzkrype6ym2bs.jpg",
  walkableImageAlt: "Walkable Guest Guide lifestyle image",
  quickRideImageUrl: "https://res.cloudinary.com/dy3lyejkk/image/upload/v1791408735/singhub/hotels/guest-guide-defaults/yss9szag98ydni4ykv4b.png",
  quickRideImageAlt: "Quick Ride Guest Guide lifestyle image",
  standoutImageUrl: "https://res.cloudinary.com/dy3lyejkk/image/upload/v1791305212/singhub/hotels/guest-guide-defaults/aidfiq7ne9lk5al6ywxc.png",
  standoutImageAlt: "Local Standouts Guest Guide lifestyle image",
};

export async function getHotelMediaProfile(slug: string): Promise<HotelMediaProfile | null> {
  const { data, error } = await createAdminClient().from("hotel_profiles").select("media").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Hotel media could not be loaded: ${error.message}`);
  return data ? parseHotelMediaProfile(data.media) : null;
}
export async function getGuestGuideDefaults(): Promise<GuestGuideLifestyleMedia> {
  const { data, error } = await createAdminClient().from("hotel_profiles").select("media").eq("slug", GUEST_GUIDE_DEFAULTS_SLUG).maybeSingle();
  if (error) throw new Error(`Guest Guide defaults could not be loaded: ${error.message}`);
  return data ? parseGuestGuideLifestyleMedia(data.media) : {};
}
export async function saveGuestGuideDefaults(media: GuestGuideLifestyleMedia) {
  const parsed = parseGuestGuideLifestyleMedia(media);
  const { error } = await createAdminClient().from("hotel_profiles").upsert({ slug: GUEST_GUIDE_DEFAULTS_SLUG, media: parsed, updated_at: new Date().toISOString() });
  if (error) throw new Error(`Guest Guide defaults were not saved: ${error.message}`);
  return parsed;
}
function resolveLifestyle(defaults: GuestGuideLifestyleMedia, media: HotelMediaProfile | null): GuestGuideLifestyleMedia {
  return {
    walkableImageUrl: media?.walkableImageUrl || defaults.walkableImageUrl || CURATED_SECTION_FALLBACK.walkableImageUrl,
    walkableImageAlt: media?.walkableImageUrl ? (media.walkableImageAlt || CURATED_SECTION_FALLBACK.walkableImageAlt) : defaults.walkableImageAlt || CURATED_SECTION_FALLBACK.walkableImageAlt,
    walkableImagePlacement: media?.walkableImageUrl ? media.walkableImagePlacement : defaults.walkableImagePlacement,
    quickRideImageUrl: media?.quickRideImageUrl || defaults.quickRideImageUrl || CURATED_SECTION_FALLBACK.quickRideImageUrl,
    quickRideImageAlt: media?.quickRideImageUrl ? (media.quickRideImageAlt || CURATED_SECTION_FALLBACK.quickRideImageAlt) : defaults.quickRideImageAlt || CURATED_SECTION_FALLBACK.quickRideImageAlt,
    quickRideImagePlacement: media?.quickRideImageUrl ? media.quickRideImagePlacement : defaults.quickRideImagePlacement,
    standoutImageUrl: media?.standoutImageUrl || defaults.standoutImageUrl || CURATED_SECTION_FALLBACK.standoutImageUrl,
    standoutImageAlt: media?.standoutImageUrl ? (media.standoutImageAlt || CURATED_SECTION_FALLBACK.standoutImageAlt) : defaults.standoutImageAlt || CURATED_SECTION_FALLBACK.standoutImageAlt,
    standoutImagePlacement: media?.standoutImageUrl ? media.standoutImagePlacement : defaults.standoutImagePlacement,
  };
}
export async function getHotelGuideMediaBundle(slug:string,demo=false){
  const hotel=getHotelGuide(slug);if(!hotel)return null;
  try{
    const [media, defaults] = await Promise.all([getHotelMediaProfile(slug), getGuestGuideDefaults()]);
    const lifestyle = resolveLifestyle(defaults, media);
    return {hotel:applyHotelPhoto(media?{...hotel,heroImageUrl:media.heroImageUrl,heroAlt:media.heroAlt,heroPosition:media.heroPosition,heroPlacement:media.heroPlacement}:hotel,demo),media:media ? {...media,...lifestyle} : {...lifestyle}};
  }catch(error){console.error("Hotel media read failed; using registered guide",error);return {hotel:applyHotelPhoto(hotel,demo),media:resolveLifestyle({}, null)};}
}
export async function getHotelGuideWithMedia(slug: string, demo = false) { return (await getHotelGuideMediaBundle(slug,demo))?.hotel || null; }
export async function saveHotelMediaProfile(slug: string, media: HotelMediaProfile) {
  const { error } = await createAdminClient().from("hotel_profiles").upsert({ slug, media, updated_at: new Date().toISOString() });
  if (error) throw new Error(`Hotel media was not saved: ${error.message}`);
}
