import "server-only";
import { applyHotelPhoto } from "./hotelPhotoCandidates.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getHotelGuide } from "@/lib/hotelGuides";
import { GUEST_GUIDE_DEFAULTS_SLUG, parseGuestGuideLifestyleMedia, parseHotelMediaProfile, type GuestGuideLifestyleMedia, type HotelMediaProfile } from "@/lib/hotelProfiles";
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
    walkableImageUrl: media?.walkableImageUrl || defaults.walkableImageUrl || "",
    walkableImageAlt: media?.walkableImageUrl ? media.walkableImageAlt : defaults.walkableImageAlt || "",
    walkableImagePlacement: media?.walkableImageUrl ? media.walkableImagePlacement : defaults.walkableImagePlacement,
    quickRideImageUrl: media?.quickRideImageUrl || defaults.quickRideImageUrl || "",
    quickRideImageAlt: media?.quickRideImageUrl ? media.quickRideImageAlt : defaults.quickRideImageAlt || "",
    quickRideImagePlacement: media?.quickRideImageUrl ? media.quickRideImagePlacement : defaults.quickRideImagePlacement,
    standoutImageUrl: media?.standoutImageUrl || defaults.standoutImageUrl || "",
    standoutImageAlt: media?.standoutImageUrl ? media.standoutImageAlt : defaults.standoutImageAlt || "",
    standoutImagePlacement: media?.standoutImageUrl ? media.standoutImagePlacement : defaults.standoutImagePlacement,
  };
}
export async function getHotelGuideMediaBundle(slug:string,demo=false){
  const hotel=getHotelGuide(slug);if(!hotel)return null;
  try{
    const [media, defaults] = await Promise.all([getHotelMediaProfile(slug), getGuestGuideDefaults()]);
    const lifestyle = resolveLifestyle(defaults, media);
    return {hotel:applyHotelPhoto(media?{...hotel,heroImageUrl:media.heroImageUrl,heroAlt:media.heroAlt,heroPosition:media.heroPosition,heroPlacement:media.heroPlacement}:hotel,demo),media:media ? {...media,...lifestyle} : {...lifestyle}};
  }catch(error){console.error("Hotel media read failed; using registered guide",error);return {hotel:applyHotelPhoto(hotel,demo),media:null};}
}
export async function getHotelGuideWithMedia(slug: string, demo = false) { return (await getHotelGuideMediaBundle(slug,demo))?.hotel || null; }
export async function saveHotelMediaProfile(slug: string, media: HotelMediaProfile) {
  const { error } = await createAdminClient().from("hotel_profiles").upsert({ slug, media, updated_at: new Date().toISOString() });
  if (error) throw new Error(`Hotel media was not saved: ${error.message}`);
}
